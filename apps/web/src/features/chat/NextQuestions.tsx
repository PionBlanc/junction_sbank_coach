type NextQuestionsProps = {
  questions: readonly { label: string; question: string }[];
  onAsk: (question: string) => void;
};

/** Tap-to-send replies under the coach's latest message. */
export function NextQuestions(props: NextQuestionsProps) {
  if (props.questions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pl-9">
      {props.questions.map((q) => (
        <button
          key={q.question}
          type="button"
          className="min-h-11 rounded-full border border-brand px-4 text-small text-brand hover:bg-fill"
          onClick={() => props.onAsk(q.question)}
        >
          {q.label}
        </button>
      ))}
    </div>
  );
}
