"use strict";

const { connect } = require("./browser");
const { log }     = require("./wait");

const connectBrowser = async (proxy = null) => {
  const opts = {
    headless:    false,
    turnstile:   true,
    tf:          true,
    fingerprint: true,
    args: [
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-gpu",
      "--disable-accelerated-2d-canvas",
      "--disable-accelerated-jpeg-decoding",
    ],
    connectOption: { defaultViewport: null },
  };

  if (proxy) {
    if (Array.isArray(proxy)) {
      const rand = proxy[Math.floor(Math.random() * proxy.length)];
      opts.proxy = { host: rand.host, port: rand.port, username: rand.username, password: rand.password };
      log("info", "Proxy rotation", `${proxy.length} proxies`);
    } else {
      opts.proxy = { host: proxy.host, port: proxy.port, username: proxy.username, password: proxy.password };
      log("info", "Proxy", `${proxy.host}:${proxy.port}`);
    }
  }

  return connect(opts);
};

module.exports = { connectBrowser };
