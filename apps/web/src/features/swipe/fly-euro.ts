const FLY_MS = 650;

type Point = { x: number; y: number };

/**
 * A green € coin that flies from one point on screen to another, then calls `onLand`.
 * Drawn straight into the page, so it can cross the deck and the header.
 */
export function flyEuro(from: Point, to: Point, onLand: () => void) {
  const coin = document.createElement('span');
  coin.textContent = '€';
  coin.setAttribute('aria-hidden', 'true');
  coin.className =
    'pointer-events-none fixed z-50 flex size-9 items-center justify-center rounded-full bg-positive text-body font-bold text-card shadow-lg';
  coin.style.left = `${from.x}px`;
  coin.style.top = `${from.y}px`;
  document.body.append(coin);

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const animation = coin.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0 },
      { transform: 'translate(-50%, -50%) scale(1.4)', opacity: 1, offset: 0.2 },
      // Up and over in an arc, shrinking into the total.
      {
        transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 - 60}px)) scale(1.1)`,
        offset: 0.6,
      },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.5)`, opacity: 1 },
    ],
    { duration: FLY_MS, easing: 'ease-in-out' },
  );
  animation.onfinish = () => {
    coin.remove();
    onLand();
  };
}

/** The total jumps a little when a coin lands in it. */
export function bounce(element: HTMLElement | null) {
  element?.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.35)' },
      { transform: 'scale(0.92)' },
      { transform: 'scale(1)' },
    ],
    { duration: 380, easing: 'ease-out' },
  );
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
