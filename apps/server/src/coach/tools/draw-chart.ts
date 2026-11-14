import { drawChartInputSchema } from '@coach/shared';
import { tool } from 'ai';

/** Marks an earlier tool result as "show this to the customer". The app draws the card. */
export function drawChartTool() {
  return tool({
    description:
      'Show the customer the chart or card for an earlier tool result in this conversation. ' +
      'Call it only when the customer asks for a chart, graph, diagram or picture. ' +
      'Tool results are never shown otherwise.',
    inputSchema: drawChartInputSchema,
    execute: async (input) => ({ shown: input.result }),
  });
}
