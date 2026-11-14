import type { MortgageApplication } from '@coach/shared';
import { Card } from '../../components/Card.tsx';
import { formatShortDay } from '../../lib/format.ts';
import { RowBars } from '../charts/RowBars.tsx';

type MortgageApplicationCardProps = {
  application: NonNullable<MortgageApplication['application']>;
};

/** The application's key figures as bars, then its steps with dates. The coach explains them. */
export function MortgageApplicationCard(props: MortgageApplicationCardProps) {
  const { decision, propertyPriceEur, collateralValueEur, loanEur, equityEur, steps } =
    props.application;
  const approved = decision === 'approved';

  return (
    <Card title={`Mortgage application · ${approved ? 'Approved' : 'Rejected'}`}>
      <RowBars
        rows={[
          { label: 'Price', valueEur: propertyPriceEur },
          { label: 'Valued at', valueEur: collateralValueEur },
          { label: 'Loan', valueEur: loanEur },
          { label: 'Your equity', valueEur: equityEur },
        ]}
      />
      <ol className="flex flex-col gap-1 text-small">
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          return (
            <li key={`${step.date}-${step.label}`} className="flex gap-3">
              <span className="w-14 shrink-0 text-muted">{formatShortDay(step.date)}</span>
              <span
                className={
                  last ? `font-semibold ${approved ? 'text-positive' : 'text-negative'}` : undefined
                }
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
