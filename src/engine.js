"use strict";

const autoMode       = require("./modes/auto");
const turnstileMin   = require("./modes/turnstileMin");
const turnstileMax   = require("./modes/turnstileMax");
const wafSession     = require("./modes/wafSession");
const modeSource     = require("./modes/source");
const botProtection  = require("./modes/botProtection");
const datadome       = require("./modes/datadome");
const ddosGuard      = require("./modes/ddosGuard");
const hcaptcha       = require("./modes/hcaptcha");

const handlerMap = {
  "auto":           autoMode,
  "turnstile-min":  turnstileMin,
  "turnstile-max":  turnstileMax,
  "waf-session":    wafSession,
  "source":         modeSource,
  "bot-protection": botProtection,
  "datadome":       datadome,
  "ddos-guard":     ddosGuard,
  "hcaptcha":       hcaptcha,
};

const engine = async ({ url, mode = "auto", proxy = null, siteKey = null }) => {
  if (!url) throw new Error("Missing url");
  if (mode === "turnstile-min" && !siteKey) throw new Error("Missing siteKey for turnstile-min mode");
  const handler = handlerMap[mode] ?? autoMode;
  return handler(url, proxy, siteKey);
};

module.exports = { engine, handlerMap };
