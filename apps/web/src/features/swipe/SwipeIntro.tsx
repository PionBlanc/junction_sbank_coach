type SwipeIntroProps = { onStart: () => void };

/**
 * How swiping works, shown over the deck before the first swipe.
 * It covers only the deck, so the demo customer picker above stays usable.
 */
export function SwipeIntro(props: SwipeIntroProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center rounded-md bg-ink/70 p-4"
      role="dialog"
      aria-label="How swiping works"
    >
      <div className="flex w-full flex-col gap-4 rounded-lg bg-card p-4 shadow-xl">
        <h2 className="text-title font-semibold">We have personalized saving ideas for you!</h2>
        <p className="flex items-center gap-4 text-small">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-card">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>
          <span>
            <span className="font-semibold">Swipe right</span> if you are down to trying it, and see
            how much you can save!
          </span>
        </p>
        <button
          type="button"
          className="h-11 rounded-md bg-brand text-small font-semibold text-card"
          onClick={props.onStart}
          autoFocus
        >
          Start swiping!
        </button>
      </div>
    </div>
  );
}
