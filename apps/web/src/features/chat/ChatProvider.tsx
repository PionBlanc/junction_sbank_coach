import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, type ReactNode } from 'react';
import { ChatContext } from '../../lib/chat-context.ts';
import { useSwipes } from '../../lib/swipe-context.ts';
import { useUser } from '../../lib/user-context.ts';

type ChatProviderProps = { children: ReactNode };

/** Holds the chat with the coach, so both the chat and the cards can use it. */
export function ChatProvider(props: ChatProviderProps) {
  const { userId } = useUser();
  const { swipes } = useSwipes();
  const [transport] = useState(
    () => new DefaultChatTransport({ api: `/api/users/${userId}/chat` }),
  );
  const { messages, sendMessage, status, error } = useChat({ transport });
  const [open, setOpen] = useState(false);
  const busy = status === 'submitted' || status === 'streaming';

  function ask(question: string) {
    if (busy || question.trim() === '') return;
    setOpen(true);
    // Only the ids: the server looks up the ideas and their numbers itself.
    const acceptedIds = swipes.filter((s) => s.liked).map((s) => s.id);
    const rejectedIds = swipes.filter((s) => !s.liked).map((s) => s.id);
    void sendMessage({ text: question }, { body: { acceptedIds, rejectedIds } });
  }

  return (
    <ChatContext value={{ messages, status, error, busy, open, setOpen, ask }}>
      {props.children}
    </ChatContext>
  );
}
