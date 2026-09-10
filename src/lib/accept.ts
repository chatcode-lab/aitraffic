export function negotiate(accept: string | null): 'html' | 'markdown' | 'unacceptable' {
  if (!accept?.trim()) return 'html';
  const ranges = accept.toLowerCase().split(',').map((part) => {
    const [type, ...params] = part.trim().split(';').map((s) => s.trim());
    const qtext = params.find((p) => p.startsWith('q='))?.slice(2);
    const q = qtext === undefined ? 1 : /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(qtext) ? Number(qtext) : 0;
    return { type, q };
  });
  const quality = (type: string) => {
    for (const match of [type, 'text/*', '*/*']) {
      const found = ranges.filter((r) => r.type === match);
      if (found.length) return Math.max(...found.map((r) => r.q));
    }
    return 0;
  };
  const html = quality('text/html');
  const md = quality('text/markdown');
  const explicitMd = ranges.some((r) => r.type === 'text/markdown' && r.q > 0);
  if (explicitMd && md > 0 && md >= html) return 'markdown';
  return html > 0 ? 'html' : 'unacceptable';
}
