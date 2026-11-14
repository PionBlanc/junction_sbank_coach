/**
 * The starter questions in an empty chat. Few on purpose: everything else the customer asks by
 * typing, and the coach suggests follow-ups after each answer.
 */
export const GUIDE_QUESTIONS = [
  {
    label: 'What did last month look like?',
    question: 'Can you show me my monthly breakdown for last month?',
  },
  { label: 'What kind of spender am I?', question: 'What kind of spender am I?' },
  { label: 'Where could I free up money?', question: 'Where could I free up money?' },
] as const;
