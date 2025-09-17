#!/usr/bin/env node
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import process from "node:process";

function parseArgs(argv) {
  const result = {
    env: undefined,
    configPath: undefined,
    cacheChunkSize: undefined,
    wranglerArgs: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--") {
      result.wranglerArgs.push(...argv.slice(i + 1));
      break;
    }

    if (arg === "--env" || arg === "-e") {
      if (i + 1 >= argv.length) {
        throw new Error("Missing value for --env option");
      }
      result.env = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith("--env=")) {
      result.env = arg.slice("--env=".length);
      continue;
    }

    if (arg === "--config" || arg === "--configPath" || arg === "-c") {
      if (i + 1 >= argv.length) {
        throw new Error("Missing value for --config option");
      }
      result.configPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith("--config=")) {
      result.configPath = arg.slice("--config=".length);
      continue;
    }
    if (arg.startsWith("--configPath=")) {
      result.configPath = arg.slice("--configPath=".length);
      continue;
    }

    if (
      arg === "--cacheChunkSize" ||
      arg === "--cache-chunk-size"
    ) {
      if (i + 1 >= argv.length) {
        throw new Error("Missing value for --cacheChunkSize option");
      }
      result.cacheChunkSize = Number(argv[i + 1]);
      i += 1;
      continue;
    }
    if (arg.startsWith("--cacheChunkSize=")) {
      result.cacheChunkSize = Number(arg.slice("--cacheChunkSize=".length));
      continue;
    }
    if (arg.startsWith("--cache-chunk-size=")) {
      result.cacheChunkSize = Number(arg.slice("--cache-chunk-size=".length));
      continue;
    }

    if (arg.startsWith("-")) {
      result.wranglerArgs.push(arg);
      continue;
    }

    result.wranglerArgs.push(arg);
  }

  if (
    result.cacheChunkSize !== undefined &&
    (Number.isNaN(result.cacheChunkSize) || result.cacheChunkSize <= 0)
  ) {
    throw new Error("--cacheChunkSize must be a positive number");
  }

  return result;
}

async function loadCompiledConfig(projectRoot) {
  const compiledConfigPath = path.join(
    projectRoot,
    ".open-next",
    ".build",
    "open-next.config.edge.mjs",
  );

  if (!existsSync(compiledConfigPath)) {
    throw new Error(
      "Could not find compiled OpenNext config. Run `opennextjs-cloudflare build` first.",
    );
  }

  const moduleUrl = pathToFileURL(compiledConfigPath).href;
  const mod = await import(moduleUrl);
  const config = mod?.default ?? mod;
  return config;
}

async function main() {
  try {
    const projectRoot = process.cwd();
    const cliRoot = path.join(
      projectRoot,
      "node_modules",
      "@opennextjs",
      "cloudflare",
      "dist",
      "cli",
    );

    const utilsModule = await import(
      pathToFileURL(path.join(cliRoot, "commands", "utils.js")).href
    );
    const populateModule = await import(
      pathToFileURL(path.join(cliRoot, "commands", "populate-cache.js")).href
    );
    const runWranglerModule = await import(
      pathToFileURL(path.join(cliRoot, "utils", "run-wrangler.js")).href
    );
    const ensureModule = await import(
      pathToFileURL(
        path.join(cliRoot, "build", "utils", "ensure-cf-config.js"),
      ).href
    );

    const { printHeaders, getNormalizedOptions, readWranglerConfig } = utilsModule;
    const { populateCache } = populateModule;
    const { runWrangler } = runWranglerModule;
    const { ensureCloudflareConfig } = ensureModule;

    const args = parseArgs(process.argv.slice(2));
    printHeaders("preview");

    const config = await loadCompiledConfig(projectRoot);
    ensureCloudflareConfig(config);
    const options = getNormalizedOptions(config, projectRoot);
    const wranglerConfig = readWranglerConfig({
      env: args.env,
      configPath: args.configPath,
    });

    await populateCache(options, config, wranglerConfig, {
      target: "local",
      environment: args.env,
      configPath: args.configPath,
      cacheChunkSize: args.cacheChunkSize,
    });

    runWrangler(options, ["dev", ...args.wranglerArgs], {
      target: "local",
      environment: args.env,
      configPath: args.configPath,
      logging: "all",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exitCode = 1;
  }
}

await main();
