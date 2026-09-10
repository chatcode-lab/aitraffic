# SEO and agent-use playbook

Prepared 10 September 2026. This is the project's operating policy, adapted from MultiPass Rank's 7 September guide. The historical findings below are context, not measurements of this new site or promises of future growth.

## 1. What transfers from MultiPass Rank

| Dated observation from the source project | Transferable decision | What it does not establish |
| --- | --- | --- |
| Its 7 September popular-pages export recorded 7,884 requests; 5,799 targeted specific passport–destination facts and 929 requested Markdown. | Offer precise, stable, source-aware pages and a native Markdown representation. | That Markdown caused traffic, citations, or search growth. The export is a sample, not all site traffic. |
| The unmet-demand export had 382 requests: 298 recognizable relationship requests, 9 directory requests, and 75 secret/admin/framework probes. | Classify misses before fixing routes; curate aliases and leave probes as cheap errors. | That all misses are useful demand or even all have the same HTTP status. |
| “Nauru” changed to an upstream label “Naoero,” breaking paths until stable identity and aliases were restored. | Separate stable IDs/canonical slugs from vendor display names. | Permission to fuzzy-redirect unknown strings to plausible content. |
| One observed 24-hour snapshot was led by PerplexityBot. | Record bot mix and time window; serve the whole interface reliably. | A durable market share, a verified user identity, or proof of citations. |
| Mobile represented 254/353 clicks in the older search export; a later device report had 560/827 impressions. | Make mobile a first-class interface and test it explicitly. | A valid growth comparison between clicks and impressions or different windows. |
| A 1,225-pair keyword sweep yielded little exact-query demand; focused aliases and first-party evidence supported a small curated set. | Favor bounded, intent-led research over a combinatorial page factory. | Current keyword demand for AI traffic topics. No such research has been bought for this project. |
| The old data model generated 76.57 million KV reads in a billing month. | Static publication first; measure request amplification before introducing storage. | A guarantee of free hosting at any traffic volume. |
| A 1,000-URL noindex report mixed correctly excluded scenarios, pending evidence, stale URLs, and pages already fixed. | Audit live directives and intent before changing index policy. | That every “Excluded by noindex” message is a bug. |

The source guide also records 827 impressions in a device/chart aggregation and 841 in its Pages export. Do not add or directly reconcile them as if they were disjoint events. Export dimensions, filters, limits, and dates belong with every conclusion.

These are documentary observations from the source project's guide, not a fresh re-analysis of private CSVs. Recheck and obtain owner review before using them in a public case study. No raw source exports are part of this handoff.

## 2. Keep the metrics distinct

| Signal | Defensible interpretation | Do not rename it as |
| --- | --- | --- |
| Request with a crawler-looking user agent | Reported identity signal | Verified operator, person, or citation |
| Request matching a documented verification mechanism | Verified identity to the extent that mechanism supports | Proof of a particular training/search use unless separately documented |
| Provider's aggregated agent report | Provider-classified requests under that report's definitions | Independently verified user-level activity |
| AI-platform referrer on a measured visit | Observable referred visit | All AI influence, including visits with missing referrers |
| Citation found in a sampled assistant answer | Observed citation in that answer/sample | A complete citation count or a resulting site visit |
| Search Console impressions/clicks | Search activity within that report's dimensions | AI crawler requests |

Keep identity confidence and crawler purpose separate. Vendor classifications may describe a role, but a path/count-only CSV cannot verify it. Unknown or not observable is an honest output.

Cloudflare exposes crawler/path analytics and distinguishes referral metrics; feature availability and the report schema must be checked for the actual account. Its documentation is a reference for definitions, not evidence that every exported row contains all dashboard fields. [Analyze AI traffic](https://developers.cloudflare.com/ai-crawl-control/features/analyze-ai-traffic/).

## 3. Content quality and publication

- Answer a real question with a useful method, tested example, original measurement, or careful primary-source synthesis.
- Link claims to current official technical documentation; use firsthand tests for observed behavior. Forum posts can suggest questions, not prove undocumented vendor behavior.
- Record the source, checked date, software/configuration version when relevant, and uncertainty. Do not refresh dates automatically without review.
- Separate source evidence, author inference, and product advice. Explain limitations without burying the useful answer.
- Publish only reviewed content. Drafts, filler, scraped rewrites, and unmaintainable permutations do not belong in the index.
- Keep stable URLs after publication. One intent should have one canonical landing page unless there is a genuinely distinct answer.

Do not claim that special AI files or markup improve Google visibility. Google's current guidance says ordinary search fundamentals apply and does not require Markdown or `llms.txt` for its generative search features. Maintain them here for useful agent access, not as a ranking hack. [Google's AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

## 4. Search and agent interface requirements

- Render the actual answer, headings, sources, and navigation in initial HTML. JavaScript is enhancement, not the only path to content.
- Give articles specific titles and descriptions. Use a tested 70-character title ceiling as an editorial safeguard learned from Bing warnings, not a universal ranking rule.
- Use one absolute canonical URL. Only canonical, reviewed, indexable HTML pages go into sitemaps.
- Give every substantive article/tool guide a maintained `.md` equivalent. Advertise it visibly and in metadata. Negotiation and caches must follow [the architecture contract](architecture.md).
- Publish a small `/ai` usage guide, `/llms.txt`, and JSON catalog from real routes. No undocumented phantom API or protocol compliance badges.
- Document how to cite a page and its underlying source, interpret review dates, and reproduce a tool result. Maintain the same answer across formats.
- Use real links and stable descriptive anchors. A link should not depend on a JavaScript click handler or require navigating a search UI.
- Use only accurate structured data: Article/TechArticle for suitable content, WebSite, BreadcrumbList, and SoftwareApplication only where it genuinely describes the tool. Dataset is for an actual dataset with defined creator, license, and provenance—not every article with a table.
- No cloaking or bot-only claims: negotiated Markdown carries the same substantive content as the human page.
- Keep robots rules, canonical metadata, status codes, `noindex`, and sitemap membership consistent. Do not block a page from crawling when a crawler needs to see its `noindex` directive.

## 5. Sitemaps and redirects

Start with one small `/sitemap.xml`. Split by content family when inventory or debugging makes it useful, not for an assumed ranking boost. The protocol limit is 50,000 URLs or 50 MB uncompressed per sitemap. Use real content-change dates; exclude Markdown, JSON, aliases, redirects, query scenarios, errors, and drafts. [Google's sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

Classify requested-but-unserved paths into useful missing content, recognized aliases, intentionally retired content, authorization errors, infrastructure failures, assets, and likely probes. A demand export alone may not identify the HTTP cause. Never silently repair a 403 by weakening security, or a 500 by redirecting to an unrelated page.

Curated equivalent aliases can permanently redirect to the canonical resource. Preserve representation (`.md` aliases resolve to the corresponding Markdown form) and valid public state. Unknown paths return genuine 404s, not a homepage or generic success shell. Re-test old URLs after changing slugs.

## 6. Performance, mobile, and operating cost

Keep readable content in HTML, scripts scoped to tools, fonts local or system, critical styles small, and images dimensioned. Test real narrow screens and long labels; do not solve overflow by hiding data.

Prioritize the useful answer over a decorative hero. Use an actual PNG/JPEG social image, cached as a shared static asset until unique article images add real value. Keep copy buttons accessible without layout shifts.

A Lighthouse score is diagnostic evidence from a specific run and URL, not proof of field speed. Track transfer size, layout stability, critical requests, and mobile interaction tests alongside it. Verify the origin in reports before changing the wrong site's CSS.

Use no runtime database in the first publication. Before adding any hosted tool, calculate the worst-case external calls, CPU, storage reads/writes, and abuse cost per request. Static delivery still has platform limits; never promise unlimited zero-cost operation.

## 7. Research loop

1. Capture source, export date, date range, filters, row limit, units, and schema. Keep private inputs outside source control.
2. Validate totals and distinguish missing data from zero. Do not add overlapping exports or incompatible dimensions.
3. Identify one reader problem, legitimate route failure, weak answer, or measurable hypothesis.
4. Prefer a shared fix or a genuinely useful tool/article over a larger index inventory.
5. Use paid keyword research only for a bounded question with an approved cap. Record query language/market and actual cost; grouped variants are not additive.
6. Define before/after checks, implement, test mobile and representations, then compare matching windows.
7. Record observations in [the research log](research-log.md). Promote durable findings into this document only when justified.

## Source project and further reading

Baseline: `chatcode-lab/multipass`, commit `1de5a24cc4577e7db0b732cecab2d9a4e5708bad`, inspected 10 September 2026. These links are optional deeper references; this handoff is usable without that repository.

- [Original SEO/AEO playbook](https://github.com/chatcode-lab/multipass/blob/1de5a24cc4577e7db0b732cecab2d9a4e5708bad/docs/seo-aeo-playbook.md)
- [Dated source-project research](https://github.com/chatcode-lab/multipass/blob/1de5a24cc4577e7db0b732cecab2d9a4e5708bad/docs/seo-research.md)
- [Metadata layout reference](https://github.com/chatcode-lab/multipass/blob/1de5a24cc4577e7db0b732cecab2d9a4e5708bad/src/layouts/BaseLayout.astro)
- [Markdown negotiation reference](https://github.com/chatcode-lab/multipass/blob/1de5a24cc4577e7db0b732cecab2d9a4e5708bad/src/lib/markdown-negotiation.ts)
- [Sitemap policy reference](https://github.com/chatcode-lab/multipass/blob/1de5a24cc4577e7db0b732cecab2d9a4e5708bad/src/lib/sitemap.ts)

Do not copy source behavior blindly. The original negotiator accepts any positive explicit Markdown quality even when HTML is preferred, and uses a broad path heuristic. This project deliberately specifies preference-aware selection and a positive route registry instead.

Primary guidance checked for this handoff on 10 September 2026: Google's AI optimization and sitemap pages, Cloudflare's Markdown for Agents, AI traffic analysis, and Worker/static-asset routing documentation, linked alongside the relevant decisions. Recheck changing platform behavior during implementation. Local product budgets and route policy are our design choices, not vendor promises.
