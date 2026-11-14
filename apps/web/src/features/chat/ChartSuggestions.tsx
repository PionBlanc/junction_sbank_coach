import type { ChartTool } from '@coach/shared';

/** What a tapped bubble sends to the coach. The coach answers by calling drawChart. */
const CHART_PROMPTS: Record<ChartTool, string> = {
  getSpendingSummary: 'Draw a chart of my spending.',
  compareToPeers: 'Draw a chart comparing me to people my age.',
  getSafeToSpend: 'Show my safe to spend as a card.',
  simulateWhatIf: 'Draw a chart of this what-if.',
  getSpenderGroup: 'Show my spender group as a card.',
};

type ChartSuggestionsProps = { tools: ChartTool[]; onPick: (prompt: string) => void };

/** Tap-to-send bubbles offering the charts the coach has numbers for but did not draw. */
export function ChartSuggestions(props: ChartSuggestionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {props.tools.map((tool) => (
        <button
          key={tool}
          type="button"
          className="min-h-11 rounded-full border border-line bg-card px-4 text-small"
          onClick={() => props.onPick(CHART_PROMPTS[tool])}
        >
          {CHART_PROMPTS[tool].replace(/\.$/, '')}
        </button>
      ))}
    </div>
  );
}
