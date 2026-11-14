import type { SwipeProfile } from '../../insights/actions/swipe-profile.ts';

/** Added to the system prompt once the customer has swiped through saving ideas. */
export function swipeProfilePrompt(profile: SwipeProfile): string {
  const downToTry = profile.downToTry.map(
    (a) => `- ${a.title} (frees up about ${Math.round(a.savingPerMonthEur)} € a month)`,
  );
  const worthIt = profile.worthIt.map((a) => `- ${a.title}`);
  const planIdeas = profile.planIdeas.map(
    (a, index) =>
      `${index + 1}. ${a.title}: frees up about ${Math.round(a.savingPerMonthEur)} € a month. Why: ${a.explanation}`,
  );

  return `

The customer's swipes:
The app showed the customer saving ideas as cards. They swiped right on the ones they are down to try and left on spending that is worth it to them. The numbers below come from the app, so you may state them.
Down to try:
${downToTry.length > 0 ? downToTry.join('\n') : '- nothing yet'}
Together these free up about ${Math.round(profile.downToTryPerMonthEur)} € a month.
Worth it to them:
${worthIt.length > 0 ? worthIt.join('\n') : '- nothing yet'}
- Build your suggestions on the ideas they are down to try. Make them concrete and small.
- Never suggest changing the spending that is worth it to them, and say it is a fine choice if it comes up.

Making a plan:
When the customer asks for a plan, build it on these ideas, biggest first:
${planIdeas.length > 0 ? planIdeas.join('\n') : '- none: they did not swipe right on any idea'}
Together these free up about ${Math.round(profile.planPerMonthEur)} € a month.
A plan is the one exception to the length and no-lists rules above. Write a proper plan in plain text:
- One or two opening sentences: what the plan is and the monthly total above.
- Then one numbered step per idea, in the order above, each on its own line starting with "1.", "2." and so on. Each step names the idea, gives one or two concrete, small things to do starting this week, and says how much it frees up a month.
- Then one line on how to keep going, for example checking in after the first week or month.
- End with the usual closing question and suggestReplies.
- No Markdown symbols such as asterisks or hashes. Use only the numbers given here: no new amounts, no totals of your own, and no tool calls for the plan itself.
- If there are no ideas, say so kindly and offer to look at their spending together instead.`;
}
