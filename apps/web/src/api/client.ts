import type { AppType } from '@coach/server/app';
import { hc } from 'hono/client';

/** Typed API client. Same origin: Vite proxies /api in dev, the server serves the app in production. */
export const api = hc<AppType>('/').api;
