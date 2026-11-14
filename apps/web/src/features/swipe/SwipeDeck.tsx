import type { Action } from '@coach/shared';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useActions } from '../../api/useActions.ts';
import { Card } from '../../components/Card.tsx';
import { LoadError } from '../../components/LoadError.tsx';
import { formatEur } from '../../lib/format.ts';
import { useSwipes } from '../../lib/swipe-context.ts';
import { useUser } from '../../lib/user-context.ts';
import { bounce, flyEuro, prefersReducedMotion } from './fly-euro.ts';
import { OpportunityCard } from './OpportunityCard.tsx';
import { SwipeIntro } from './SwipeIntro.tsx';
import { SwipeResults } from './SwipeResults.tsx';

/** A swipe longer than this share of the card width decides... */
const SWIPE_SHARE = 0.25;
/** ...and so does a quick flick, in pixels per millisecond. */
const FLICK_SPEED = 0.5;
/** Movement before we decide whether the finger is swiping sideways or scrolling. */
const DRAG_START_PX = 8;
/** Drag distance at which the DOWN / WORTH IT stamp is fully visible. */
const STAMP_FULL_PX = 80;
/** How long the card takes to fly off the screen. */
const LEAVE_MS = 250;
/** How long "It's a match!" stays up. */
const MATCH_MS = 1400;

type Drag = {
  pointerId: number;
  startX: number;
  startY: number;
  startTime: number;
  /** True once the move is a sideways swipe. Kept here, not in state, so fast events see it. */
  swiping: boolean;
  /** Last sideways distance seen while moving. A cancelled touch reports no usable position. */
  dx: number;
};

/** The home screen: saving ideas to swipe right (down to try) or left (worth it to me). */
export function SwipeDeck() {
  const { userId } = useUser();
  const actions = useActions(userId);
  const { swipes, swipe, undo } = useSwipes();
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState<'left' | 'right' | null>(null);
  const [match, setMatch] = useState<Action | null>(null);
  // Local state, so switching demo customer (which remounts the page) shows the intro again.
  const [introSeen, setIntroSeen] = useState(false);
  const drag = useRef<Drag | null>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);
  // Euros on their way to the total: the total counts them when the coin lands.
  const [inFlightEur, setInFlightEur] = useState(0);

  const all = actions.data ?? [];
  const remaining = all.filter((a) => !swipes.some((s) => s.id === a.id));
  const top = remaining[0];
  const next = remaining[1];

  function decide(liked: boolean) {
    if (!top || leaving || !introSeen) return;
    setLeaving(liked ? 'right' : 'left');
    setDragging(false);
    setTimeout(() => {
      swipe(top.id, liked);
      if (liked) setMatch(top);
      // The last card leads to the results, which have no total to fly to.
      if (liked && next) launchCoin(top.savingPerMonthEur);
      setLeaving(null);
      setDragX(0);
    }, LEAVE_MS);
  }

  function launchCoin(eur: number) {
    const deck = deckRef.current?.getBoundingClientRect();
    const total = totalRef.current?.getBoundingClientRect();
    if (!deck || !total || prefersReducedMotion()) return;
    setInFlightEur((v) => v + eur);
    flyEuro(
      { x: deck.left + deck.width / 2, y: deck.top + deck.height / 3 },
      { x: total.left + total.width / 2, y: total.top + total.height / 2 },
      () => {
        setInFlightEur((v) => v - eur);
        bounce(totalRef.current);
      },
    );
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement) return;
      if (event.target instanceof HTMLTextAreaElement) return;
      if (event.key === 'ArrowRight') decide(true);
      if (event.key === 'ArrowLeft') decide(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (!match) return;
    const timer = setTimeout(() => setMatch(null), MATCH_MS);
    return () => clearTimeout(timer);
  }, [match]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (leaving) return;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: event.timeStamp,
      swiping: false,
      dx: 0,
    };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (!current.swiping) {
      if (Math.abs(dy) > DRAG_START_PX && Math.abs(dy) > Math.abs(dx)) {
        drag.current = null; // Scrolling the page, not swiping.
        return;
      }
      if (Math.abs(dx) < DRAG_START_PX) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      current.swiping = true;
      setDragging(true);
    }
    current.dx = dx;
    setDragX(dx);
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    drag.current = null;
    if (!current?.swiping) return;
    // Not event.clientX: on pointercancel it is 0, which would read as a long swipe.
    const dx = current.dx;
    const width = deckRef.current?.offsetWidth ?? 1;
    const speed = Math.abs(dx) / Math.max(1, event.timeStamp - current.startTime);
    setDragging(false);
    if (Math.abs(dx) > width * SWIPE_SHARE || speed > FLICK_SPEED) {
      decide(dx > 0);
    } else {
      setDragX(0);
    }
  }

  if (actions.isPending) {
    return (
      <Card>
        <div className="h-120 animate-pulse rounded-sm bg-fill" aria-busy aria-label="Loading" />
      </Card>
    );
  }
  if (actions.isError) {
    return (
      <Card>
        <LoadError message={actions.error.message} onRetry={() => void actions.refetch()} />
      </Card>
    );
  }
  if (all.length === 0) {
    return (
      <Card title="Ways to free up money">
        <p className="text-small">
          Your everyday spending is in line with people your age. Nothing stands out to change.
        </p>
      </Card>
    );
  }
  if (!top) {
    return <SwipeResults actions={all} />;
  }

  // The one sum the frontend is allowed to do: the selected action points.
  const freedEur = all
    .filter((a) => swipes.some((s) => s.id === a.id && s.liked))
    .reduce((sum, a) => sum + a.savingPerMonthEur, 0);

  let topTransform = `translateX(${dragX}px) rotate(${dragX / 20}deg)`;
  if (leaving === 'right') topTransform = 'translateX(150%) rotate(20deg)';
  if (leaving === 'left') topTransform = 'translateX(-150%) rotate(-20deg)';
  const stamp = Math.min(1, Math.abs(dragX) / STAMP_FULL_PX);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="flex items-baseline justify-between gap-4">
          <span className="text-title font-semibold text-ink">
            {swipes.length} / {all.length}
          </span>
          <span
            ref={totalRef}
            className="inline-block text-title font-semibold text-positive"
            aria-label={`${formatEur(freedEur)} a month freed up`}
          >
            +{formatEur(Math.max(0, freedEur - inFlightEur))}
          </span>
        </p>
        <div
          className="h-1.5 overflow-hidden rounded-sm bg-fill"
          role="progressbar"
          aria-label="Ideas reviewed"
          aria-valuemin={0}
          aria-valuemax={all.length}
          aria-valuenow={swipes.length}
        >
          <div
            className="h-full bg-brand transition-[width]"
            style={{ width: `${(swipes.length / all.length) * 100}%` }}
          />
        </div>
      </div>

      <div ref={deckRef} className="relative h-120">
        {next && (
          <div key={next.id} className="absolute inset-0 scale-95 transition-transform" inert>
            <OpportunityCard action={next} likeOpacity={0} passOpacity={0} />
          </div>
        )}
        <div
          key={top.id}
          className="absolute inset-0 touch-pan-y select-none"
          style={{
            transform: topTransform,
            transition: dragging ? 'none' : `transform ${LEAVE_MS}ms ease-out`,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        >
          <OpportunityCard
            action={top}
            likeOpacity={leaving === 'right' ? 1 : dragX > 0 ? stamp : 0}
            passOpacity={leaving === 'left' ? 1 : dragX < 0 ? stamp : 0}
          />
        </div>
        {!introSeen && <SwipeIntro onStart={() => setIntroSeen(true)} />}
        {match && (
          <div
            className="pointer-events-none absolute inset-x-4 top-4 flex items-center gap-4 rounded-md bg-brand p-4 text-card"
            role="status"
          >
            <span className="text-display" aria-hidden>
              {match.emoji}
            </span>
            <p className="flex flex-col">
              <span className="text-title font-semibold">It’s a match!</span>
              <span className="text-small">
                +{formatEur(match.savingPerMonthEur)} a month freed up
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Take back the last swipe"
          className="flex size-11 items-center justify-center rounded-full border border-line bg-card text-muted disabled:opacity-40"
          disabled={swipes.length === 0}
          onClick={undo}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
            <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Worth it to me"
          className="flex size-14 items-center justify-center rounded-full border border-line bg-card text-muted"
          onClick={() => decide(false)}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-7" aria-hidden>
            <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Down to try"
          className="flex size-14 items-center justify-center rounded-full bg-brand text-card"
          onClick={() => decide(true)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-7" aria-hidden>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
        {/* Keeps the two main buttons centred, opposite the undo button. */}
        <span className="size-11" />
      </div>
    </div>
  );
}
