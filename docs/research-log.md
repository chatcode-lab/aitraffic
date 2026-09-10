# Research and decision log

Append dated entries. Preserve historical observations; do not rewrite old figures to look current. Durable rules belong in [the playbook](seo-agent-playbook.md), not only in this log.

## 2026-09-10 — Project handoff established

Request: create a separate project folder for `aitrafficanalytic.com`, based on MultiPass Rank's SEO/agent-use work, that another agent can take over without the conversation.

Inspected source: MultiPass Rank at commit `1de5a24cc4577e7db0b732cecab2d9a4e5708bad`, particularly its complete SEO/AEO playbook, research context, native Markdown route/Accept implementation, and the column headers of the two 7 September Cloudflare exports. Both export headers were `Path,Host,Requests`; they do not supply bot identity, referral, timestamp, or status fields.

Created a self-contained documentation starter, not an application or deployment. The source project's files and untracked user reports were left unchanged. No credentials, raw reports, screenshots, source datasets, or production account configuration were transferred. No paid research was performed.

### Decisions and rationale

- Static-first articles and build-generated metadata: avoid importing the source project's operational dataset and its past read-amplification problem.
- Two initial tools: a private/local CSV analyzer and a local Markdown auditor. These turn the observed problems into useful artifacts without introducing hosted ingestion or arbitrary network scanning.
- HTML/Markdown parity and a positive route registry: reuse the successful representation concept, but improve the source implementation's broad route heuristic and quality-preference behavior.
- Three reviewed launch guides: enough to establish a coherent publication without prematurely creating a large content inventory.
- No inherited partnerships, code/content license decisions, analytics identity, or repository/deployment authority.

### Current external references checked

- [Google AI optimization guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): use conventional search quality principles; do not sell Markdown or `llms.txt` as a Google ranking requirement.
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): small inventory can begin with one sitemap; only useful canonical indexable URLs belong in it.
- [Cloudflare Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/): interoperability reference for native Markdown behavior and representation headers.
- [Cloudflare AI traffic analysis](https://developers.cloudflare.com/ai-crawl-control/features/analyze-ai-traffic/): account/report fields and access must be checked; path exports alone are not referral/citation evidence.
- [Cloudflare Worker/static routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/): the front-door routing must actually run on negotiable document paths.

These external pages change. Recheck relevant documentation and test actual behavior at implementation time. Do not treat a date on this handoff as a current verification of every future crawler or analytics feature.

### Unresolved, non-blocking for local development

Final display branding; repository owner/visibility; licensing; publisher/reviewer identity; domain/hosting setup; project-specific analytics; permission to publish a MultiPass case study; any paid keyword-research budget. The implementation prompt records these as launch decisions, not reasons to stop scaffolding and testing.

### Next bounded task

Implement Phase 1 of [the delivery plan](delivery-plan.md), including a real sourced article and tested native Markdown. Continue through the local release candidate when that succeeds.

## Entry format for future passes

Record date, question, source/version, data window, filters/row limits, units/denominator, method/commands, result, uncertainty, decision, changed routes/files, executed checks, and next action. For paid calls include the approved cap and actual cost, never credentials or raw private inputs.

## 2026-09-10 — Owner-authorized live preview implementation

The current owner request explicitly authorizes a public `chatcode-lab/aitraffic` repository, reasonable DataForSEO use with this folder's credentials, Cloudflare deployment, and binding `aitrafficanalytic.com`. The owner specifically identifies `aitrafficanalytic-build-prompt.md` as the build brief. Its live lab, server-issued analytics and persistent GET feedback supersede the older documentation-only handoff's no-datastore scope, two local tools and different launch articles. The CSV analyzer and universal Markdown auditor are deferred in favor of the requested single working lab. There is no authorization for delegation, recurring research, or unrelated site changes.

Implementation decision: Astro prerenders shared editorial HTML and Markdown. A Worker runs first, injects aggregate snapshots and optional response-specific feedback capabilities, and uses one SQLite Durable Object for bounded minute aggregates, short-lived token hashes, feedback and rate limits. This adds storage work to document delivery; no zero-datastore or per-request-real-time claims will be retained. Reading must survive storage failure. No JavaScript analytics, cookies, raw access logs, raw IPs, full User-Agents, referrer URLs, or page query strings are stored by the application.

Feedback is experimental and unverified. New production submissions and changed comments/ratings await moderation; low ratings are not a rejection criterion. Test traffic is excluded. Public code and content receive no new reuse license without an owner choice; public visibility is not an invented license grant. Attribution uses the project name and identifies AI-assisted preparation, with no invented human reviewer.

Research budget: one Google Ads search-volume task for a focused English/US candidate list, self-imposed ceiling of US$1 under the owner's reasonable-use authorization; no scheduled calls. Record actual returned cost and limitations below.


## 2026-09-10 — Research and local release verification

One DataForSEO Google Ads search-volume live task queried 18 English/US phrases, without search partners. Actual cost: **US$0.09**, within the self-imposed US$1 ceiling under the owner's reasonable-use authorization. The returned 12-month series spans **August 2025–July 2026**, not the partial current month. The sanitized JSON records all queries, monthly series, nulls, method, market, date, and cost; no account identifiers or credentials were retained. Reported average monthly estimates include “ai traffic analytics” 110, “ai traffic” 210, and “ai agents seo” 90. These are Google Ads estimates for each returned keyword/group, not additive exact-match censuses; null is not proof of no demand. Decision: keep the requested broad measurement guide first, then collection and content-audit workflows. Narrow platform phrases inform sections, not thin standalone pages. No further paid calls or recurring jobs.

Primary documentation checked: Cloudflare Worker-first static routing, SQLite Durable Objects, custom domains, and AI traffic reports; OpenAI, Anthropic, and Perplexity crawler definitions; WordPress theme hooks; Shopify bot filtering and robots customization; Google AI-feature, helpful-content and structured-data guidance; RFC 9110. The initial AI token list is bounded to the eight OpenAI/Anthropic/Perplexity labels in the classifier. Only reported identities are claimed; no network verification or referral/citation counter is implemented.

Local implementation: three guides of approximately 1,250–1,300 whitespace-delimited words each; 11 published page records (10 indexable canonical pages plus noindex test mode); matching Markdown; a 1200×630 PNG social image; no executable article/client JavaScript. Public source attribution uses the project and identifies AI assistance. The copied historical specification remains readable with explicit current-scope amendments.

Executed checks: `npm run check` (zero errors/warnings/hints), `npm test` (26 passed), `npm run build`, `npm run validate:content` (11 records, 3 substantive guides, 179 internal links and source/date/SEO inventory checks), and `npm run test:e2e` (**11 passed**, 36.6 seconds). Integration tests use an isolated local Worker and actual SQLite, never production fixtures. They cover quality-aware negotiation, real 404/406/HEAD, sitemap/canonicals, response-token uniqueness, GET/POST validation, expiry/forgery/prefetch/HEAD safety, concurrent idempotent records, low-rating eligibility, hostile text escaping, update re-moderation, test exclusion, rolling-window reconciliation, rate limits, retention, storage failure, JavaScript-disabled form submission, keyboard focus, and widths 320/375/390/430/1280. Axe found no serious/critical violations on home, guide, lab, and test routes. Native smooth scrolling was removed after it caused unstable focus/scroll positioning during the no-JavaScript form check; the resulting flow passed normally without forced clicks.

The minimal Linux host lacked Chromium shared libraries. Browser dependencies were downloaded and extracted only into ignored project artifacts; no sudo/system installation or service change occurred. Screenshot capture uses JavaScript disabled and the test-exclusion header, and deliberately omits pages containing feedback capabilities. Artifacts are local and ignored by Git.


## 2026-09-10 — Production deployment and performance

Cloudflare Worker `aitraffic` deployed successfully with Static Assets and SQLite Durable Object binding, on the authorized account. Both `aitrafficanalytic.com` and `www.aitrafficanalytic.com` were bound as custom domains; no existing Worker bindings for those names were present. Version: **ab7c3c0b-52b5-4c99-8681-5c2c7a710093**. Upload: 51.85 KiB Worker bundle / 15.37 KiB gzip; reported startup 11ms. These are this deployment's CLI measurements, not an operating-cost guarantee. No account IDs or credentials were copied into configuration. `www` and ordinary HTTP navigation redirect to the HTTPS apex. Feedback rejects noncanonical action hosts without redirecting submitted values.

`npm run smoke:live` passed all 11 live checks from this machine: HTML/Markdown alternation and quality values, bodyless indexable production HEAD, ten canonical pages, sitemap/catalog, 404/406, explicit Markdown/robots/PNG MIME, real persistent snapshots in homepage HTML, response-token uniqueness, no token in subsequent ordinary HTML, synthetic feedback creation/deduplication/update, action privacy/HEAD/prefetch protections, and apex/www HTTPS routing. All diagnostic document GETs used the test-exclusion header. Two scoped test invitations and one updatable test record were created; none can enter public production ratings. Preview host HEAD returned noindex; production apex HEAD returned 200 without noindex. This is a real deployment, not an Astro preview.

A Python urllib client was blocked at the upstream Cloudflare layer with code 1010, while Node fetch, named-agent diagnostics, and Chromium requests succeeded. No zone security setting was weakened. This is an observed coverage limitation consistent with the public methodology: earlier platform blocks do not reach the application counter. Client identity is not verified by those successful fetches.

Performance: Lighthouse 13.4.1, Chromium 153, simulated mobile/default throttling, local Worker at `/guides/measure-ai-traffic`, 10 September 2026, three completed runs at approximately 18:42–18:43 UTC. Performance **99, 98, 100**; accessibility **100** in each run; CLS **0** in each run; LCP approximately **870, 922, 822ms**; total transferred byte weight approximately **13.4KB** per measured page load, including HTML and own CSS, with no executable client JavaScript or third-party assets. The own CSS is 4,624 bytes gzip. These are lab conditions, not production field measurements. Earlier aborted runs were not counted as successful measurements.

The aborted performance runs uncovered a local-preview routing issue after adding custom domains: Wrangler's default host forwarding used the production hostname, so the local HTTP request received the canonical HTTPS redirect. The preview command now explicitly uses `--host localhost`; ordinary local responses and all three repeated measurements succeeded. This changes local tooling only, not production routing.

Production screenshots were captured with Chromium and JavaScript disabled at 1440px desktop and 390px mobile, using the test header: home desktop/mobile, guide mobile, and lab desktop. No response tokens were captured; screenshots and raw measurement reports remain ignored local artifacts. Secrets were scanned against staged source and built assets without printing their values; `.env`, `.dev.vars`, `.wrangler`, dependencies, and artifacts are excluded from Git.

Operations: use `wrangler deployments list`, then `wrangler rollback VERSION_ID` for code/assets; SQLite data is not rolled back. Production moderation remains deliberately disabled until the owner sets `LAB_ADMIN_KEY`; incoming real feedback stays pending. Dedicated private contact/operator details, licensing, independent editorial review, operating budget, Search Console, referral/citation measurement, and load testing remain explicitly unclaimed owner follow-ups. No recurring research, auto-deployment, global/system installation, unrelated DNS change, or third-party tracking was enabled.
