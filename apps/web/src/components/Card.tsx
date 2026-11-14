import type { ReactNode } from 'react';

type CardProps = { title?: string; children: ReactNode };

export function Card(props: CardProps) {
  return (
    <section className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-sm">
      {props.title && (
        <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">{props.title}</h2>
      )}
      {props.children}
    </section>
  );
}
