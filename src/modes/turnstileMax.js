"use strict";

const { connectBrowser }                                              = require("../engine-browser");
const { log, sleep, formatCookie, safeGoto, waitCfClearance, waitToken } = require("../wait");
const { getChallengeType, waitChallengeCleared }                      = require("../detect");
const { extractSiteKey, isUUID }                                      = require("../extract");
const { FAKE_TURNSTILE, FAKE_HCAPTCHA }                               = require("../pages");
const { saveSession }                                                 = require("../session");

const turnstileMax = async (url, proxy) => {
  log("info", "Mode: turnstile-max", url);
  const { browser, page } = await connectBrowser(proxy);

  await safeGoto(page, url);
  const challengeType = await getChallengeType(page);
  if (challengeType !== "unknown") {
    log("info", `${challengeType.toUpperCase()} detected, waiting...`);
    await waitChallengeCleared(page, 45000);
    await sleep(1500);
  }

  const siteKey   = await extractSiteKey(page);
  log("info", "Auto sitekey:", siteKey);
  const isHCaptcha = isUUID(siteKey);

  await page.setRequestInterception(true);
  page.on("request", async (req) => {
    if (req.url() === url || req.url() === url + "/") {
      const body = isHCaptcha ? FAKE_HCAPTCHA(siteKey) : FAKE_TURNSTILE(siteKey);
      await req.respond({ status: 200, contentType: "text/html", body });
    } else {
      await req.continue().catch(() => {});
    }
  });

  await safeGoto(page, url);
  await sleep(2000);

  const selector    = isHCaptcha ? '[name="h-captcha-response"]' : '[name="cf-response"]';
  const token       = await waitToken(page, 40000, selector);
  const cfClearance = await waitCfClearance(page, 30000);
  const cookies     = await page.cookies().catch(() => []);
  const userAgent   = await page.evaluate(() => navigator.userAgent).catch(() => "");
  const cookieHeader = formatCookie(cookies);

  await browser.close().catch(() => {});
  const result = { cookies, userAgent, cfClearance, token, cookieHeader, siteKey, success: !!(token || cfClearance) };
  saveSession(url, result);
  return result;
};

module.exports = turnstileMax;
