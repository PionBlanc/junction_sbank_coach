import type { DuckDBConnection } from '@duckdb/node-api';
import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { getActions } from '../insights/actions/index.ts';
import { buildSwipeProfile } from '../insights/actions/swipe-profile.ts';
import { COACH_MODEL_ID } from './model.ts';
import { swipeProfilePrompt } from './prompts/swipe-profile.ts';
import { SYSTEM_PROMPT } from './prompts/system.ts';
import { compareToPeersTool } from './tools/compare-to-peers.ts';
import { getSafeToSpendTool } from './tools/get-safe-to-spend.ts';
import { getSpendingSummaryTool } from './tools/get-spending-summary.ts';
import { simulateWhatIfTool } from './tools/simulate-what-if.ts';

/** Ids of the saving ideas the customer swiped right (accepted) and left (rejected) on. */
export type Swipes = { acceptedIds: string[]; rejectedIds: string[] };

/** Streams the coach's answer. The customer id comes from the route, never from the model. */
export async function streamCoachReply(
  db: DuckDBConnection,
  customerId: string,
  messages: UIMessage[],
  swipes: Swipes,
): Promise<Response> {
  let instructions = SYSTEM_PROMPT;
  if (swipes.acceptedIds.length > 0 || swipes.rejectedIds.length > 0) {
    const actions = await getActions(db, customerId);
    instructions += swipeProfilePrompt(
      buildSwipeProfile(actions, swipes.acceptedIds, swipes.rejectedIds),
    );
  }

  const result = streamText({
    model: google(COACH_MODEL_ID),
    instructions,
    messages: await convertToModelMessages(messages),
    tools: {
      getSpendingSummary: getSpendingSummaryTool(db, customerId),
      getSafeToSpend: getSafeToSpendTool(db, customerId),
      compareToPeers: compareToPeersTool(db, customerId),
      simulateWhatIf: simulateWhatIfTool(db, customerId),
    },
    stopWhen: isStepCount(5),
  });
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
}
