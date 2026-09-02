"use strict";

const { connectBrowser }    = require("../engine-browser");
const { log, formatCookie } = require("../wait");
const { saveSession }       = require("../session");

const datadomeTest = async (url, proxy) => {
  log("info", "Mode: datadome-test", url);
  const { browser, page } = await connectBrowser(proxy);

  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  const check        = await page.waitForSelector("nav #navbarCollapse", { timeout: 15000 }).catch(() => null);
  const cookies      = await page.cookies().catch(() => []);
  const userAgent    = await page.evaluate(() => navigator.userAgent).catch(() => "");
  const html         = await page.content().catch(() => "");
  const title        = await page.title().catch(() => "");
  const cookieHeader = formatCookie(cookies);

  await browser.close().catch(() => {});
  const success = !!check;
  log(success ? "success" : "warn", success ? "Datadome bypass OK" : "Datadome bypass failed");

  const result = { cookies, userAgent, html, title, cookieHeader, success };
  saveSession(url, result);
  return result;
};

module.exports = datadomeTest;
