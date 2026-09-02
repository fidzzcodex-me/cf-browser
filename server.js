"use strict";

const express    = require("express");
const bodyParser = require("body-parser");
const fs         = require("fs");
const { engine, handlerMap } = require("./src/engine");
const { log, sleep }         = require("./src/wait");
const { SESSION_DIR, listSessions } = require("./src/session");

const app  = express();
const PORT = process.env.PORT || 2985;

app.use(bodyParser.json({ limit: "10mb" }));

app.get("/", (_, res) => {
  const sessionFiles = listSessions();
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@crzcode/browser — Bypass API</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0d1117; font-family: 'Inter', sans-serif; color: #e6edf3; padding: 40px 20px; min-height: 100vh; }
    .container { max-width: 1100px; margin: 0 auto; background: #161b22; border-radius: 16px; padding: 40px 50px; border: 1px solid #30363d; }
    h1 { font-size: 26px; font-weight: 700; color: #f0f6fc; display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
    h1 i { color: #58a6ff; }
    .subtitle { color: #8b949e; font-size: 14px; margin-bottom: 28px; border-bottom: 1px solid #21262d; padding-bottom: 16px; }
    .status-bar { display: flex; flex-wrap: wrap; gap: 14px 28px; background: #0d1117; border-radius: 10px; padding: 14px 20px; margin-bottom: 28px; border: 1px solid #21262d; }
    .status-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #c9d1d9; }
    .status-item i { color: #58a6ff; width: 18px; text-align: center; }
    .status-item .num { font-weight: 600; color: #f0f6fc; }
    .badge-online { background: #1a4429; color: #3fb950; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 12px; }
    h2 { font-size: 16px; font-weight: 600; color: #f0f6fc; margin: 24px 0 8px 0; display: flex; align-items: center; gap: 8px; }
    h2 i { color: #58a6ff; }
    pre { background: #0d1117; padding: 14px 18px; border-radius: 8px; overflow-x: auto; font-size: 13px; font-family: 'JetBrains Mono', 'Fira Code', monospace; color: #c9d1d9; border: 1px solid #21262d; white-space: pre-wrap; word-break: break-all; margin: 6px 0 12px 0; }
    .mode-grid { display: flex; flex-wrap: wrap; gap: 8px; margin: 6px 0 12px 0; }
    .mode-tag { background: #1f2937; color: #58a6ff; font-size: 12px; font-weight: 500; padding: 4px 12px; border-radius: 20px; border: 1px solid #30363d; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0 18px 0; font-size: 13px; }
    th { text-align: left; padding: 10px 8px; font-weight: 600; color: #8b949e; border-bottom: 1px solid #21262d; }
    td { padding: 10px 8px; border-bottom: 1px solid #161b22; color: #c9d1d9; }
    td i { color: #58a6ff; margin-right: 4px; }
    .yes { color: #3fb950; font-weight: 500; }
    .no  { color: #484f58; }
    .footer { margin-top: 32px; padding-top: 14px; border-top: 1px solid #21262d; font-size: 12px; color: #484f58; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
    @media (max-width: 700px) { .container { padding: 20px; } }
  </style>
</head>
<body>
<div class="container">
  <h1><i class="fas fa-cloud"></i> @crzcode/browser</h1>
  <div class="subtitle">Multi-Challenge Bypass Engine — Cloudflare · Turnstile · hCaptcha · DDoS-GUARD · Datadome</div>

  <div class="status-bar">
    <span class="status-item"><i class="fas fa-server"></i> Port: <span class="num">${PORT}</span></span>
    <span class="status-item"><i class="fas fa-circle" style="color:#3fb950;font-size:10px;"></i> Status: <span class="badge-online">ONLINE</span></span>
    <span class="status-item"><i class="fas fa-cubes"></i> Modes: <span class="num">${Object.keys(handlerMap).length}</span></span>
    <span class="status-item"><i class="fas fa-database"></i> Sessions: <span class="num">${sessionFiles.length}</span></span>
    <span class="status-item"><i class="fas fa-clock"></i> Uptime: <span class="num">${Math.floor(process.uptime())}s</span></span>
  </div>

  <h2><i class="fas fa-link"></i> Endpoint</h2>
  <pre>POST /bypass</pre>

  <h2><i class="fas fa-list"></i> Available Modes</h2>
  <div class="mode-grid">
    ${Object.keys(handlerMap).map((m) => `<span class="mode-tag">${m}</span>`).join("")}
  </div>

  <h2><i class="fas fa-terminal"></i> Example cURL</h2>
  <pre>curl -X POST http://localhost:${PORT}/bypass \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://target.com", "mode": "auto", "retry": 2}'</pre>

  <h2><i class="fas fa-table"></i> Mode Details</h2>
  <table>
    <tr><th>Mode</th><th>Description</th><th>Auto Detect</th></tr>
    <tr><td><i class="fas fa-magic"></i> auto</td><td>Auto detect + best handler</td><td class="yes">✓ Yes</td></tr>
    <tr><td><i class="fas fa-shield-alt"></i> turnstile-min</td><td>Turnstile with manual siteKey</td><td class="no">– No</td></tr>
    <tr><td><i class="fas fa-shield-alt"></i> turnstile-max</td><td>Turnstile auto-extract + hCaptcha</td><td class="yes">✓ Yes</td></tr>
    <tr><td><i class="fas fa-lock"></i> waf-session</td><td>WAF bypass — cookies + headers</td><td class="yes">✓ Yes</td></tr>
    <tr><td><i class="fas fa-code"></i> source</td><td>HTML source after challenge cleared</td><td class="yes">✓ Yes</td></tr>
    <tr><td><i class="fas fa-robot"></i> bot-protection</td><td>Datadome / Akamai / PerimeterX</td><td class="yes">✓ Yes</td></tr>
    <tr><td><i class="fas fa-database"></i> datadome</td><td>Datadome specific bypass</td><td class="yes">✓ Yes</td></tr>
    <tr><td><i class="fas fa-shield"></i> ddos-guard</td><td>DDoS-GUARD bypass</td><td class="yes">✓ Yes</td></tr>
    <tr><td><i class="fas fa-circle-notch"></i> hcaptcha</td><td>hCaptcha fake-page injection solver</td><td class="yes">✓ Yes</td></tr>
  </table>

  <div class="footer">
    <span><i class="fas fa-bolt"></i> @crzcode/browser v2.2.0</span>
    <span><i class="fas fa-code-branch"></i> github.com/fidzzcodex-me/crzcode-browser</span>
  </div>
</div>
</body>
</html>`);
});

app.post("/bypass", async (req, res) => {
  const { url, proxy, mode = "auto", retry = 2, siteKey } = req.body;
  if (!url) return res.status(400).json({ error: "Missing url" });
  if (mode === "turnstile-min" && !siteKey) {
    return res.status(400).json({ error: "Missing siteKey for turnstile-min mode" });
  }

  log("info", "Request", `[${mode}] ${url}`);

  let lastError = null;
  for (let i = 0; i <= retry; i++) {
    try {
      log("info", `Attempt ${i + 1}/${retry + 1}`);
      const result = await engine({ url, mode, proxy, siteKey });
      if (result.success) {
        log("success", "Done", result.cfClearance?.slice(0, 25) ?? result.token?.slice(0, 25) ?? "ok");
        return res.json({ success: true, mode, ...result });
      }
      log("warn", `Attempt ${i + 1} incomplete`);
      if (i < retry) await sleep(3000 * (i + 1));
    } catch (e) {
      lastError = e.message;
      log("error", e.message);
      if (i < retry) await sleep(3000 * (i + 1));
    }
  }

  res.status(500).json({ success: false, error: lastError || "All attempts failed" });
});

app.get("/health", (_, res) => {
  res.json({
    status:  "ok",
    port:    PORT,
    uptime:  process.uptime(),
    memory:  process.memoryUsage(),
    modes:   Object.keys(handlerMap),
    sessions: listSessions().length,
  });
});

app.use((_, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => {
  log("info", `@crzcode/browser Bypass API running on port ${PORT}`);
  log("info", "Modes: " + Object.keys(handlerMap).join(" | "));
  log("info", `Landing: http://localhost:${PORT}`);
});
