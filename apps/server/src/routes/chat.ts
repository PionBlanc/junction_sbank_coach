import type { DuckDBConnection } from '@duckdb/node-api';
import { customerParamSchema } from '@coach/shared';
import { zValidator } from '@hono/zod-validator';
import { safeValidateUIMessages } from 'ai';
import { Hono } from 'hono';
import { z } from 'zod';
import { streamCoachReply } from '../coach/chat.ts';

/** The AI SDK chat request. The messages themselves are checked by the SDK's own validator. */
const chatBodySchema = z.object({ messages: z.array(z.unknown()) });

export function chatRoutes(db: DuckDBConnection) {
  return new Hono().post(
    '/users/:id/chat',
    zValidator('param', customerParamSchema),
    zValidator('json', chatBodySchema),
    async (c) => {
      const validated = await safeValidateUIMessages({ messages: c.req.valid('json').messages });
      if (!validated.success) {
        return c.json({ error: 'Invalid chat messages' }, 400);
      }
      return streamCoachReply(db, c.req.valid('param').id, validated.data);
    },
  );
}
