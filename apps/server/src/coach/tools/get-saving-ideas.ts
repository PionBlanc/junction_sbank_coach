import type { DuckDBConnection } from '@duckdb/node-api';
import type { SavingIdeas } from '@coach/shared';
import { tool } from 'ai';
import { z } from 'zod';
import { getActions } from '../../insights/actions/index.ts';

/** Enough to choose from, few enough for a small chart. */
const IDEA_COUNT = 5;

export function getSavingIdeasTool(db: DuckDBConnection, customerId: string) {
  return tool({
    description:
      "The app's ideas for freeing up money, the ones that free up the most first: each idea's " +
      'title, its category, and how much it frees up a month. Built from the last 12 months.',
    inputSchema: z.object({}),
    execute: async (): Promise<SavingIdeas> => {
      const actions = await getActions(db, customerId);
      return {
        ideas: actions.slice(0, IDEA_COUNT).map((a) => ({
          id: a.id,
          emoji: a.emoji,
          title: a.title,
          categoryId: a.categoryId,
          savingPerMonthEur: a.savingPerMonthEur,
        })),
        ideaCount: actions.length,
      };
    },
  });
}
