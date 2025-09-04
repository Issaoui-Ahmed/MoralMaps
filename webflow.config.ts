import { defineConfig } from '@webflow/cli';

export default defineConfig({
  project: 'moral-map',
  dev: {
    command: 'npm run start',
    port: 3000,
  },
  build: {
    command: 'npm run build',
    output: 'client/build',
  },
  assets: ['client/public', 'admin/public'],
  api: {
    directory: 'server',
  },
});
