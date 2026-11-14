/**
 * Starts the server. In production it also serves the built web app (apps/web/dist),
 * so one service hosts both. Run `npm run build` first for that.
 */
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { existsSync } from 'node:fs';
import { relative } from 'node:path';
import { createApp } from './app.ts';
import { CONFIG } from './config.ts';
import { openDatabase } from './db/connection.ts';

export type { AppType } from './app.ts';

const db = await openDatabase(CONFIG.dbPath);
const app = createApp(db);

if (existsSync(CONFIG.webDistDir)) {
  // serveStatic resolves `root` against the working directory.
  const root = relative(process.cwd(), CONFIG.webDistDir);
  app.use('/*', serveStatic({ root }));
  // Single-page app: unknown non-API paths get index.html.
  app.get('*', serveStatic({ root, path: 'index.html' }));
}

serve({ fetch: app.fetch, port: CONFIG.port }, (info) => {
  console.log(`Server listening on http://localhost:${info.port}`);
});
