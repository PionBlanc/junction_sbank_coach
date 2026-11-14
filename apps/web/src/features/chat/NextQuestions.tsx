type NextQuestionsProps = {
  questions: readonly { label: string; question: string }[];
  onAsk: (question: string) => void;
};

/** Tap-to-send replies under the coach's latest message. */
export function NextQuestions(props: NextQuestionsProps) {
  if (props.questions.length === 0) return null;
  // Longest first, so the wrapped rows narrow towards the bottom.
  const sorted = [...props.questions].sort((a, b) => b.label.length - a.label.length);

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {sorted.map((q) => (
        <button
          key={q.question}
          type="button"
          className="min-h-11 rounded-md bg-mint px-4 py-2 text-left text-small font-semibold text-ink"
          onClick={() => props.onAsk(q.question)}
        >
          {q.label}
        </button>
      ))}
    </div>
  );
}
