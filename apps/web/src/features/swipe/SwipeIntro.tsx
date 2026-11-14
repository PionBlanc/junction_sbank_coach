type SwipeIntroProps = {
  /** How many saving ideas wait in the deck. */
  count: number;
  onStart: () => void;
};

/**
 * How swiping works, shown as the first card of the deck before the first swipe.
 * It covers only the deck, so the demo customer picker above stays usable.
 */
export function SwipeIntro(props: SwipeIntroProps) {
  return (
    <div
      className="absolute inset-0 flex touch-none flex-col justify-between gap-4 rounded-lg bg-ink p-6 text-card"
      role="dialog"
      aria-label="How swiping works"
    >
      <h2 className="flex flex-col gap-2">
        <span className="font-display text-poster font-extrabold font-stretch-75% text-lime">
          {props.count}
        </span>
        <span className="font-display text-headline font-bold">
          {props.count === 1 ? 'way' : 'ways'} to free up money, picked from your own spending.
        </span>
      </h2>
      <div className="flex flex-col gap-4">
        <p className="flex items-center gap-4 text-body">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-lime text-ink">
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
              <path d="M10.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4l3.3-3.3H4a1 1 0 1 1 0-2h9.6l-3.3-3.3a1 1 0 0 1 0-1.4Z" />
            </svg>
          </span>
          <span>
            <span className="font-semibold text-lime">Swipe right</span> on the ones you would try.
          </span>
        </p>
        <p className="flex items-center gap-4 text-body">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-card/40">
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
              <path d="M9.7 4.3a1 1 0 0 0-1.4 0l-5 5a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L6.4 11H16a1 1 0 1 0 0-2H6.4l3.3-3.3a1 1 0 0 0 0-1.4Z" />
            </svg>
          </span>
          <span>
            <span className="font-semibold">Swipe left</span> on the ones that don&apos;t fit your
            life.
          </span>
        </p>
        <button
          type="button"
          className="mt-2 h-14 rounded-full bg-lime text-body font-semibold text-ink outline-card"
          onClick={props.onStart}
          autoFocus
        >
          Start swiping
        </button>
      </div>
    </div>
  );
}
