import type { Action } from '@coach/shared';
import { formatEur } from '../../lib/format.ts';

type OpportunityCardProps = {
  action: Action;
  /** 0 to 1: how far the card is dragged towards "let's do it" and "no thanks". */
  likeOpacity: number;
  passOpacity: number;
};

/** One saving idea, laid out like a dating profile: a photo, the idea, and the numbers behind it. */
export function OpportunityCard(props: OpportunityCardProps) {
  const { action } = props;
  return (
    <section className="flex h-full flex-col gap-4 rounded-md border border-line bg-card p-4">
      <div className="relative flex min-h-0 flex-1 items-center justify-center rounded-md bg-fill [container-type:size]">
        <span className="text-emoji" aria-hidden>
          {action.emoji}
        </span>
        <span
          className="absolute top-4 left-4 -rotate-12 rounded-md border-2 border-positive px-2 text-title font-semibold text-positive"
          style={{ opacity: props.likeOpacity }}
        >
          LET&apos;S DO IT
        </span>
        <span
          className="absolute top-4 right-4 rotate-12 rounded-md border-2 border-muted px-2 text-title font-semibold text-muted"
          style={{ opacity: props.passOpacity }}
        >
          NO THANKS
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-title font-semibold">{action.title}</h2>
        <p className="text-small font-semibold text-positive">
          Frees up ~{formatEur(action.savingPerMonthEur)}/month
        </p>
        <p className="text-caption text-muted">{action.explanation}</p>
      </div>
    </section>
  );
}
