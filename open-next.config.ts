import type { NextConfig } from "next";
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const baseConfig = defineCloudflareConfig();

const config: NextConfig = {
  ...baseConfig,
  workers: {
    default: {
      bindings: {
        kvNamespaces: [
          { binding: "ROUTE_CONFIG_KV", id: "1234567893" },
          { binding: "SESSION_DATA_KV", id: "1234567890" },
          { binding: "USER_DATA_KV", id: "1234567891" },
        ],
        assets: [
          {
            binding: "ASSETS",
            directory: ".open-next/assets",
          },
        ],
      },
    },
  },
};

export default config;
