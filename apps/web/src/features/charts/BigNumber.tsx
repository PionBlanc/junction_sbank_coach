type BigNumberProps = { text: string; caption: string };

/** One number instead of a chart. The caller formats it. */
export function BigNumber(props: BigNumberProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 py-4">
      <span className="text-display font-semibold">{props.text}</span>
      <span className="text-small text-muted">{props.caption}</span>
    </div>
  );
}
