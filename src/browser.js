"use strict";

let puppeteer = require("rebrowser-puppeteer-core");
const kill    = require("tree-kill");

const { applyPatches }                          = require("./patches/runtime-fix");
const { injectStealthScripts }                  = require("./stealth/fingerprint");
const { applyAll: applyEvasions }               = require("./stealth/evasions");
const { attachCursor, injectMousePatch }        = require("./cursor");
const { checkTurnstile }                        = require("./captcha/turnstile");
const { createVirtualDisplay, destroyVirtualDisplay } = require("./display");

const EXTRA_FLAGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-renderer-backgrounding",
  "--disable-ipc-flooding-protection",
  "--no-first-run",
  "--lang=en-US",
  "--window-size=1280,800",
];

async function connect({
  args             = [],
  headless         = false,
  customConfig     = {},
  proxy            = {},
  turnstile        = false,
  connectOption    = {},
  disableXvfb      = false,
  plugins          = [],
  ignoreAllFlags   = false,
  tf               = false,
  fingerprint      = false,
  runtimeFixMode   = "addBinding",
  utilityWorldName = "util",
  sourceUrlMask    = "app.js",
  debug            = false,
  userAgent        = undefined,
  viewport         = { width: 1280, height: 720 },
} = {}) {
  const { launch: chromeLaunch, Launcher } = await import("chrome-launcher");

  if (headless === "auto") headless = false;

  applyPatches({ runtimeFixMode, utilityWorldName, sourceUrlMask, debug });

  let display = null;
  if (process.platform === "linux" && !disableXvfb && headless === false) {
    display = createVirtualDisplay(1920, 1080, 24);
  }

  let chromeFlags;
  if (ignoreAllFlags) {
    chromeFlags = [
      ...args,
      ...(headless !== false ? [`--headless=${headless}`] : []),
      ...(proxy?.host && proxy?.port ? [`--proxy-server=${proxy.host}:${proxy.port}`] : []),
    ];
  } else {
    const baseFlags = Launcher.defaultFlags();
    const dfIdx = baseFlags.findIndex((f) => f.startsWith("--disable-features"));
    if (dfIdx !== -1) baseFlags[dfIdx] = `${baseFlags[dfIdx]},AutomationControlled`;
    const cuIdx = baseFlags.findIndex((f) => f.startsWith("--disable-component-update"));
    if (cuIdx !== -1) baseFlags.splice(cuIdx, 1);
    chromeFlags = [
      ...baseFlags,
      ...EXTRA_FLAGS,
      ...args,
      ...(headless !== false ? [`--headless=${headless}`] : []),
      ...(proxy?.host && proxy?.port ? [`--proxy-server=${proxy.host}:${proxy.port}`] : []),
    ];
  }

  if (plugins.length > 0) {
    const { addExtra } = await import("puppeteer-extra");
    puppeteer = addExtra(puppeteer);
    for (const plugin of plugins) puppeteer.use(plugin);
  }

  const chrome = await chromeLaunch({
    ignoreDefaultFlags: true,
    chromeFlags,
    ...customConfig,
  });

  const browser = await puppeteer.connect({
    browserURL: `http://127.0.0.1:${chrome.port}`,
    ...connectOption,
  });

  const sharedConfig = {
    browser,
    proxy,
    turnstile,
    plugins,
    display,
    pid:         chrome.pid,
    chrome,
    tf,
    fingerprint,
    userAgent,
    viewport,
  };

  browser.on("disconnected", async () => {
    destroyVirtualDisplay(display);
    try { chrome.kill(); } catch {}
    try { kill(chrome.pid, "SIGKILL", () => {}); } catch {}
  });

  let [page] = await browser.pages();
  page = await _pageController({ ...sharedConfig, page, killProcess: true });

  browser.on("targetcreated", async (target) => {
    if (target.type() !== "page") return;
    const newPage = await target.page().catch(() => null);
    if (!newPage) return;
    await _pageController({ ...sharedConfig, page: newPage, killProcess: false }).catch(() => {});
  });

  return { browser, page };
}

async function _pageController({
  browser,
  page,
  proxy        = {},
  turnstile    = false,
  plugins      = [],
  display,
  pid,
  chrome,
  tf           = false,
  fingerprint  = false,
  killProcess  = false,
  userAgent,
  viewport,
} = {}) {
  let solveStatus = turnstile;

  page.on("close", () => { solveStatus = false; });

  browser.on("disconnected", async () => {
    solveStatus = false;
    if (killProcess) {
      destroyVirtualDisplay(display);
      try { if (chrome) chrome.kill(); } catch {}
      try { if (pid) kill(pid, "SIGKILL", () => {}); } catch {}
    }
  });

  async function turnstileSolver() {
    while (solveStatus) {
      await checkTurnstile({ page }).catch(() => {});
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  turnstileSolver();

  if (fingerprint || tf) {
    await injectStealthScripts(page);
    await applyEvasions(page, { userAgent, viewport, extraHeaders: true });
  }

  await injectMousePatch(page);

  if (proxy?.username && proxy?.password) {
    await page.authenticate({ username: proxy.username, password: proxy.password }).catch(() => {});
  }

  for (const plugin of plugins) {
    try { plugin.onPageCreated && plugin.onPageCreated(page); } catch {}
  }

  attachCursor(page);

  return page;
}

module.exports = { connect, _pageController, EXTRA_FLAGS };
