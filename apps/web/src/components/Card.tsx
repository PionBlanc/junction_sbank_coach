import type { ReactNode } from 'react';

type CardProps = { title?: string; children: ReactNode };

export function Card(props: CardProps) {
  return (
    <section className="flex flex-col gap-4 rounded-lg bg-card p-4">
      {props.title && <h2 className="font-display text-body font-bold">{props.title}</h2>}
      {props.children}
    </section>
  );
}
