"use strict";

const { spawn } = require("child_process");

let XvfbClass = null;
try { XvfbClass = require("xvfb"); } catch {}

let _session = null;

const createVirtualDisplay = (width = 1920, height = 1080, depth = 24) => {
  if (process.platform !== "linux") return null;
  if (_session) return _session;

  if (XvfbClass) {
    try {
      const xvfb = new XvfbClass({
        silent: true,
        xvfb_args: ["-screen", "0", `${width}x${height}x${depth}`, "-ac"],
      });
      xvfb.startSync();
      _session = { type: "xvfb", handle: xvfb };
      return _session;
    } catch {}
  }

  try {
    const num  = 99;
    const proc = spawn(
      "Xvfb",
      [`:${num}`, "-screen", "0", `${width}x${height}x${depth}`, "-ac", "+extension", "GLX", "+render", "-noreset"],
      { stdio: "ignore", detached: false }
    );
    proc.on("error", () => {});
    process.env["DISPLAY"] = `:${num}`;
    _session = { type: "spawn", handle: proc };
    return _session;
  } catch {
    console.log("[crzcode/browser] no virtual display available — browser may be captured");
    return null;
  }
};

const destroyVirtualDisplay = (session) => {
  if (!session) return;
  try {
    if (session.type === "xvfb")  session.handle.stopSync();
    if (session.type === "spawn") session.handle.kill("SIGKILL");
  } catch {}
  _session = null;
};

module.exports = { createVirtualDisplay, destroyVirtualDisplay };
