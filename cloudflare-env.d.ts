/* eslint-disable */
// Simplified Cloudflare environment definitions that avoid duplicating the DOM lib.
// Generated initially by Wrangler via `wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts`.
// The full runtime type definitions have been replaced with targeted imports so that
// editors that already include the DOM library do not encounter duplicate global declarations.
import type { Fetcher, KVNamespace } from '@cloudflare/workers-types';

declare global {
  namespace Cloudflare {
    interface Env {
      ROUTE_CONFIG_KV: KVNamespace;
      SESSION_DATA_KV: KVNamespace;
      USER_DATA_KV: KVNamespace;
      WEBFLOW_SITE_ID: string;
      WEBFLOW_SITE_API_TOKEN: string;
      ASSETS: Fetcher;
    }
  }

  interface CloudflareEnv extends Cloudflare.Env {}
}

export {};
