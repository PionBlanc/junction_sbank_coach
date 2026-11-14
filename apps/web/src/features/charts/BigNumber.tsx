import { formatEur } from '../../lib/format.ts';

type BigNumberProps = { valueEur: number; caption: string };

/** One number instead of a chart. */
export function BigNumber(props: BigNumberProps) {
  return (
    <div className="flex h-36 flex-col items-center justify-center gap-1">
      <span className="text-6xl font-semibold text-brand">{formatEur(props.valueEur)}</span>
      <span className="text-sm text-muted">{props.caption}</span>
    </div>
  );
}
