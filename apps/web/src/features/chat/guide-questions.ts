/** The guided path through the customer's own data. Each question leads to one coach tool. */
export const GUIDE_QUESTIONS = [
  { label: 'My monthly breakdown', question: 'Show me my monthly breakdown for last month.' },
  {
    label: 'How I compare to people my age',
    question: 'How does my spending compare to people my age?',
  },
  { label: 'How much I can spend this week', question: 'How much can I safely spend this week?' },
] as const;
