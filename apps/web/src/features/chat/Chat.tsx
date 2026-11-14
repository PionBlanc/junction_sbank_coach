import { getToolName, isToolUIPart } from 'ai';
import { useEffect, useRef } from 'react';
import { useCoachChat } from '../../lib/chat-context.ts';
import { ChatComposer } from './ChatComposer.tsx';
import { CoachAvatar } from './CoachAvatar.tsx';
import { CoachGreeting } from './CoachGreeting.tsx';
import { NextQuestions } from './NextQuestions.tsx';
import { ToolCard } from './ToolCard.tsx';
import { TypingIndicator } from './TypingIndicator.tsx';

/** The coach. A text field at the bottom of the screen; the conversation opens below the card. */
export function Chat() {
  const { messages, status, error, busy, open, setOpen, ask } = useCoachChat();
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lastMessage = messages.at(-1);
  // Show dots until the coach's reply has something on screen.
  const waiting = busy && (lastMessage?.role !== 'assistant' || status === 'submitted');
  const asked = messages.flatMap((m) =>
    m.role === 'user' ? m.parts.flatMap((p) => (p.type === 'text' ? [p.text] : [])) : [],
  );

  // Keep the newest message in view inside the chat, without moving the card above it.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, open, waiting]);

  // When the chat opens, bring it into view with as little page scrolling as possible.
  useEffect(() => {
    if (open) panelRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [open]);

  return (
    <>
      {open && (
        <div ref={panelRef} className="flex scroll-mb-24 flex-col gap-1">
          <button
            type="button"
            aria-label="Close chat"
            className="flex size-11 items-center justify-center self-end rounded-md text-muted hover:bg-fill"
            onClick={() => setOpen(false)}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
              <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
            </svg>
          </button>

          <div ref={listRef} className="flex max-h-96 flex-col gap-4 overflow-y-auto p-1">
            {messages.length === 0 && <CoachGreeting onAsk={ask} />}

            {messages.map((message) =>
              message.parts.map((part, index) => {
                const key = `${message.id}-${index}`;
                if (part.type === 'text' && message.role === 'user') {
                  return (
                    <p
                      key={key}
                      className="max-w-[80%] self-end rounded-lg bg-fill px-4 py-2 text-small whitespace-pre-wrap"
                    >
                      {part.text}
                    </p>
                  );
                }
                if (part.type === 'text' && part.text.trim() !== '') {
                  return (
                    <div key={key} className="flex items-start gap-2">
                      <CoachAvatar />
                      <p className="pt-1 text-small whitespace-pre-wrap">{part.text}</p>
                    </div>
                  );
                }
                if (isToolUIPart(part) && part.state === 'output-available') {
                  return (
                    <ToolCard
                      key={key}
                      toolName={getToolName(part)}
                      input={part.input}
                      output={part.output}
                    />
                  );
                }
                return null;
              }),
            )}

            {waiting && <TypingIndicator />}
            {!busy && !error && messages.length > 0 && <NextQuestions asked={asked} onAsk={ask} />}
            {error && (
              <p className="rounded-md border border-line bg-card px-4 py-2 text-small">
                Your advisor could not answer just now. Please try again.
              </p>
            )}
          </div>
        </div>
      )}
      {/* Docked to the bottom of the screen, like the text field of a phone app. */}
      <div className="sticky bottom-0 -mx-4 mt-auto -mb-4 border-t border-line bg-surface px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* A quiet way into the chat, so it does not compete with the deck's own button. */}
        {!open && (
          <button
            type="button"
            className="mb-2 flex min-h-11 items-center gap-2 text-small text-muted hover:text-ink"
            onClick={() => setOpen(true)}
          >
            <CoachAvatar />
            Chat with your financial advisor <span aria-hidden>›</span>
          </button>
        )}
        <ChatComposer disabled={busy} onSend={ask} onFocus={() => setOpen(true)} />
      </div>
    </>
  );
}
