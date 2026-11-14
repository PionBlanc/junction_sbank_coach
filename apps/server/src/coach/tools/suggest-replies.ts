import { suggestRepliesInputSchema } from '@coach/shared';
import { tool } from 'ai';

/** Hands the app the replies to offer as tap-to-send buttons. Nothing is computed. */
export function suggestRepliesTool() {
  return tool({
    description:
      'Offer the customer two or three short replies to tap next, written in their voice. ' +
      'Call it once at the end of every answer, after your text.',
    inputSchema: suggestRepliesInputSchema,
    execute: async (input) => ({ offered: input.replies.length }),
  });
}
