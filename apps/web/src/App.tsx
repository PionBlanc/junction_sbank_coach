import { ActionList } from './features/actions/ActionList.tsx';
import { BasketBar } from './features/baskets/BasketBar.tsx';
import { Chat } from './features/chat/Chat.tsx';
import { SafeToSpendHero } from './features/safe-to-spend/SafeToSpendHero.tsx';
import { UserProvider } from './features/user/UserProvider.tsx';
import { UserSwitcher } from './features/user/UserSwitcher.tsx';

/** Registration only: one line per page section. */
export function App() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <UserProvider>
        <main className="mx-auto flex max-w-[390px] flex-col gap-4 p-4 pb-40">
          <UserSwitcher />
          <SafeToSpendHero />
          <BasketBar />
          <ActionList />
        </main>
        <Chat />
      </UserProvider>
    </div>
  );
}
