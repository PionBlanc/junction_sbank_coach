type LoadErrorProps = { message: string; onRetry: () => void };

/** A failed request: what went wrong and a way to try again. Red is kept for money. */
export function LoadError(props: LoadErrorProps) {
  return (
    <div className="flex flex-col items-start">
      <p className="text-small text-muted">Could not load: {props.message}</p>
      <button
        type="button"
        className="flex min-h-11 items-center text-small font-semibold text-brand"
        onClick={props.onRetry}
      >
        Try again
      </button>
    </div>
  );
}
