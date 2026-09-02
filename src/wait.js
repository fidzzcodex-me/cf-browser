"use strict";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ts = () => new Date().toISOString().replace("T", " ").slice(0, 19);

const C = {
  info:  "\x1b[36m",
  ok:    "\x1b[32m",
  warn:  "\x1b[33m",
  err:   "\x1b[31m",
  r:     "\x1b[0m",
};

const log = (lvl, msg, extra = "") => {
  const c = { info: C.info, success: C.ok, warn: C.warn, error: C.err }[lvl] ?? C.info;
  console.log(`${c}[${ts()}][${lvl.toUpperCase()}] ${msg} ${extra}${C.r}`);
};

const formatCookie = (cookies) =>
  cookies.map((c) => `${c.name}=${c.value}`).join("; ");

const safeGoto = async (page, url, opts = {}) => {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000, ...opts });
  } catch (e) {
    if (!e.message.includes("Navigation timeout")) log("warn", "goto:", e.message);
  }
};

const getCfClearance = async (page) => {
  const cookies = await page.cookies().catch(() => []);
  const cf = cookies.find((c) => c.name === "cf_clearance");
  return cf?.value?.length > 10 ? cf.value : null;
};

const waitCfClearance = async (page, maxMs = 30000) => {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    await sleep(1000);
    const cf = await getCfClearance(page);
    if (cf) return cf;
  }
  return null;
};

const waitToken = async (page, maxMs = 40000, selector = '[name="cf-response"]') => {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    await sleep(800);
    try {
      const token = await page.evaluate(
        (sel) => document.querySelector(sel)?.value ?? null,
        selector
      );
      if (token?.length > 10) return token;

      const fromTurnstile = await page.evaluate(() => {
        try { return window.turnstile?.getResponse() ?? null; } catch { return null; }
      });
      if (fromTurnstile?.length > 10) return fromTurnstile;

      const fromHCaptcha = await page.evaluate(() => {
        try { return window.hcaptcha?.getResponse() ?? null; } catch { return null; }
      });
      if (fromHCaptcha?.length > 10) return fromHCaptcha;
    } catch {}
  }
  return null;
};

module.exports = { sleep, log, formatCookie, safeGoto, getCfClearance, waitCfClearance, waitToken };
