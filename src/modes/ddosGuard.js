"use strict";

const { connectBrowser }                              = require("../engine-browser");
const { log, sleep, formatCookie }                    = require("../wait");
const { getChallengeType, waitChallengeCleared, isChallengePage } = require("../detect");
const { saveSession }                                 = require("../session");

const ddosGuardBypass = async (url, proxy) => {
  log("info", "Mode: ddos-guard", url);
  const { browser, page } = await connectBrowser(proxy);

  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  const challengeType = await getChallengeType(page);
  if (challengeType !== "unknown") {
    log("info", `${challengeType.toUpperCase()} detected, waiting...`);
    await waitChallengeCleared(page, 60000);
    await sleep(2000);
  }

  const cookies      = await page.cookies().catch(() => []);
  const userAgent    = await page.evaluate(() => navigator.userAgent).catch(() => "");
  const html         = await page.content().catch(() => "");
  const title        = await page.title().catch(() => "");
  const finalUrl     = page.url();
  const cookieHeader = formatCookie(cookies);

  const stillChallenge = await isChallengePage(page);
  await browser.close().catch(() => {});
  const success = !stillChallenge;
  log(success ? "success" : "warn", success ? "DDoS-GUARD bypass OK" : "DDoS-GUARD bypass failed");

  const result = { cookies, userAgent, html, title, finalUrl, cookieHeader, success };
  saveSession(url, result);
  return result;
};

module.exports = ddosGuardBypass;
