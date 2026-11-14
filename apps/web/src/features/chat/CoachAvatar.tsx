type CoachAvatarProps = { size?: 'sm' | 'md' };

/**
 * The advisor's badge: a coin with eyes, the same coin that flies into the total on a match.
 * Used in the chat bar and next to its messages.
 */
export function CoachAvatar(props: CoachAvatarProps) {
  const size = props.size === 'md' ? 'size-10' : 'size-7';
  return (
    <span aria-hidden className={`flex shrink-0 overflow-hidden rounded-full bg-lime ${size}`}>
      <svg viewBox="0 0 24 24" className="size-full">
        <g className="fill-ink">
          <ellipse cx="9.6" cy="11" rx="2.2" ry="3.8" />
          <ellipse cx="16.4" cy="11" rx="2.2" ry="3.8" />
        </g>
      </svg>
    </span>
  );
}
