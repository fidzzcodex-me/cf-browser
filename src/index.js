"use strict";

const { connect, _pageController }                                   = require("./browser");
const { bypass }                                                     = require("./bypass");
const { engine, handlerMap }                                         = require("./engine");
const { applyPatches }                                               = require("./patches/runtime-fix");
const { injectStealthScripts }                                       = require("./stealth/fingerprint");
const { applyAll: applyEvasions }                                    = require("./stealth/evasions");
const { attachCursor, injectMousePatch }                             = require("./cursor");
const { interceptNetworkTokens, injectDOMHarvester, collectTokens }  = require("./captcha/harvester");
const { deepDetect }                                                 = require("./captcha/detector");
const { checkTurnstile, turnstileSolverLoop }                        = require("./captcha/turnstile");
const { solveRecaptchaV2Audio }                                      = require("./captcha/recaptcha");
const { solveAudioCaptcha }                                          = require("./captcha/stt");
const { createVirtualDisplay, destroyVirtualDisplay }                = require("./display");
const { log, sleep, formatCookie, safeGoto, waitCfClearance, waitToken, getCfClearance } = require("./wait");
const { detectChallengeType, getChallengeType, isChallengePage, waitChallengeCleared }   = require("./detect");
const { extractSiteKey, isUUID }                                     = require("./extract");
const { saveSession, listSessions, SESSION_DIR }                     = require("./session");
const { FAKE_TURNSTILE, FAKE_HCAPTCHA }                              = require("./pages");
const { connectBrowser }                                             = require("./engine-browser");

module.exports = {
  connect,
  bypass,
  engine,
  handlerMap,
  _pageController,
  applyPatches,
  injectStealthScripts,
  applyEvasions,
  attachCursor,
  injectMousePatch,
  interceptNetworkTokens,
  injectDOMHarvester,
  collectTokens,
  deepDetect,
  checkTurnstile,
  turnstileSolverLoop,
  solveRecaptchaV2Audio,
  solveAudioCaptcha,
  createVirtualDisplay,
  destroyVirtualDisplay,
  log,
  sleep,
  formatCookie,
  safeGoto,
  waitCfClearance,
  waitToken,
  getCfClearance,
  detectChallengeType,
  getChallengeType,
  isChallengePage,
  waitChallengeCleared,
  extractSiteKey,
  isUUID,
  saveSession,
  listSessions,
  SESSION_DIR,
  FAKE_TURNSTILE,
  FAKE_HCAPTCHA,
  connectBrowser,
};
