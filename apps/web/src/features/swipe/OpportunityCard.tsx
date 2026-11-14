import type { Action } from '@coach/shared';
import { formatEur } from '../../lib/format.ts';

const INK_STOCK = { card: 'bg-ink text-card', amount: 'text-lime', soft: 'text-card/75' };
/** Card colours, taken in turn through the deck so each new card looks new. */
const STOCKS = [
  INK_STOCK,
  { card: 'bg-lime text-ink', amount: 'text-ink', soft: 'text-ink/75' },
  { card: 'bg-brand text-card', amount: 'text-lime', soft: 'text-card' },
];

type OpportunityCardProps = {
  action: Action;
  /** The card's place in the deck: picks its colour. */
  index: number;
  /** 0 to 1: how far the card is dragged towards "let's do it" and "no thanks". */
  likeOpacity: number;
  passOpacity: number;
};

/** One saving idea as a poster: the money it frees up, the idea, and the numbers behind it. */
export function OpportunityCard(props: OpportunityCardProps) {
  const { action } = props;
  const stock = STOCKS[props.index % STOCKS.length] ?? INK_STOCK;
  return (
    <section className={`relative flex h-full flex-col gap-4 rounded-lg p-6 ${stock.card}`}>
      <p className="flex flex-col gap-1">
        <span className={`text-small font-semibold ${stock.soft}`}>Frees up about</span>
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span
            className={`font-display text-poster font-extrabold font-stretch-75% ${stock.amount}`}
          >
            {formatEur(action.savingPerMonthEur)}
          </span>
          <span className="text-body font-semibold">a month</span>
        </span>
      </p>
      {/* The idea's picture, stuck on like a sticker. It takes the room the text leaves. */}
      <div className="flex min-h-0 flex-1 items-center justify-end @container-size">
        <span
          className="flex aspect-square h-[min(100cqh,45cqw)] rotate-6 items-center justify-center rounded-full bg-card text-sticker"
          aria-hidden
        >
          {action.emoji}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-headline font-bold">{action.title}</h2>
        <p className={`text-small ${stock.soft}`}>{action.explanation}</p>
      </div>
      <span
        className="absolute top-1/2 left-6 -rotate-6 rounded-md bg-card px-4 py-2 font-display text-headline font-extrabold text-ink"
        style={{ opacity: props.likeOpacity }}
      >
        Let&apos;s do it
      </span>
      <span
        className="absolute top-1/2 right-6 rotate-6 rounded-md bg-card px-4 py-2 font-display text-headline font-extrabold text-ink"
        style={{ opacity: props.passOpacity }}
      >
        No thanks
      </span>
    </section>
  );
}
