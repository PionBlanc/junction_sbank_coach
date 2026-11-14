import { drawChartInputSchema, suggestRepliesInputSchema } from '@coach/shared';
import { getToolName, isToolUIPart } from 'ai';
import { useEffect, useRef } from 'react';
import { useCoachChat } from '../../lib/chat-context.ts';
import { useLockPageScroll } from '../../lib/useLockPageScroll.ts';
import { ChatComposer } from './ChatComposer.tsx';
import { CoachAvatar } from './CoachAvatar.tsx';
import { CoachGreeting } from './CoachGreeting.tsx';
import { GUIDE_QUESTIONS } from './guide-questions.ts';
import { NextQuestions } from './NextQuestions.tsx';
import { ToolCard } from './ToolCard.tsx';
import { TypingIndicator } from './TypingIndicator.tsx';

/** The coach. A text field at the bottom of the screen; the conversation opens below the card. */
export function Chat() {
  const { messages, status, error, busy, open, setOpen, ask } = useCoachChat();
  const listRef = useRef<HTMLDivElement>(null);
  const lastMessage = messages.at(-1);
  // Show dots until the coach's reply text starts. Its tool calls alone show nothing.
  const answerStarted =
    lastMessage?.role === 'assistant' &&
    status !== 'submitted' &&
    lastMessage.parts.some((p) => p.type === 'text' && p.text.trim() !== '');
  const waiting = busy && !answerStarted;
  const asked = messages.flatMap((m) =>
    m.role === 'user' ? m.parts.flatMap((p) => (p.type === 'text' ? [p.text] : [])) : [],
  );

  // Tool calls in order, so a drawChart call can find the result it points to.
  const toolParts = messages.flatMap((message) => message.parts.filter(isToolUIPart));
  // Tool calls of the latest answer.
  const lastToolParts =
    lastMessage?.role === 'assistant' ? lastMessage.parts.filter(isToolUIPart) : [];

  // Replies the coach offered with its latest answer. Without them, the guided questions not yet asked.
  const offered = lastToolParts.flatMap((p) =>
    getToolName(p) === 'suggestReplies'
      ? (suggestRepliesInputSchema.safeParse(p.input).data?.replies ?? [])
      : [],
  );
  const nextQuestions =
    offered.length > 0
      ? offered.map((reply) => ({ label: reply, question: reply }))
      : GUIDE_QUESTIONS.filter((g) => !asked.includes(g.question));

  // Keep the newest message in view.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, open, waiting]);

  // While the sheet is open, the page behind it must not scroll.
  useLockPageScroll(open);

  return (
    <>
      {/* Tapping anywhere outside the conversation slides it back down. */}
      {open && (
        <div
          aria-hidden
          className="fixed inset-0 z-30 touch-none bg-ink/40"
          onClick={() => setOpen(false)}
        />
      )}
      {/*
        One container for both states, so the text field keeps its focus and text: closed, it is
        docked to the bottom of the screen; open, it is a sheet over the swipe cards.
      */}
      <div
        className={
          open
            ? 'fixed inset-x-0 bottom-0 z-40 mx-auto flex h-[85dvh] max-w-[390px] flex-col rounded-t-lg bg-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl'
            : 'sticky bottom-0 -mx-4 mt-auto -mb-4 rounded-t-lg border-t border-line bg-card px-4 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]'
        }
      >
        {open && (
          <>
            <button
              type="button"
              aria-label="Back to swiping"
              className="flex h-11 w-full shrink-0 items-center justify-center text-muted hover:text-ink"
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-6" aria-hidden>
                <path d="M4.3 7.3a1 1 0 0 1 1.4 0L10 11.6l4.3-4.3a1 1 0 1 1 1.4 1.4l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 0-1.4Z" />
              </svg>
            </button>
            <div
              ref={listRef}
              className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-1 pb-4"
            >
              {messages.length === 0 && <CoachGreeting onAsk={ask} />}

              {messages.map((message) => {
                // Text the coach writes after its suggested replies is a slip: hide it, unless the
                // replies came first and the answer follows them.
                const repliesAt = message.parts.findIndex(
                  (p) => isToolUIPart(p) && getToolName(p) === 'suggestReplies',
                );
                const answeredBeforeReplies = message.parts
                  .slice(0, Math.max(0, repliesAt))
                  .some((p) => p.type === 'text' && p.text.trim() !== '');

                return message.parts.map((part, index) => {
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
                    if (answeredBeforeReplies && index > repliesAt) return null;
                    return (
                      <div key={key} className="flex items-start gap-2">
                        <CoachAvatar />
                        <p className="pt-1 text-small whitespace-pre-wrap">{part.text}</p>
                      </div>
                    );
                  }
                  // Data tool results stay hidden. A drawChart call shows the one it points to.
                  // The Excel download is the exception: its card is the whole point of the call.
                  if (isToolUIPart(part) && part.state === 'output-available') {
                    if (getToolName(part) === 'exportToExcel') {
                      return (
                        <ToolCard
                          key={key}
                          toolName="exportToExcel"
                          input={part.input}
                          output={part.output}
                        />
                      );
                    }
                    if (getToolName(part) !== 'drawChart') return null;
                    const parsed = drawChartInputSchema.safeParse(part.input);
                    if (!parsed.success) return null;
                    const source = toolParts
                      .slice(0, toolParts.indexOf(part))
                      .findLast((p) => getToolName(p) === parsed.data.result);
                    if (source?.state !== 'output-available') return null;
                    return (
                      <ToolCard
                        key={key}
                        toolName={getToolName(source)}
                        input={source.input}
                        output={source.output}
                      />
                    );
                  }
                  return null;
                });
              })}

              {waiting && <TypingIndicator />}
              {!busy && !error && messages.length > 0 && (
                <NextQuestions questions={nextQuestions} onAsk={ask} />
              )}
              {error && (
                <p className="rounded-md border border-line bg-card px-4 py-2 text-small">
                  Your advisor could not answer just now. Please try again.
                </p>
              )}
            </div>
          </>
        )}
        {/* Docked, the text field itself invites into the chat: one row, so the card stays in view. */}
        <ChatComposer docked={!open} disabled={busy} onSend={ask} onFocus={() => setOpen(true)} />
      </div>
    </>
  );
}
