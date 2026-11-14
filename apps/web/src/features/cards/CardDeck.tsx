import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useCards } from '../../api/useCards.ts';
import { Card } from '../../components/Card.tsx';
import { LoadError } from '../../components/LoadError.tsx';
import { useUser } from '../../lib/user-context.ts';
import { ActionList } from '../actions/ActionList.tsx';
import { ArrowButton } from './ArrowButton.tsx';
import { DeckSkeleton } from './DeckSkeleton.tsx';
import { InsightCard } from './InsightCard.tsx';

/** A swipe longer than this share of the card width moves to the next card... */
const SWIPE_SHARE = 0.25;
/** ...and so does a quick flick, in pixels per millisecond. */
const FLICK_SPEED = 0.5;
/** Movement before we decide whether the finger is swiping sideways or scrolling. */
const DRAG_START_PX = 8;

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

/** The home screen: insight cards the user swipes through, ending with the ways to free up money. */
export function CardDeck() {
  const { userId } = useUser();
  const cards = useCards(userId);
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<Drag | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // The cards, plus the action list as the last slide.
  const slideCount = (cards.data?.length ?? 0) + 1;

  function go(step: number) {
    setIndex((i) => Math.min(slideCount - 1, Math.max(0, i + step)));
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement) return;
      if (event.target instanceof HTMLTextAreaElement) return;
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(slideCount - 1, i + 1));
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slideCount]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
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
      // Capture only once it is a swipe, so a plain tap still clicks the button under the finger.
      event.currentTarget.setPointerCapture(event.pointerId);
      current.swiping = true;
      setDragging(true);
    }
    current.dx = dx;
    const atEdge = (index === 0 && dx > 0) || (index === slideCount - 1 && dx < 0);
    setDragX(atEdge ? dx / 3 : dx);
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    drag.current = null;
    if (!current?.swiping) return;
    // Not event.clientX: on pointercancel it is 0, which read as a long swipe to the next card.
    const dx = current.dx;
    const width = viewportRef.current?.offsetWidth ?? 1;
    const speed = Math.abs(dx) / Math.max(1, event.timeStamp - current.startTime);
    if (Math.abs(dx) > width * SWIPE_SHARE || speed > FLICK_SPEED) go(dx < 0 ? 1 : -1);
    setDragX(0);
    setDragging(false);
  }

  if (cards.isPending) {
    return <DeckSkeleton />;
  }
  if (cards.isError) {
    return (
      <Card>
        <LoadError message={cards.error.message} onRetry={() => void cards.refetch()} />
      </Card>
    );
  }

  const slides = [
    ...cards.data.map((card) => ({ key: card.id, content: <InsightCard card={card} /> })),
    { key: 'actions', content: <ActionList /> },
  ];

  return (
    <div className="flex flex-col gap-2">
      <nav className="flex items-center gap-2" aria-label="Cards">
        <ArrowButton direction="previous" disabled={index === 0} onClick={() => go(-1)} />
        <div className="flex flex-1 gap-1">
          {slides.map((slide, i) => (
            <span
              key={slide.key}
              className={`h-0.5 flex-1 ${i === index ? 'bg-ink' : 'bg-line'}`}
            />
          ))}
        </div>
        <ArrowButton direction="next" disabled={index === slideCount - 1} onClick={() => go(1)} />
      </nav>
      <div
        ref={viewportRef}
        className="-mx-1 touch-pan-y overflow-hidden select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(calc(${-index * 100}% + ${dragX}px))`,
            transition: dragging ? 'none' : 'transform 250ms ease-out',
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.key}
              className="grid h-120 w-full shrink-0 overflow-y-auto px-1"
              aria-hidden={i !== index}
              inert={i !== index}
            >
              {slide.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
