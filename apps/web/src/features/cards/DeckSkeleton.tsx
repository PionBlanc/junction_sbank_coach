/** Grey blocks the size of the deck, so the page does not jump when the cards arrive. */
export function DeckSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-busy aria-label="Loading">
      <div className="h-11" />
      <div className="flex h-120 animate-pulse flex-col gap-4 rounded-md border border-line bg-card p-4">
        <div className="h-5 w-1/3 rounded-sm bg-fill" />
        <div className="h-36 rounded-sm bg-fill" />
        <div className="h-6 w-4/5 rounded-sm bg-fill" />
      </div>
    </div>
  );
}
