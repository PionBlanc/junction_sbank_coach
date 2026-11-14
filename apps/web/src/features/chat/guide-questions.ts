/** The guided path through the customer's own data. Each question leads to one coach tool. */
export const GUIDE_QUESTIONS = [
  { label: 'My monthly breakdown', question: 'Show me my monthly breakdown for last month.' },
  {
    label: 'How I compare to people my age',
    question: 'How does my spending compare to people my age?',
  },
  { label: 'How much I can spend this week', question: 'How much can I safely spend this week?' },
  { label: 'What kind of spender am I?', question: 'What kind of spender am I?' },
  { label: 'What changed last month?', question: 'What changed in my spending last month?' },
  {
    label: 'My biggest purchases',
    question: 'What were my biggest purchases in the last 12 months?',
  },
  {
    label: 'Where does my money go?',
    question: 'Show me where my money went in the last 12 months.',
  },
  {
    label: 'Income vs spending',
    question: 'Show me my income and spending month by month for the last 12 months.',
  },
  { label: 'Am I spending more than last year?', question: 'Am I spending more than last year?' },
  { label: 'Is my spending going up?', question: 'Is my spending going up?' },
  {
    label: 'Show me a six month spending breakdown',
    question: 'Show me a six month spending breakdown',
  },
  { label: 'My balance over time', question: 'Show me how my balance has changed.' },
  {
    label: 'Needs and wants over the year',
    question: 'Show me my spending by type month by month.',
  },
  {
    label: 'How big are my usual purchases?',
    question: 'How big is a typical purchase of mine in each category?',
  },
  { label: 'Where could I free up money?', question: 'Where could I free up money?' },
  {
    label: 'What if I put aside 100 € a month?',
    question: 'What if I put aside 100 € a month?',
  },
  {
    label: 'My data as an Excel file',
    question: 'Can I get my data from the last 12 months as an Excel file?',
  },
] as const;
