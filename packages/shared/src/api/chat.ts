import { z } from 'zod';

/** Coach tools whose result can be drawn as a card or chart. */
export const CHART_TOOLS = [
  'getSpendingSummary',
  'compareToPeers',
  'getSafeToSpend',
  'simulateWhatIf',
  'getSpenderGroup',
] as const;

export type ChartTool = (typeof CHART_TOOLS)[number];

/** What the coach sends to `drawChart`: which earlier tool result to show. */
export const drawChartInputSchema = z.object({ result: z.enum(CHART_TOOLS) });
export type DrawChartInput = z.infer<typeof drawChartInputSchema>;
