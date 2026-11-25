/** Where people can give money to ORQWA, used by the Support page and the links to it. */
export const SPONSORS_URL = 'https://github.com/sponsors/ORQWA';
/** False until GitHub approves the Sponsors profile: the page shows the tiers but no link to it. */
export const SPONSORS_OPEN = false;
export const COFFEE_URL = 'https://buymeacoffee.com/boss.m8';

/** The GitHub Sponsors tiers, as set up on GitHub. */
export const TIERS = [
  { amount: 5, reward: 'Sponsor badge on your GitHub profile' },
  { amount: 25, reward: 'Your name or logo in the README' },
  { amount: 100, reward: 'Your name or logo on this website' },
] as const;

/** The tier whose sponsors are listed on the Support page. */
export const WEBSITE_TIER = 100;
