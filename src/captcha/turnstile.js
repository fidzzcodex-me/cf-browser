"use strict";

const { sleep } = require("../utils");

const SOLVE_TIMEOUT_MS = 5000;
const LOOP_INTERVAL_MS = 1000;

const checkTurnstile = ({ page }) => {
  return new Promise(async (resolve) => {
    const timer = setTimeout(() => resolve(false), SOLVE_TIMEOUT_MS);

    try {
      const responseEls = await page.$$('[name="cf-turnstile-response"]');

      if (responseEls.length > 0) {
        for (const el of responseEls) {
          try {
            const parent = await el.evaluateHandle((n) => n.parentElement);
            const box    = await parent.boundingBox();
            if (!box) continue;
            await page.mouse.click(box.x + 30, box.y + box.height / 2);
          } catch {}
        }
        clearTimeout(timer);
        return resolve(true);
      }

      const coords = await page.evaluate(() => {
        const strict = [];
        const loose  = [];

        document.querySelectorAll("div").forEach((el) => {
          try {
            const r   = el.getBoundingClientRect();
            const css = window.getComputedStyle(el);
            if (r.width > 290 && r.width <= 310 && !el.querySelector("*")) {
              if (css.margin === "0px" && css.padding === "0px") {
                strict.push({ x: r.x, y: r.y, w: r.width, h: r.height });
              } else {
                loose.push({ x: r.x, y: r.y, w: r.width, h: r.height });
              }
            }
          } catch {}
        });

        return strict.length > 0 ? strict : loose;
      });

      for (const coord of coords) {
        try {
          await page.mouse.click(coord.x + 30, coord.y + coord.h / 2);
        } catch {}
      }

      clearTimeout(timer);
      resolve(true);
    } catch {
      clearTimeout(timer);
      resolve(false);
    }
  });
};

const turnstileSolverLoop = async (page, activeRef) => {
  while (activeRef.active) {
    await checkTurnstile({ page }).catch(() => {});
    await sleep(LOOP_INTERVAL_MS);
  }
};

module.exports = { checkTurnstile, turnstileSolverLoop };
