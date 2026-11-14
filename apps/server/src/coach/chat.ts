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
import { COACH_MODEL_ID } from './model.ts';
import { SYSTEM_PROMPT } from './prompts/system.ts';
import { compareToPeersTool } from './tools/compare-to-peers.ts';
import { getSafeToSpendTool } from './tools/get-safe-to-spend.ts';
import { getSpendingSummaryTool } from './tools/get-spending-summary.ts';
import { simulateWhatIfTool } from './tools/simulate-what-if.ts';

/** Streams the coach's answer. The customer id comes from the route, never from the model. */
export async function streamCoachReply(
  db: DuckDBConnection,
  customerId: string,
  messages: UIMessage[],
): Promise<Response> {
  const result = streamText({
    model: google(COACH_MODEL_ID),
    instructions: SYSTEM_PROMPT,
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
