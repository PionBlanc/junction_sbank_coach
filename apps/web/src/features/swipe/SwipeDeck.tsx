import type { Action } from '@coach/shared';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useActions } from '../../api/useActions.ts';
import { Card } from '../../components/Card.tsx';
import { LoadError } from '../../components/LoadError.tsx';
import { useCoachChat } from '../../lib/chat-context.ts';
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
/** Drag distance at which the LET'S DO IT / NO THANKS stamp is fully visible. */
const STAMP_FULL_PX = 80;
/** Size of the card waiting underneath the top one. */
const NEXT_SCALE = 0.95;
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

/** The home screen: saving ideas to swipe right (let's do it) or left (no thanks). */
export function SwipeDeck() {
  const { userId } = useUser();
  const actions = useActions(userId);
  const { swipes, swipe, undo } = useSwipes();
  const { open: chatOpen } = useCoachChat();
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
    if (!top || leaving) return;
    setLeaving(liked ? 'right' : 'left');
    setDragging(false);
    setTimeout(() => {
      setLeaving(null);
      setDragX(0);
      // While the intro is up, any swipe only sends the intro away.
      if (!introSeen) {
        setIntroSeen(true);
        return;
      }
      swipe(top.id, liked);
      if (liked) setMatch(top);
      // The last card leads to the results, which have no total to fly to.
      if (liked && next) launchCoin(top.savingPerMonthEur);
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
      // The chat sheet covers the deck: arrow keys there must not swipe the card behind it.
      if (chatOpen) return;
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
      <div
        className="min-h-104 flex-1 animate-pulse rounded-lg bg-fill"
        aria-busy
        aria-label="Loading"
      />
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
  // The card underneath grows as the top one is dragged away, and is full size once it has left.
  // While the intro is up, the drag moves the intro and the idea cards wait in place.
  let nextScale = leaving ? 1 : NEXT_SCALE + (1 - NEXT_SCALE) * stamp * 0.5;
  if (!introSeen) nextScale = NEXT_SCALE;
  const dragHandlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
  };
  const dragStyle = {
    transform: topTransform,
    transition: dragging ? 'none' : `transform ${LEAVE_MS}ms ease-out`,
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-4">
          <p className="flex items-baseline gap-2">
            <span
              ref={totalRef}
              className="inline-block font-display text-display font-extrabold text-positive font-stretch-75%"
              aria-label={`${formatEur(freedEur)} a month freed up`}
            >
              +{formatEur(Math.max(0, freedEur - inFlightEur))}
            </span>
            <span className="text-small text-muted">a month freed up</span>
          </p>
          <p className="text-small font-semibold text-muted">
            {swipes.length} of {all.length}
          </p>
        </div>
        {/* One mark per idea: green for the ones picked, grey for the ones skipped. */}
        <div
          className="flex gap-1"
          role="progressbar"
          aria-label="Ideas reviewed"
          aria-valuemin={0}
          aria-valuemax={all.length}
          aria-valuenow={swipes.length}
        >
          {all.map((action, index) => {
            const done = swipes[index];
            const colour = !done ? 'bg-fill' : done.liked ? 'bg-brand' : 'bg-subtle';
            return <span key={action.id} className={`h-1.5 flex-1 rounded-full ${colour}`} />;
          })}
        </div>
      </div>

      <div ref={deckRef} className="relative min-h-104 flex-1">
        {next && (
          // Same transform property and timing as the top card: when this card moves up to the top
          // it keeps its element, so it grows smoothly instead of snapping to full size.
          <div
            key={next.id}
            className="absolute inset-0"
            style={{
              transform: `scale(${nextScale})`,
              transition: dragging ? 'none' : `transform ${LEAVE_MS}ms ease-out`,
            }}
            inert
          >
            <OpportunityCard
              action={next}
              index={all.indexOf(next)}
              likeOpacity={0}
              passOpacity={0}
            />
          </div>
        )}
        <div
          key={top.id}
          className="absolute inset-0 touch-pan-y select-none"
          {...(introSeen ? { style: dragStyle, ...dragHandlers } : {})}
        >
          <OpportunityCard
            action={top}
            index={all.indexOf(top)}
            likeOpacity={!introSeen ? 0 : leaving === 'right' ? 1 : dragX > 0 ? stamp : 0}
            passOpacity={!introSeen ? 0 : leaving === 'left' ? 1 : dragX < 0 ? stamp : 0}
          />
        </div>
        {!introSeen && (
          <div
            className="absolute inset-0 touch-pan-y select-none"
            style={dragStyle}
            {...dragHandlers}
          >
            <SwipeIntro
              count={all.length}
              hint={!dragging && !leaving && dragX === 0}
              onStart={() => decide(true)}
            />
          </div>
        )}
        {match && (
          <div
            className="pointer-events-none absolute inset-x-4 top-1/2 flex -translate-y-1/2 -rotate-2 items-center gap-4 rounded-md border-2 border-ink bg-card p-4 text-ink"
            role="status"
          >
            <span className="text-display" aria-hidden>
              {match.emoji}
            </span>
            <p className="flex flex-col">
              <span className="font-display text-title font-extrabold">It’s a match!</span>
              <span className="text-small font-semibold text-positive">
                +{formatEur(match.savingPerMonthEur)} a month freed up
              </span>
            </p>
          </div>
        )}
      </div>

      {/*
        Named buttons under the thumb, for those who would rather tap than swipe. Hidden behind the
        intro, so "Start swiping" and the chat bar are what stand out; the space stays so nothing jumps.
      */}
      <div
        className={`flex items-center gap-2 transition-opacity duration-200 ${introSeen ? '' : 'invisible opacity-0'}`}
      >
        <button
          type="button"
          aria-label="Take back the last swipe"
          className="flex size-14 shrink-0 items-center justify-center rounded-full border border-line bg-card text-ink disabled:opacity-40"
          disabled={swipes.length === 0}
          onClick={undo}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
            <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
          </svg>
        </button>
        <button
          type="button"
          className="h-14 flex-1 rounded-full border border-line bg-card text-body font-semibold text-ink"
          onClick={() => decide(false)}
        >
          No thanks
        </button>
        <button
          type="button"
          className="h-14 flex-1 rounded-full bg-ink text-body font-semibold text-lime"
          onClick={() => decide(true)}
        >
          Let&apos;s do it
        </button>
      </div>
    </div>
  );
}
