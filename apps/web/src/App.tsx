import { CardDeck } from './features/cards/CardDeck.tsx';
import { Chat } from './features/chat/Chat.tsx';
import { ChatProvider } from './features/chat/ChatProvider.tsx';
import { UserProvider } from './features/user/UserProvider.tsx';
import { UserSwitcher } from './features/user/UserSwitcher.tsx';

/** Registration only: one line per page section. */
export function App() {
  return (
    <div className="min-h-dvh bg-card text-ink tabular-nums">
      <UserProvider>
        <ChatProvider>
          <main className="mx-auto flex min-h-dvh max-w-[390px] flex-col gap-4 bg-surface p-4 sm:border-x sm:border-line">
            <UserSwitcher />
            <CardDeck />
            <Chat />
          </main>
        </ChatProvider>
      </UserProvider>
    </div>
  );
}
