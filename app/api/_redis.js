import { createClient } from 'redis';

const createInMemoryRedis = () => {
  const store = new Map();

  return {
    json: {
      async get(key) {
        return store.has(key) ? store.get(key) : null;
      },
      async set(key, _path, value) {
        store.set(key, value);
        return 'OK';
      },
    },
    async expire(_key, _seconds) {
      return 1;
    },
  };
};

const connectRedis = async () => {
  const url = process.env.REDIS_URL;

  if (!url) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('REDIS_URL not set. Using in-memory Redis stub.');
    }
    return createInMemoryRedis();
  }

  const client = createClient({ url });
  client.on('error', (err) => {
    console.error('Redis client error:', err);
  });

  try {
    await client.connect();
    return client;
  } catch (err) {
    console.warn('Failed to connect to Redis. Falling back to in-memory stub.', err);
    return createInMemoryRedis();
  }
};

export const redis = await connectRedis();
