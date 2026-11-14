type BigNumberProps = { text: string; caption: string };

/** One number instead of a chart. The caller formats it. */
export function BigNumber(props: BigNumberProps) {
  return (
    <div className="flex h-36 flex-col items-center justify-center gap-1">
      <span className="text-6xl font-semibold text-brand">{props.text}</span>
      <span className="text-sm text-muted">{props.caption}</span>
    </div>
  );
}
