import { useSpenderGroup } from '../../api/useSpenderGroup.ts';
import { useUser } from '../../lib/user-context.ts';
import { SpenderGroupIcon } from './SpenderGroupIcon.tsx';
import { SpenderGroupText } from './SpenderGroupText.tsx';

/**
 * "My spending profile", always in the top right corner, showing the group's badge and name.
 * Hovering (or tapping, which focuses it) opens the explanation.
 */
export function SpenderGroupExplain() {
  const { userId } = useUser();
  const group = useSpenderGroup(userId);

  return (
    <div className="group sticky top-2 z-20 -mb-2 self-end">
      <button
        type="button"
        aria-describedby="spender-group-explain"
        className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-card py-1 pr-4 pl-1 shadow-sm"
      >
        {group.data ? (
          <SpenderGroupIcon groupId={group.data.groupId} size="sm" />
        ) : (
          <span className="size-9 rounded-lg bg-fill" />
        )}
        <span className="flex flex-col text-left">
          <span className="text-caption text-muted">My spending profile</span>
          <span className="text-small font-semibold">{group.data?.label ?? '…'}</span>
        </span>
      </button>
      <div
        id="spender-group-explain"
        role="tooltip"
        className="invisible absolute top-full right-0 mt-2 w-72 rounded-lg border border-line bg-card p-4 opacity-0 shadow-xl transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {group.isPending && <p className="text-small text-muted">Loading…</p>}
        {group.isError && (
          <p className="text-small text-muted">Could not load: {group.error.message}</p>
        )}
        {group.data && (
          <div className="flex items-start gap-4">
            <SpenderGroupIcon groupId={group.data.groupId} />
            <SpenderGroupText group={group.data} />
          </div>
        )}
      </div>
    </div>
  );
}
