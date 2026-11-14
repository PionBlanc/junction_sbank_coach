import type { SwipeProfile } from '../../insights/actions/swipe-profile.ts';

/** Added to the system prompt once the customer has swiped through saving ideas. */
export function swipeProfilePrompt(profile: SwipeProfile): string {
  const downToTry = profile.downToTry.map(
    (a) => `- ${a.title} (frees up about ${Math.round(a.savingPerMonthEur)} € a month)`,
  );
  const worthIt = profile.worthIt.map((a) => `- ${a.title}`);

  return `

The customer's swipes:
The app showed the customer saving ideas as cards. They swiped right on the ones they are down to try and left on spending that is worth it to them. The numbers below come from the app, so you may state them.
Down to try:
${downToTry.length > 0 ? downToTry.join('\n') : '- nothing yet'}
Together these free up about ${Math.round(profile.downToTryPerMonthEur)} € a month.
Worth it to them:
${worthIt.length > 0 ? worthIt.join('\n') : '- nothing yet'}
- Build your suggestions on the ideas they are down to try. Make them concrete and small.
- Never suggest changing the spending that is worth it to them, and say it is a fine choice if it comes up.`;
}
