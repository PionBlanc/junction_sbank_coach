import { GUIDE_QUESTIONS } from './guide-questions.ts';

type NextQuestionsProps = { asked: string[]; onAsk: (question: string) => void };

/** Tappable next steps on the guided path, leaving out what was already asked. */
export function NextQuestions(props: NextQuestionsProps) {
  const next = GUIDE_QUESTIONS.filter((g) => !props.asked.includes(g.question));
  if (next.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pl-9">
      {next.map((g) => (
        <button
          key={g.question}
          type="button"
          className="min-h-11 rounded-full border border-brand px-4 text-small text-brand hover:bg-fill"
          onClick={() => props.onAsk(g.question)}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}
