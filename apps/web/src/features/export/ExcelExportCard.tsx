import { excelExportFileName, type ExcelExport } from '@coach/shared';
import { useUser } from '../../lib/user-context.ts';

type ExcelExportCardProps = { data: ExcelExport };

/** The Excel file as a small file row: icon, file name, download button. The coach says what is in it. */
export function ExcelExportCard(props: ExcelExportCardProps) {
  const { userId } = useUser();
  const query = { fromMonth: props.data.fromMonth, toMonth: props.data.toMonth };
  const fileName = excelExportFileName(query);
  // A plain relative link: the API client's $url() needs an absolute base and throws without one.
  const href = `/api/users/${encodeURIComponent(userId)}/export?${new URLSearchParams(query).toString()}`;

  return (
    <div className="flex items-center gap-3 rounded-md border border-line bg-card p-2 pl-3">
      <svg viewBox="0 0 24 24" className="size-8 shrink-0" aria-hidden>
        <path d="M6 2h9l5 5v15H6z" fill="var(--color-brand)" />
        <path d="M15 2v5h5" fill="var(--color-card)" opacity="0.4" />
        <path
          d="M9.5 11l5 7m0-7l-5 7"
          stroke="var(--color-card)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="min-w-0 flex-1 truncate text-small font-medium">{fileName}</span>
      <a
        href={href}
        download={fileName}
        aria-label={`Download ${fileName}`}
        className="flex size-11 shrink-0 items-center justify-center rounded-md bg-brand text-card"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
          <path d="M10 3a1 1 0 0 1 1 1v7.6l2.3-2.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L9 11.6V4a1 1 0 0 1 1-1ZM4 15a1 1 0 0 1 1 1v1h10v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
        </svg>
      </a>
    </div>
  );
}
