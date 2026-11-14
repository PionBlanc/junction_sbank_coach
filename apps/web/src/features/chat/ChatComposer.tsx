import { useState, type FormEvent } from 'react';
import { CoachAvatar } from './CoachAvatar.tsx';

type ChatComposerProps = {
  /** Docked under the cards: the field shows the advisor and invites into the chat. */
  docked: boolean;
  disabled: boolean;
  onSend: (text: string) => void;
  onFocus: () => void;
};

/** Text field with a send button. */
export function ChatComposer(props: ChatComposerProps) {
  const [input, setInput] = useState('');
  const canSend = !props.disabled && input.trim() !== '';
  // Docked and empty, there is nothing to send: give the invitation the full width.
  const showSend = !props.docked || input.trim() !== '';

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    props.onSend(input);
    setInput('');
  }

  return (
    <form className="flex items-center gap-2" onSubmit={handleSubmit}>
      <div className="relative min-w-0 flex-1">
        {props.docked && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
            <CoachAvatar />
          </span>
        )}
        <input
          aria-label="Ask your financial advisor about your money"
          className={
            props.docked
              ? 'h-14 w-full bg-card pr-8 pl-10 text-body placeholder:font-semibold placeholder:text-ink focus-visible:outline-none'
              : 'h-11 w-full rounded-md border border-line bg-card px-4 text-body placeholder:text-subtle focus-visible:-outline-offset-1'
          }
          placeholder={props.docked ? 'Chat with your financial advisor' : 'Ask about your money…'}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onFocus={props.onFocus}
        />
        {/* Points up: the chat slides open from the bottom. */}
        {props.docked && !showSend && (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-brand">
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
              <path d="M15.7 12.7a1 1 0 0 1-1.4 0L10 8.4l-4.3 4.3a1 1 0 0 1-1.4-1.4l5-5a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4Z" />
            </svg>
          </span>
        )}
      </div>
      {showSend && (
        <button
          type="submit"
          aria-label="Send"
          className="flex size-11 shrink-0 items-center justify-center rounded-md bg-brand text-card transition-opacity disabled:opacity-40"
          disabled={!canSend}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
            <path d="M10 3a1 1 0 0 1 .7.3l5 5a1 1 0 0 1-1.4 1.4L11 6.4V16a1 1 0 1 1-2 0V6.4L5.7 9.7a1 1 0 0 1-1.4-1.4l5-5A1 1 0 0 1 10 3Z" />
          </svg>
        </button>
      )}
    </form>
  );
}
