# Build plan and acceptance gates

## Current owner-selected preview — 10 September 2026

The owner selected `aitrafficanalytic-build-prompt.md` and authorized public GitHub creation, reasonable DataForSEO research, Cloudflare deployment, and apex/www binding. Its single live lab and three specified guides supersede the original two local tools and no-datastore brief. The historical gates below remain context; they are not a second active launch scope.

- [x] Inspect docs/workspace, preserve the initial brief, and record scope changes.
- [x] Lock compatible Astro/TypeScript/Workers dependencies and build the editorial site.
- [x] Publish three substantive, source-backed guides, illustrations, source dates, and genuine project attribution.
- [x] Generate HTML/Markdown, source metadata, catalog, sitemap, and discovery from one page registry.
- [x] Implement Worker-first collection and server-issued 24-hour/30-day page activity, with unknowns and explicit UTC boundaries.
- [x] Implement persistent scoped feedback, GET and POST, atomic updates, deduplication, expiry, validation, rate limits, quarantine/moderation, and retention.
- [x] Implement site/page lab views and JavaScript-free synthetic test mode; exclude all tests from production metrics/ratings.
- [x] Pass 26 unit tests and 11 actual Worker/SQLite/browser integration tests, including concurrency, expiry, retention, outages, and five viewport widths.
- [x] Pass type checks, content/link/title checks, production build, and serious/critical axe checks.
- [x] Complete three mobile Lighthouse checks (99/98/100 performance, 100 accessibility, CLS 0); conditions recorded in the research log.
- [x] Create the public `chatcode-lab/aitraffic` repository.
- [x] Push reviewed source and pass GitHub CI (run 34516252673, successful on 10 September 2026).
- [x] Deploy and verify production HTTPS apex/www, representations, noindex boundaries, and synthetic feedback.
- [x] Record deployed version, rollback steps, screenshots, and owner follow-ups.

Owner follow-ups: provide a private contact/formal operator details, decide licenses, review the AI-assisted articles independently, and set an ongoing operating budget if the experiment grows. New feedback uses the owner-selected timed challenge and automatic publication; a secret is optional for later abuse removal. Legacy pending records remain private. No third-party browser analytics, Search Console submission, recurring paid research, customer integrations, or public sample traffic is configured.

## Timed feedback challenge — 10 September 2026

The owner requested omission of the moderation queue and explicitly selected immediate publication of both ratings and comments after a short-lived challenge.

- [x] Implement response-scoped randomized exercises, two-minute first-submission deadline, three failed-attempt limit, and automatic eligibility.
- [x] Preserve legacy private records, synthetic exclusions, rate limits, plain-text rendering, retention, and optional abuse removal.
- [x] Update public HTML/Markdown instructions, privacy/methodology, and operating documentation.
- [x] Pass 27 unit tests, 13 Worker/SQLite/browser tests, type/build/content checks, and GitHub CI (run 34527415892); record evidence.
- [ ] Restore Wrangler authentication, deploy the prepared update, and run live synthetic verification. Two attempts failed during OAuth refresh with Cloudflare HTTP 403; the live site still uses the original review queue.

## Historical starter acceptance gates

The following is the original documentation-only handoff, preserved for context. The changed scope above is the current implementation checklist.

## Phase 1 — Working vertical slice

- [ ] Inspect the folder and choose currently compatible, project-local dependencies with a lockfile.
- [ ] Create the Astro/TypeScript publication and shared layout; keep the exact domain in one configuration source.
- [ ] Implement validated content records and the canonical/alternate/alias route registry.
- [ ] Research and write `/guides/markdown-for-ai-agents` with tested examples and traceable primary sources.
- [ ] Render that article from one source as HTML and Markdown with metadata, review dates, sources, and related links.
- [ ] Implement and test the thin Worker route/Accept contract against the static asset serving layer.
- [ ] Add home, useful navigation, visible brand, accessible 404, and a 1200×630 PNG/JPEG social image.

Acceptance: real readable content without JavaScript; mobile-safe layout; correct HTML/Markdown requests including quality values; no nonexistent routes accidentally negotiated; no query or content data copied from MultiPass.

## Phase 2 — Useful tools

- [ ] Build `/tools/ai-traffic-analyzer` and the parser/classifier tests specified in [tools.md](tools.md).
- [ ] Provide a clearly synthetic sample, local summaries/downloads, input limits, error/cancel states, and privacy explanation.
- [ ] Implement the Markdown auditor CLI, local fixture server, report formats, bounded networking, and working tool documentation page.
- [ ] Test mobile, keyboard, malformed data, local-only processing, output injection protection, and representation checks.

Acceptance: both tools perform their documented jobs; the CLI instructions actually run; no hosted arbitrary-URL scanner or uploaded analytics data is silently introduced.

## Phase 3 — Publishable content and discovery

- [ ] Finish the other two launch guides in [product-and-content.md](product-and-content.md); source-check claims and test examples.
- [ ] Add useful Guides/Tools collections, methodology, agent guide, and privacy information.
- [ ] Generate the static JSON catalog, `/llms.txt`, alternate links, and a small canonical HTML sitemap from the same registry.
- [ ] Add accurate structured data, tested title limits, aliases, robots policy, and a consistent editorial/source footer.
- [ ] Exclude drafts and empty collections. Do not claim a case study is reviewed if owner/source checks are still pending.

Acceptance: three substantive launch guides, two working tool surfaces, no dead primary navigation, no invented author identity or sample presented as real research, and agreement between representations/index metadata/sitemap.

## Phase 4 — Local release candidate

Implement and document these command names, or explicitly update this plan with equivalent names. They are **planned**, not present in the handoff:

```sh
npm run dev
npm run check
npm run test
npm run build
npm run preview:worker
npm run test:e2e
npm run validate:content
npm run audit:markdown -- --url https://example.com/guide --format markdown
```

`preview:worker` must exercise the actual Worker/static routing behavior; an Astro preview alone is insufficient for response negotiation and edge headers. Do not run the example remote audit as an ordinary CI dependency.

- [ ] Type/content checks, unit tests, production build, and Playwright/axe checks pass locally.
- [ ] All generated canonical titles meet the 70-character editorial budget and all local content links resolve.
- [ ] Enumerate sitemap URLs and assert each is published HTML, self-canonical, indexable, unique, and 200 in the local serving layer.
- [ ] Check HTML, `.md`, negotiated Markdown, catalog, robots, sitemap, aliases, missing paths, and HEAD responses.
- [ ] Confirm no raw user exports, secret values, inherited account bindings, or unrelated project files in output.
- [ ] Document install, test, content publishing, tool usage, deployment preparation, and rollback procedures in README.
- [ ] Record actual test commands/results and any untested deployment-specific behavior in the research log.

### Performance and UX budgets

These are initial engineering targets, not already measured results or vendor guarantees:

- Typical article first-load own assets: at most 200 KiB compressed, excluding optional third-party analytics. Keep initial own JavaScript at most 20 KiB compressed on articles; prefer none. Load tool code on tool pages only.
- Initial tool route JavaScript: aim below 100 KiB compressed before input; explain any justified exception and measure interaction responsiveness.
- Use system/local fonts; no blocking third-party font CSS. Stable dimensions for media, no major layout shifts.
- Repeat mobile lab runs; target Lighthouse performance at least 95 and CLS at most 0.1. Record tested URL, conditions, and payloads; a single score is not a release proof.
- Test widths 320, 375, 390, 430, and a desktop width. No page-level horizontal overflow, clipped controls/wordmark, unreadable table labels, or unexpected jumps when results appear.
- Primary touch controls should be at least 44 CSS pixels; visible keyboard focus and labels are required. No serious/critical automated accessibility findings, followed by a manual keyboard check.
- Article requests perform zero datastore reads and zero upstream API fetches. Content-negotiation routing still consumes Worker resources: record that cost path, do not promise unlimited free delivery.

### Required regression cases

Use fixtures rather than random production crawling: long titles/URLs, multi-line code and links, empty/draft content, source/date parity across formats, q=0 and preference-aware Accept parsing, wildcards, unsupported types, `.md` alias redirects, genuine 404s, redirect loops, bodyless HEAD, and alternating cached variants.

For the analyzer: zero rows, malformed/quoted CSV, unexpected schema, duplicate keys, unsafe counts, sensitive query stripping, formula injection, file limits, and cancellation. For the CLI: redirects to prohibited targets, timeouts, oversize bodies, non-Markdown alternates, and failures reported as failures.

## Phase 5 — Owner-approved launch (not authorized by this handoff)

Before this phase, obtain the decisions in [HANDOFF.md](../HANDOFF.md). Do not hold Phases 1–4 hostage to missing deployment credentials.

- [ ] Confirm repository owner/visibility, licensing, publisher identity, domain/hosting authority, and budget.
- [ ] Deploy only when authorized; verify apex/www behavior, real edge caching, HTTPS, directives, asset MIME types, and ordinary navigation requests.
- [ ] Test HTML → Markdown → HTML alternation on deployed cache paths; check headers and response bodies. If variant safety is uncertain, leave negotiated responses unshared until fixed.
- [ ] Configure this site's own analytics only when authorized; verify no tool input leaks. Record crawler request analytics separately from human browser analytics.
- [ ] Verify live sitemap/canonicals and then submit through authorized search-console access.
- [ ] Record deployed version, date, rollback method, smoke results, and remaining limits.

## Next data/content passes

After launch, review reports in comparable windows. Fix legitimate missing content or serving problems first; then improve pages receiving demand, and run one useful article/tool experiment at a time. Use the [experiment template](../templates/experiment.md). Do not schedule daily research or paid API calls without approval.

Keep content checking separate from publication. A later research agent can submit a small source-backed candidate packet; the implementing/editorial agent tests examples and approves public content. Automated research output is not an automatic publish instruction.
