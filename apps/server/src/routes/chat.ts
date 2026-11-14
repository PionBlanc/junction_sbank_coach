import type { DuckDBConnection } from '@duckdb/node-api';
import { customerParamSchema } from '@coach/shared';
import { zValidator } from '@hono/zod-validator';
import { safeValidateUIMessages } from 'ai';
import { Hono } from 'hono';
import { z } from 'zod';
import { streamCoachReply } from '../coach/chat.ts';

/** The AI SDK chat request. The messages themselves are checked by the SDK's own validator. */
const chatBodySchema = z.object({
  messages: z.array(z.unknown()),
  /** Saving ideas the customer swiped right and left on. Only ids: the server looks up the rest. */
  acceptedIds: z.array(z.string()).max(50).default([]),
  rejectedIds: z.array(z.string()).max(50).default([]),
});

export function chatRoutes(db: DuckDBConnection) {
  return new Hono().post(
    '/users/:id/chat',
    zValidator('param', customerParamSchema),
    zValidator('json', chatBodySchema),
    async (c) => {
      const { messages, acceptedIds, rejectedIds } = c.req.valid('json');
      const validated = await safeValidateUIMessages({ messages });
      if (!validated.success) {
        return c.json({ error: 'Invalid chat messages' }, 400);
      }
      return streamCoachReply(db, c.req.valid('param').id, validated.data, {
        acceptedIds,
        rejectedIds,
      });
    },
  );
}
