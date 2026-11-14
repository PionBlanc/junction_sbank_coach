import { DATA_END_DATE } from '@coach/shared';
import { formatMonth } from '../../lib/format.ts';
import { CoachAvatar } from './CoachAvatar.tsx';
import { NextQuestions } from './NextQuestions.tsx';

const LAST_MONTH = DATA_END_DATE.slice(0, 7);

type CoachGreetingProps = { onAsk: (question: string) => void };

/** The coach speaks first in an empty chat, so the customer learns what it can show them. */
export function CoachGreeting(props: CoachGreetingProps) {
  return (
    <>
      <div className="flex items-start gap-2">
        <CoachAvatar />
        <p className="pt-1 text-small">
          Hi! I&apos;m your financial advisor. Want to see your monthly breakdown for{' '}
          {formatMonth(LAST_MONTH)}? Or pick something else below.
        </p>
      </div>
      <NextQuestions asked={[]} onAsk={props.onAsk} />
    </>
  );
}
