import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, getToolName, isToolUIPart } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '../../lib/user-context.ts';
import { ChatComposer } from './ChatComposer.tsx';
import { CoachAvatar } from './CoachAvatar.tsx';
import { ToolCard } from './ToolCard.tsx';
import { TypingIndicator } from './TypingIndicator.tsx';

const SUGGESTED_QUESTIONS = [
  'What is safe for me to spend this week?',
  'How much did I spend on taxis last month?',
  'How much could I save if I reduced dining out by 20%?',
  'How do I compare with people my age?',
];

/** The coach. A bar docked at the bottom of the screen that opens into a full-screen chat. */
export function Chat() {
  const { userId } = useUser();
  const [transport] = useState(
    () => new DefaultChatTransport({ api: `/api/users/${userId}/chat` }),
  );
  const { messages, sendMessage, status, error } = useChat({ transport });
  const [open, setOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const busy = status === 'submitted' || status === 'streaming';
  const lastMessage = messages.at(-1);
  // Show dots until the coach's reply has something on screen.
  const waiting = busy && (lastMessage?.role !== 'assistant' || status === 'submitted');

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, open, waiting]);

  function ask(question: string) {
    if (busy || question.trim() === '') return;
    setOpen(true);
    void sendMessage({ text: question });
  }

  const chips = (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
      {SUGGESTED_QUESTIONS.map((question) => (
        <button
          key={question}
          type="button"
          className="h-9 shrink-0 rounded-full border border-line bg-card px-3 text-xs text-ink disabled:opacity-40"
          disabled={busy}
          onClick={() => ask(question)}
        >
          {question}
        </button>
      ))}
    </div>
  );

  const composer = <ChatComposer disabled={busy} onSend={ask} onFocus={() => setOpen(true)} />;

  if (!open) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-[390px] flex-col gap-3 rounded-t-2xl bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-dock">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <CoachAvatar />
          Ask your coach
        </div>
        {chips}
        {composer}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-10 mx-auto flex max-w-[390px] flex-col bg-surface">
      <header className="flex items-center gap-3 bg-card px-4 py-2 shadow-sm">
        <CoachAvatar size="md" />
        <div className="flex flex-1 flex-col">
          <h2 className="font-semibold">Your money coach</h2>
          <p className="text-xs text-muted">Every number comes from your own transactions</p>
        </div>
        <button
          type="button"
          aria-label="Close chat"
          className="flex size-11 items-center justify-center rounded-full text-muted hover:bg-surface"
          onClick={() => setOpen(false)}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
            <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
          </svg>
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <>
            <div className="flex items-end gap-2">
              <CoachAvatar />
              <p className="max-w-[80%] rounded-2xl rounded-bl-md bg-card px-4 py-3 text-sm shadow-sm">
                Hi! Ask me anything about your money. I look at your own transactions and show you
                the numbers.
              </p>
            </div>
            <p className="mt-2 text-xs font-semibold tracking-wide text-muted uppercase">
              Try asking
            </p>
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                className="min-h-11 rounded-xl border border-line bg-card px-4 py-2 text-left text-sm"
                onClick={() => ask(question)}
              >
                {question}
              </button>
            ))}
          </>
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
        <div ref={endRef} />
      </div>

      <div className="flex flex-col gap-3 bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-dock">
        {messages.length > 0 && !busy && chips}
        {composer}
      </div>
    </div>
  );
}
