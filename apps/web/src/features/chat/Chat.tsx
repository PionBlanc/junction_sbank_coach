import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, getToolName, isToolUIPart } from 'ai';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useUser } from '../../lib/user-context.ts';
import { ToolCard } from './ToolCard.tsx';

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
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const busy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, open]);

  function ask(question: string) {
    if (busy || question.trim() === '') return;
    setOpen(true);
    setInput('');
    void sendMessage({ text: question });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    ask(input);
  }

  return (
    <div
      className={
        open
          ? 'fixed inset-0 z-10 mx-auto flex max-w-[390px] flex-col bg-surface'
          : 'fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[390px] bg-card shadow-sm'
      }
    >
      {open && (
        <>
          <div className="flex items-center justify-between bg-card px-4 shadow-sm">
            <h2 className="font-semibold">Coach</h2>
            <button
              type="button"
              className="h-11 text-sm text-brand"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm text-muted">
                Ask anything about your own money. Every number comes from your transactions.
              </p>
            )}
            {messages.map((message) =>
              message.parts.map((part, index) => {
                const key = `${message.id}-${index}`;
                if (part.type === 'text') {
                  return (
                    <p
                      key={key}
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                        message.role === 'user'
                          ? 'self-end bg-brand text-card'
                          : 'self-start bg-card shadow-sm'
                      }`}
                    >
                      {part.text}
                    </p>
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
            {busy && <p className="text-sm text-muted">Looking at your data…</p>}
            {error && (
              <p className="text-sm text-negative">The coach could not answer. Please try again.</p>
            )}
            <div ref={endRef} />
          </div>
        </>
      )}
      <div className="flex flex-col gap-2 bg-card p-3">
        <div className="flex gap-2 overflow-x-auto">
          {SUGGESTED_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              className="h-11 shrink-0 rounded-full bg-surface px-3 text-xs"
              disabled={busy}
              onClick={() => ask(question)}
            >
              {question}
            </button>
          ))}
        </div>
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <input
            className="h-11 flex-1 rounded-lg bg-surface px-3 text-sm"
            placeholder="Ask about your money…"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onFocus={() => setOpen(true)}
          />
          <button
            type="submit"
            className="h-11 rounded-lg bg-brand px-4 text-sm font-semibold text-card"
            disabled={busy}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
