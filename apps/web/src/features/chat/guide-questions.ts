/** The guided path through the customer's own data. Each question leads to one coach tool. */
export const GUIDE_QUESTIONS = [
  {
    label: 'What did last month look like?',
    question: 'Can you show me my monthly breakdown for last month?',
  },
  {
    label: 'How do I compare to people my age?',
    question: 'How does my spending compare to people my age?',
  },
  { label: 'How much can I spend this week?', question: 'How much can I safely spend this week?' },
  { label: 'What kind of spender am I?', question: 'What kind of spender am I?' },
  { label: 'What changed last month?', question: 'What changed in my spending last month?' },
  {
    label: 'What were my biggest purchases?',
    question: 'What were my biggest purchases in the last 12 months?',
  },
  {
    label: 'Where does my money go?',
    question: 'Can you show me where my money went in the last 12 months?',
  },
  {
    label: 'How do my income and spending compare?',
    question: 'Can you show me my income and spending month by month for the last 12 months?',
  },
  { label: 'Am I spending more than last year?', question: 'Am I spending more than last year?' },
  { label: 'Is my spending going up?', question: 'Is my spending going up?' },
  {
    label: 'Can you show me a six month spending breakdown?',
    question: 'Can you show me a six month spending breakdown?',
  },
  { label: 'How has my balance changed?', question: 'Can you show me how my balance has changed?' },
  {
    label: 'How do my needs and wants change over the year?',
    question: 'Can you show me my spending by type month by month?',
  },
  {
    label: 'How big are my usual purchases?',
    question: 'How big is a typical purchase of mine in each category?',
  },
  { label: 'Where could I free up money?', question: 'Where could I free up money?' },
  {
    label: 'How much have I invested?',
    question: 'Can you show me how much I have invested in the last 12 months?',
  },
  {
    label: 'What if I put aside 100 € a month?',
    question: 'What if I put aside 100 € a month?',
  },
  {
    label: 'Can I get my data as an Excel file?',
    question: 'Can I get my data from the last 12 months as an Excel file?',
  },
] as const;
