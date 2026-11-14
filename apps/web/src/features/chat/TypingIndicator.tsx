import { CoachAvatar } from './CoachAvatar.tsx';

/** Three bouncing dots while the coach looks at the data. */
export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2" aria-label="The coach is answering">
      <CoachAvatar />
      <div className="flex gap-1 rounded-2xl rounded-bl-md bg-card px-4 py-3 shadow-sm">
        <span className="size-2 animate-bounce rounded-full bg-muted" />
        <span className="size-2 animate-bounce rounded-full bg-muted [animation-delay:150ms]" />
        <span className="size-2 animate-bounce rounded-full bg-muted [animation-delay:300ms]" />
      </div>
    </div>
  );
}
