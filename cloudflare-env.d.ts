/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  ROUTE_CONFIG_KV?: KVNamespace;
  SESSION_DATA_KV?: KVNamespace;
  USER_DATA_KV?: KVNamespace;
}
