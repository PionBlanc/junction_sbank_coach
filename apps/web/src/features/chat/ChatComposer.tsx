import { useState, type FormEvent } from 'react';

type ChatComposerProps = {
  disabled: boolean;
  onSend: (text: string) => void;
  onFocus: () => void;
};

/** Text field with a send button. */
export function ChatComposer(props: ChatComposerProps) {
  const [input, setInput] = useState('');
  const canSend = !props.disabled && input.trim() !== '';

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    props.onSend(input);
    setInput('');
  }

  return (
    <form className="flex items-center gap-2" onSubmit={handleSubmit}>
      <input
        aria-label="Ask about your money"
        className="h-11 min-w-0 flex-1 rounded-md border border-line bg-card px-4 text-body placeholder:text-subtle focus-visible:-outline-offset-1"
        placeholder="Ask about your money…"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onFocus={props.onFocus}
      />
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
    </form>
  );
}
