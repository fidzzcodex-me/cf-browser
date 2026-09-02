"use strict";

const fs   = require("fs");
const path = require("path");
const { log } = require("./wait");

const SESSION_DIR = path.join(process.cwd(), "sessions");

if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

const saveSession = (url, data) => {
  try {
    const domain = new URL(url).hostname.replace(/[^a-zA-Z0-9]/g, "_");
    const file   = path.join(SESSION_DIR, `${domain}_${Date.now()}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    log("info", "Session saved", file);
  } catch {}
};

const listSessions = () => {
  try {
    return fs.readdirSync(SESSION_DIR).filter((f) => f.endsWith(".json"));
  } catch { return []; }
};

module.exports = { saveSession, listSessions, SESSION_DIR };
