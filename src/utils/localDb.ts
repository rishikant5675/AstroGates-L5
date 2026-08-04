export interface AstroGatesLink {
  id: string;
  title: string;
  longUrl: string;
  creatorAddress: string;
  price: number;
  token: 'XLM' | 'USDC';
  tokenId: string;
  clicks: number;
  earnings: number;
  createdAt: number;
  webhookUrl?: string;
}

const STORAGE_KEY = 'astrogates_links';

const isBrowser = () => typeof window !== 'undefined';

export function getLinks(): AstroGatesLink[] {
  if (!isBrowser()) return [];
  const data = window.localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('localDb: Error parsing astrogates links:', e);
    return [];
  }
}

export function saveLinks(links: AstroGatesLink[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  } catch (e) {
    console.error('localDb: Error saving astrogates links:', e);
  }
}

export function getLinkById(id: string): AstroGatesLink | undefined {
  const links = getLinks();
  return links.find(l => l.id === id);
}

export function createLink(data: Omit<AstroGatesLink, 'id' | 'clicks' | 'earnings' | 'createdAt'>): AstroGatesLink {
  const links = getLinks();
  
  let longUrl = data.longUrl.trim();
  if (!/^https?:\/\//i.test(longUrl)) {
    longUrl = 'https://' + longUrl;
  }

  const newLink: AstroGatesLink = {
    ...data,
    longUrl,
    id: Math.random().toString(36).substring(2, 9),
    clicks: 0,
    earnings: 0,
    createdAt: Date.now()
  };
  
  links.unshift(newLink);
  saveLinks(links);
  return newLink;
}

export function updateLinkStats(id: string, updates: { clicks?: number; earnings?: number }): void {
  const links = getLinks();
  const idx = links.findIndex(l => l.id === id);
  if (idx !== -1) {
    if (updates.clicks !== undefined) {
      links[idx].clicks += updates.clicks;
    }
    if (updates.earnings !== undefined) {
      links[idx].earnings += updates.earnings;
    }
    saveLinks(links);
  }
}

export function deleteLink(id: string): void {
  const links = getLinks();
  const filtered = links.filter(l => l.id !== id);
  saveLinks(filtered);
}

export interface DashboardStats {
  totalRevenueXLM: number;
  totalRevenueUSDC: number;
  totalClicks: number;
  totalLinks: number;
}

export function getDashboardStats(): DashboardStats {
  const links = getLinks();
  let totalRevenueXLM = 0;
  let totalRevenueUSDC = 0;
  let totalClicks = 0;

  links.forEach(l => {
    totalClicks += l.clicks;
    if (l.token === 'XLM') {
      totalRevenueXLM += l.earnings;
    } else {
      totalRevenueUSDC += l.earnings;
    }
  });

  return {
    totalRevenueXLM,
    totalRevenueUSDC,
    totalClicks,
    totalLinks: links.length
  };
}
