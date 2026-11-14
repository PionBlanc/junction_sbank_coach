type CoachAvatarProps = { size?: 'sm' | 'md' };

/** The advisor's badge: a small robot in a suit, used in the chat header and next to its messages. */
export function CoachAvatar(props: CoachAvatarProps) {
  const size = props.size === 'md' ? 'size-10' : 'size-7';
  return (
    <span aria-hidden className={`flex shrink-0 overflow-hidden rounded-md bg-brand ${size}`}>
      <svg viewBox="0 0 24 24" className="size-full">
        <g className="fill-card">
          <circle cx="12" cy="2.6" r="1.1" />
          <rect x="11.5" y="3" width="1" height="2.5" />
          <rect x="6" y="5" width="12" height="8.5" rx="2.5" />
          <rect x="4.6" y="7.8" width="1.6" height="3" rx="0.6" />
          <rect x="17.8" y="7.8" width="1.6" height="3" rx="0.6" />
          <rect x="10.8" y="13" width="2.4" height="2.2" />
        </g>
        <g className="fill-brand">
          <circle cx="9.5" cy="8.8" r="1.3" />
          <circle cx="14.5" cy="8.8" r="1.3" />
        </g>
        <path
          d="M10 11q2 1.4 4 0"
          className="fill-none stroke-brand"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <path className="fill-chart-focus" d="M3.5 24v-3a6 6 0 0 1 6-6h5a6 6 0 0 1 6 6v3Z" />
        <path className="fill-card" d="M9.2 15h5.6L12 21Z" />
        <path
          className="fill-brand"
          d="M11.2 15h1.6l-.3 1.2h-1ZM11.5 16.2h1l.6 3.6L12 21l-1.1-1.2Z"
        />
      </svg>
    </span>
  );
}
