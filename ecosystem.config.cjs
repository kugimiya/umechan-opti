const path = require('path');

const root = path.resolve(__dirname);

/** @type {import('pm2').StartOptions[]} */
module.exports = {
  apps: [
    {
      name: 'frontend',
      cwd: root,
      script: 'sh',
      args: [
        '-c',
        'pnpm --filter @umechan/shared run build && pnpm --filter umechan-opti run build && pnpm --filter umechan-opti run start',
      ],
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'backend',
      cwd: root,
      script: 'sh',
      args: [
        '-c',
        'pnpm --filter @umechan/shared run build && pnpm --filter epds run build && pnpm --filter epds run migrate && cd packages/backend && node --env-file=.env dist/index.js --no-tick-sync',
      ],
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'production' },
    },
  ],
};
