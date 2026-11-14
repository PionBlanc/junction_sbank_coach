import { getToolName, isToolUIPart } from 'ai';
import { useEffect, useRef } from 'react';
import { useCoachChat } from '../../lib/chat-context.ts';
import { ChatComposer } from './ChatComposer.tsx';
import { CoachAvatar } from './CoachAvatar.tsx';
import { ToolCard } from './ToolCard.tsx';
import { TypingIndicator } from './TypingIndicator.tsx';

/** The coach. A text field under the cards; the conversation opens above it, below the card. */
export function Chat() {
  const { messages, status, error, busy, open, setOpen, ask } = useCoachChat();
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lastMessage = messages.at(-1);
  // Show dots until the coach's reply has something on screen.
  const waiting = busy && (lastMessage?.role !== 'assistant' || status === 'submitted');

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
    <div ref={panelRef} className="flex flex-col gap-3">
      {open && (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            aria-label="Close chat"
            className="flex size-11 items-center justify-center self-end rounded-full text-muted hover:bg-card"
            onClick={() => setOpen(false)}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
              <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
            </svg>
          </button>

          <div ref={listRef} className="flex max-h-96 flex-col gap-3 overflow-y-auto p-1">
            {messages.length === 0 && (
              <div className="flex items-end gap-2">
                <CoachAvatar />
                <p className="max-w-[80%] rounded-2xl rounded-bl-md bg-card px-4 py-3 text-sm shadow-sm">
                  Hi! Ask me anything about your money. I look at your own transactions and show you
                  the numbers.
                </p>
              </div>
            )}

            {messages.map((message) =>
              message.parts.map((part, index) => {
                const key = `${message.id}-${index}`;
                if (part.type === 'text' && message.role === 'user') {
                  return (
                    <p
                      key={key}
                      className="max-w-[80%] self-end rounded-2xl rounded-br-md bg-brand px-4 py-2 text-sm whitespace-pre-wrap text-card"
                    >
                      {part.text}
                    </p>
                  );
                }
                if (part.type === 'text' && part.text.trim() !== '') {
                  return (
                    <div key={key} className="flex items-end gap-2">
                      <CoachAvatar />
                      <p className="max-w-[80%] rounded-2xl rounded-bl-md bg-card px-4 py-3 text-sm whitespace-pre-wrap shadow-sm">
                        {part.text}
                      </p>
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
            {error && (
              <p className="rounded-xl bg-card px-4 py-3 text-sm text-negative shadow-sm">
                The coach could not answer just now. Please try again.
              </p>
            )}
          </div>
        </div>
      )}
      <div className="rounded-xl bg-card p-3 shadow-sm">
        <ChatComposer disabled={busy} onSend={ask} onFocus={() => setOpen(true)} />
      </div>
    </div>
  );
}
