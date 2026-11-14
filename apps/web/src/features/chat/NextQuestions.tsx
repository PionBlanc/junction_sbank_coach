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
<<<<<<< Updated upstream
          className={`min-h-11 rounded-full border border-brand px-4 text-small ${
            // A yes to the coach's offer is the likely next tap, so it stands out.
            /^yes\b/i.test(q.label)
              ? 'bg-brand text-card hover:opacity-90'
              : 'text-brand hover:bg-fill'
          }`}
=======
          className="min-h-11 rounded-md bg-mint px-4 py-2 text-left text-small font-semibold text-ink"
>>>>>>> Stashed changes
          onClick={() => props.onAsk(q.question)}
        >
          {q.label}
        </button>
      ))}
    </div>
  );
}
