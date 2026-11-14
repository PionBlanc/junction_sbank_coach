import { CoachAvatar } from './CoachAvatar.tsx';

/** Three pulsing dots while the coach looks at the data. */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2" aria-label="The coach is answering">
      <CoachAvatar />
      <div className="flex gap-1">
        <span className="size-2 animate-pulse rounded-full bg-subtle" />
        <span className="size-2 animate-pulse rounded-full bg-subtle [animation-delay:300ms]" />
        <span className="size-2 animate-pulse rounded-full bg-subtle [animation-delay:600ms]" />
      </div>
    </div>
  );
}
