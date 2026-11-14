type ArrowButtonProps = {
  direction: 'previous' | 'next';
  disabled: boolean;
  onClick: () => void;
};

/** Previous or next card, for the laptop demo and for people who do not swipe. */
export function ArrowButton(props: ArrowButtonProps) {
  return (
    <button
      type="button"
      aria-label={props.direction === 'next' ? 'Next card' : 'Previous card'}
      className="flex size-11 items-center justify-center rounded-md text-muted hover:bg-fill disabled:opacity-30"
      disabled={props.disabled}
      onClick={props.onClick}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
        <path
          d={
            props.direction === 'next'
              ? 'M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4Z'
              : 'M12.7 4.3a1 1 0 0 1 0 1.4L8.4 10l4.3 4.3a1 1 0 0 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z'
          }
        />
      </svg>
    </button>
  );
}
