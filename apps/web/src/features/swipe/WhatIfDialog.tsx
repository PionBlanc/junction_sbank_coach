import { useEffect, useRef } from 'react';
import { useLockPageScroll } from '../../lib/useLockPageScroll.ts';
import { WhatIfCard } from '../what-if/WhatIfCard.tsx';

type WhatIfDialogProps = { monthlyEur: number; onClose: () => void };

/** A small window over the page: what the monthly amount grows into over the years. */
export function WhatIfDialog(props: WhatIfDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  // A modal <dialog> blocks clicks behind it, but not scrolling: lock the page ourselves.
  useLockPageScroll(true);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label="Saved vs. invested"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(358px,calc(100vw-2rem))] overscroll-contain bg-transparent p-0 backdrop:bg-ink/60"
      onClose={props.onClose}
      // A click on the dimmed backdrop lands on the dialog itself and closes it.
      onClick={(event) => {
        if (event.target === event.currentTarget) ref.current?.close();
      }}
    >
      <div className="relative">
        <button
          type="button"
          aria-label="Close"
          className="absolute top-1 right-1 flex size-11 items-center justify-center rounded-md text-muted hover:bg-fill"
          onClick={() => ref.current?.close()}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
            <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
          </svg>
        </button>
        <WhatIfCard monthlyEur={props.monthlyEur} />
      </div>
    </dialog>
  );
}
