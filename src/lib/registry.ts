import site from '../data/site.json';
export { site };
export type Page = Omit<(typeof site.pages)[number], 'sources' | 'related'> & { sources: string[]; related: string[] };
export const pages: Page[] = site.pages.filter((p) => p.status === 'published');
export const guides = pages.filter((p) => p.kind === 'guide');
export const pageByPath = (path: string) => pages.find((p) => p.path === path);
export const markdownPath = (path: string) => path === '/' ? '/index.md' : `${path}.md`;
export const isMeasured = (page: Page) => !['lab', 'test'].includes(page.kind);
export const verificationPath = (path: string) => `/live-lab/pages/${pageByPath(path)?.id ?? 'home'}`;
