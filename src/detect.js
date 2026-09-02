"use strict";

const { log, sleep } = require("./wait");

const detectChallengeType = (title, url, body) => {
  const combined = (title + " " + url + " " + body).toLowerCase();
  if (combined.includes("turnstile") || combined.includes("cf-"))           return "turnstile";
  if (combined.includes("hcaptcha")  || combined.includes("h-captcha"))     return "hcaptcha";
  if (combined.includes("datadome"))                                          return "datadome";
  if (combined.includes("ddos-guard"))                                        return "ddos-guard";
  if (combined.includes("perimeterx") || combined.includes("px"))            return "perimeterx";
  if (combined.includes("akamai")     || combined.includes("ak_bmsc"))       return "akamai";
  if (combined.includes("just a moment") || combined.includes("checking your browser")) return "cloudflare";
  return "unknown";
};

const getChallengeType = async (page) => {
  try {
    const title = (await page.title()).toLowerCase();
    const url   = page.url();
    const body  = await page.evaluate(() => document.body?.innerText || "").catch(() => "");
    return detectChallengeType(title, url, body);
  } catch {
    return "unknown";
  }
};

const isChallengePage = async (page) => {
  const type = await getChallengeType(page);
  return type !== "unknown";
};

const waitChallengeCleared = async (page, maxMs = 60000) => {
  const start   = Date.now();
  let lastType  = "unknown";
  while (Date.now() - start < maxMs) {
    await sleep(1500);
    const type = await getChallengeType(page);
    if (type === "unknown") {
      log("success", `Challenge cleared (${lastType})`);
      return true;
    }
    lastType = type;
    const elapsed = Math.round((Date.now() - start) / 1000);
    if (elapsed % 6 === 0) log("info", `${type.toUpperCase()} active... ${elapsed}s`);
  }
  return false;
};

module.exports = { detectChallengeType, getChallengeType, isChallengePage, waitChallengeCleared };
