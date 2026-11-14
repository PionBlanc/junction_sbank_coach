import { drawChartInputSchema } from '@coach/shared';
import { tool } from 'ai';

/** Marks an earlier tool result as "show this to the customer". The app draws the card. */
export function drawChartTool() {
  return tool({
    description:
      'Show the customer the chart or card for an earlier tool result in this conversation. ' +
      'Call it whenever the customer asks to see or show their numbers, asks for a chart, or ' +
      'says yes to your offer to show something. Tool results are never shown otherwise.',
    inputSchema: drawChartInputSchema,
    execute: async (input) => ({ shown: input.result }),
  });
}
