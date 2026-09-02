"use strict";

const { connectBrowser }                              = require("../engine-browser");
const { log, sleep, formatCookie, safeGoto, waitCfClearance } = require("../wait");
const { getChallengeType, waitChallengeCleared }      = require("../detect");
const { saveSession }                                 = require("../session");

const modeSource = async (url, proxy) => {
  log("info", "Mode: source", url);
  const { browser, page } = await connectBrowser(proxy);

  await safeGoto(page, url);
  const challengeType = await getChallengeType(page);
  if (challengeType !== "unknown") {
    log("info", `${challengeType.toUpperCase()} detected, waiting...`);
    await waitChallengeCleared(page, 45000);
    await sleep(2000);
  }

  const cfClearance  = await waitCfClearance(page, 30000);
  const cookies      = await page.cookies().catch(() => []);
  const userAgent    = await page.evaluate(() => navigator.userAgent).catch(() => "");
  const html         = await page.content().catch(() => "");
  const title        = await page.title().catch(() => "");
  const finalUrl     = page.url();
  const cookieHeader = formatCookie(cookies);

  await browser.close().catch(() => {});
  const result = { cookies, userAgent, cfClearance, html, title, finalUrl, cookieHeader, success: !!cfClearance };
  saveSession(url, result);
  return result;
};

module.exports = modeSource;
