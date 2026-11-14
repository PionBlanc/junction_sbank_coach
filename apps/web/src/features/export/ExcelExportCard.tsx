import type { ExcelExport } from '@coach/shared';
import { api } from '../../api/client.ts';
import { Card } from '../../components/Card.tsx';
import { formatMonth } from '../../lib/format.ts';
import { useUser } from '../../lib/user-context.ts';

type ExcelExportCardProps = { data: ExcelExport };

/** A download button for the customer's data as an Excel file. The coach says what is in it. */
export function ExcelExportCard(props: ExcelExportCardProps) {
  const { userId } = useUser();
  const { fromMonth, toMonth } = props.data;
  const href = api.users[':id'].export
    .$url({ param: { id: userId }, query: { fromMonth, toMonth } })
    .toString();
  const period =
    fromMonth === toMonth
      ? formatMonth(fromMonth)
      : `${formatMonth(fromMonth)} to ${formatMonth(toMonth)}`;

  return (
    <Card title={`Your data · ${period}`}>
      <a
        href={href}
        download
        className="flex h-11 items-center justify-center gap-2 rounded-md bg-brand text-small font-semibold text-card"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
          <path d="M10 3a1 1 0 0 1 1 1v7.6l2.3-2.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L9 11.6V4a1 1 0 0 1 1-1ZM4 15a1 1 0 0 1 1 1v1h10v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
        </svg>
        Download Excel file
      </a>
    </Card>
  );
}
