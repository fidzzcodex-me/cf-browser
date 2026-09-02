import type { Browser, Page } from "rebrowser-puppeteer-core";
import type { GhostCursor } from "ghost-cursor";

export function connect(options?: ConnectOptions): Promise<ConnectResult>;
export function bypass(url: string, options?: BypassOptions): Promise<BypassResult>;

export interface PageWithCursor extends Page {
  realClick: GhostCursor["click"];
  realCursor: GhostCursor;
}

export interface ConnectResult {
  browser: Browser;
  page: PageWithCursor;
}

export interface ConnectOptions {
  args?: string[];
  headless?: boolean | "auto";
  customConfig?: import("chrome-launcher").Options;
  proxy?: ProxyOptions;
  turnstile?: boolean;
  connectOption?: import("rebrowser-puppeteer-core").ConnectOptions;
  disableXvfb?: boolean;
  plugins?: any[];
  ignoreAllFlags?: boolean;
  tf?: boolean;
  fingerprint?: boolean;
  runtimeFixMode?: "addBinding" | "alwaysIsolated" | "enableDisable" | "0";
  utilityWorldName?: string;
  sourceUrlMask?: string;
  debug?: boolean;
  userAgent?: string;
  viewport?: { width: number; height: number };
}

export interface BypassOptions extends ConnectOptions {
  timeout?: number;
  waitAfter?: number;
  autoClose?: boolean;
  maxRetries?: number;
}

export interface BypassResult {
  bypassed: boolean;
  title: string;
  cfClearance: string | null;
  tokens: {
    recaptchaV2: string | null;
    recaptchaV3: string | null;
    hcaptcha: string | null;
    turnstile: string | null;
  };
  cookies: import("rebrowser-puppeteer-core").Cookie[];
  detection: DetectionResult | null;
  page: PageWithCursor | null;
  browser: Browser | null;
}

export interface DetectionResult {
  cloudflareUAM: boolean;
  turnstile: { sitekey: string | null; invisible: boolean };
  recaptcha: { sitekey: string | null; invisible: boolean; v3: boolean };
  hcaptcha: { sitekey: string | null; invisible: boolean };
}

export interface ProxyOptions {
  host: string;
  port: number;
  username?: string;
  password?: string;
}
