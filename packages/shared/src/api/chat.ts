import { z } from 'zod';

/** Coach tools whose result can be drawn as a card or chart. */
export const CHART_TOOLS = [
  'getSpendingSummary',
  'compareToPeers',
  'getSafeToSpend',
  'simulateWhatIf',
  'getSpenderGroup',
  'getMonthlyBreakdown',
  'getIncomeVsSpending',
  'getYearOverYear',
] as const;

export type ChartTool = (typeof CHART_TOOLS)[number];

/** What the coach sends to `drawChart`: which earlier tool result to show. */
export const drawChartInputSchema = z.object({ result: z.enum(CHART_TOOLS) });
export type DrawChartInput = z.infer<typeof drawChartInputSchema>;

/** What the coach sends to `suggestReplies`: short replies the customer can tap next. */
export const suggestRepliesInputSchema = z.object({
  replies: z.array(z.string().min(1).max(80)).min(1).max(3),
});
export type SuggestRepliesInput = z.infer<typeof suggestRepliesInputSchema>;
