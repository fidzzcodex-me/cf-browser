"use strict";

const { connectBrowser }                              = require("../engine-browser");
const { log, sleep, formatCookie, safeGoto, waitCfClearance } = require("../wait");
const { getChallengeType, waitChallengeCleared, isChallengePage } = require("../detect");
const { saveSession }                                 = require("../session");

const wafSession = async (url, proxy) => {
  log("info", "Mode: waf-session", url);
  const { browser, page } = await connectBrowser(proxy);
  const captured = { headers: {}, status: null };

  page.on("response", async (res) => {
    try {
      if (res.url() === url || res.url() === url + "/") {
        captured.status = res.status();
        const h = { ...await res.request().headers() };
        delete h["content-type"];
        delete h["accept-encoding"];
        delete h["content-length"];
        captured.headers = h;
      }
    } catch {}
  });

  await safeGoto(page, url);
  const challengeType = await getChallengeType(page);
  if (challengeType !== "unknown") {
    log("info", `${challengeType.toUpperCase()} detected, waiting...`);
    await waitChallengeCleared(page, 60000);
    await sleep(2000);
  }

  let cfClearance = await waitCfClearance(page, 30000);
  if (!cfClearance) {
    log("warn", "No cf_clearance, reloading...");
    await safeGoto(page, url);
    await sleep(3000);
    cfClearance = await waitCfClearance(page, 30000);
  }

  const cookies     = await page.cookies().catch(() => []);
  const userAgent   = await page.evaluate(() => navigator.userAgent).catch(() => "");
  const title       = await page.title().catch(() => "");
  const finalUrl    = page.url();
  const cookieHeader = formatCookie(cookies);

  captured.headers["cookie"]      = cookieHeader;
  captured.headers["user-agent"]  = userAgent;

  const stillChallenge = await isChallengePage(page);
  await browser.close().catch(() => {});
  const success = !!cfClearance && !stillChallenge;
  log(success ? "success" : "warn", success ? "WAF session OK" : "WAF session incomplete");

  const result = { cookies, userAgent, cfClearance, headers: captured.headers, cookieHeader, title, finalUrl, success };
  saveSession(url, result);
  return result;
};

module.exports = wafSession;
