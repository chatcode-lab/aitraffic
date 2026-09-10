export type Category = 'ai' | 'human' | 'bot' | 'unknown';
export type Classification = { category: Category; label: string; confidence: string };
export const AGENTS = ['OAI-SearchBot', 'GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'] as const;
export function classify(userAgent: string | null, headers: Headers): Classification {
  const ua = (userAgent ?? '').slice(0, 1024);
  const matches = AGENTS.filter((name) => new RegExp(`(?:^|[^a-z0-9-])${name}(?:[^a-z0-9-]|$)`, 'i').test(ua));
  if (matches.length === 1) return { category: 'ai', label: matches[0], confidence: 'Reported User-Agent; not independently verified' };
  if (matches.length > 1) return { category: 'unknown', label: 'Conflicting agent labels', confidence: 'Unverified' };
  if (/bot|crawler|spider|HeadlessChrome|Lighthouse|curl\/|wget\/|python-requests|node|undici/i.test(ua)) return { category: 'bot', label: 'Other automation', confidence: 'User-Agent heuristic' };
  if (/Mozilla\/5\.0/.test(ua) && /Chrome\/|Firefox\/|Safari\//.test(ua) && headers.get('sec-fetch-mode') === 'navigate' && headers.get('sec-fetch-dest') === 'document') return { category: 'human', label: 'Estimated human', confidence: 'Browser navigation heuristic; may include automation' };
  return { category: 'unknown', label: 'Unclassified', confidence: 'Insufficient evidence' };
}
export const isPrefetch = (headers: Headers) => /prefetch|prerender|preview/i.test([headers.get('purpose'), headers.get('sec-purpose'), headers.get('x-purpose'), headers.get('x-moz')].join(' '));
