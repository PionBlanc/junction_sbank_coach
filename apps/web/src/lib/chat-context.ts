import type { ChatStatus, UIMessage } from 'ai';
import { createContext, useContext } from 'react';

export type ChatContextValue = {
  messages: UIMessage[];
  status: ChatStatus;
  error: Error | undefined;
  busy: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Opens the chat and sends the question, as if the user had typed it. */
  ask: (question: string) => void;
};

export const ChatContext = createContext<ChatContextValue | null>(null);

/** The coach chat, shared so the cards can start a conversation. */
export function useCoachChat(): ChatContextValue {
  const value = useContext(ChatContext);
  if (!value) {
    throw new Error('useCoachChat must be used inside ChatProvider');
  }
  return value;
}
