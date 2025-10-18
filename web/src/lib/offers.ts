import type { AgentKey } from './types';

export const OFFERS: Record<AgentKey, { href: string; text: string }> = {
  itaobuy: { href: 'https://itaobuy.allapp.link/d3ifs71qljosn6qib2ig', text: 'Register to get $300 in shipping coupons.' },
  cnfans: { href: 'https://cnfans.com/register?ref=15929430', text: 'Register to get $125 in shipping coupons.' },
  superbuy: { href: 'https://www.superbuy.com/en/page/login?partnercode=Eygtwu&type=register', text: 'Join Superbuy – welcome coupons & fast support.' },
  mulebuy: { href: 'https://mulebuy.com/register?ref=200663493', text: 'Register at MuleBuy – grab your referral shipping bonus.' },
  allchinabuy: { href: 'https://www.allchinabuy.com/en/page/login?partnercode=EygLjT&type=register', text: 'AllChinaBuy welcome offer – claim bonus coupons.' },
};
