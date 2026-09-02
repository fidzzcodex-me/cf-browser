"use strict";

const { connectBrowser }  = require("../engine-browser");
const { log }             = require("../wait");
const { getChallengeType } = require("../detect");

const turnstileMax    = require("./turnstileMax");
const hCaptchaSolver  = require("./hcaptcha");
const datadomeTest    = require("./datadome");
const ddosGuardBypass = require("./ddosGuard");
const wafSession      = require("./wafSession");

const autoMode = async (url, proxy) => {
  log("info", "Mode: auto (auto-detect)", url);

  const { browser, page } = await connectBrowser(proxy);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  const challengeType = await getChallengeType(page);
  log("info", `Detected: ${challengeType.toUpperCase()}`, "");

  await browser.close().catch(() => {});

  switch (challengeType) {
    case "turnstile":   return turnstileMax(url, proxy);
    case "hcaptcha":    return hCaptchaSolver(url, proxy);
    case "datadome":    return datadomeTest(url, proxy);
    case "ddos-guard":  return ddosGuardBypass(url, proxy);
    case "cloudflare":
    case "perimeterx":
    case "akamai":
    default:            return wafSession(url, proxy);
  }
};

module.exports = autoMode;
