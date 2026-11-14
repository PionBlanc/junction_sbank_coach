type CoachAvatarProps = { size?: 'sm' | 'md' };

/** The coach's round badge, used in the chat header and next to its messages. */
export function CoachAvatar(props: CoachAvatarProps) {
  const size = props.size === 'md' ? 'size-10 text-base' : 'size-7 text-xs';
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand font-bold text-card ${size}`}
    >
      €
    </span>
  );
}
