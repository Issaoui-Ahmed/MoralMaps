import { kv as vercelKv } from '@vercel/kv';

const REQUIRED_ENV_VARS = ['KV_REST_API_URL', 'KV_REST_API_TOKEN'];

function hasVercelKvConfiguration() {
  return REQUIRED_ENV_VARS.every((name) => {
    const value = process.env?.[name];
    return typeof value === 'string' && value.length > 0;
  });
}

export function getKvBinding() {
  if (!hasVercelKvConfiguration()) {
    return undefined;
  }

  return vercelKv;
}
