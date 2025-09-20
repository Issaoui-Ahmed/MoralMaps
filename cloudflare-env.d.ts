// cloudflare-env.d.ts
/* eslint-disable */
import type { Fetcher, KVNamespace } from '@cloudflare/workers-types';

declare global {
  namespace Cloudflare {
    interface Env {
      ROUTE_CONFIG_KV: KVNamespace;
      SESSION_DATA_KV: KVNamespace;
      USER_DATA_KV: KVNamespace;
      WEBFLOW_SITE_ID: string;
      WEBFLOW_SITE_API_TOKEN: string;
      ASSETS?: Fetcher; // <-- was required; make optional
    }
  }

  interface CloudflareEnv extends Cloudflare.Env {}
}

export {};
