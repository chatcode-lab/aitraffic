# AI Traffic Analytic

A practical publication and a working experiment in AI traffic analytics at **https://aitrafficanalytic.com**. Public source: [chatcode-lab/aitraffic](https://github.com/chatcode-lab/aitraffic).

The first preview includes three source-backed guides, a public traffic/feedback lab, stable page verification views, native Markdown, and optional GET/POST feedback. Article HTML includes both activity windows before any browser code runs. The site ships **no executable client JavaScript**, tracking cookies, advertising tags, or third-party analytics.

The owner-selected [build prompt](aitrafficanalytic-build-prompt.md) supersedes the older starter's two local tools and no-datastore rule. [The research log](docs/research-log.md) records that decision and the repository/deployment authorization. [HANDOFF.md](HANDOFF.md) contains operational state and next tasks.

## Run and verify

Use Node 24 (minimum 22.19 for the full development toolchain).

```sh
npm ci
npm run dev
```

Astro development previews layout/content; statistics say unavailable there. To exercise actual Worker routing, server-rendered activity, SQLite, and feedback:

```sh
npm run build
npm run preview:worker
```

Open `http://localhost:8787`. Local storage is isolated under ignored `.wrangler/`. `/live-lab/test` provides synthetic feedback. Local unmarked requests can be collected for debugging; they are not production data.

```sh
npm run check
npm test
npm run build
npm run validate:content
npx playwright install chromium
npm run test:e2e
npm run performance
```

The integration suite runs a separate **local-only** fixture Worker on port 8788. It tests real routing/SQLite, concurrency, expiry, exclusions, moderation, hostile text, retention, outages, JavaScript-disabled forms, keyboard use, and widths 320/375/390/430/1280. Never deploy `wrangler.test.jsonc` or its fixture Worker. No paid API or external site is a test dependency.

A minimal Linux host may lack Chromium libraries. This session extracted local Ubuntu library copies into ignored `artifacts/browser-deps/root`; Playwright detects this optional directory. No system installation was made. Normal workstations and GitHub Ubuntu runners use their installed libraries. `node scripts/capture-preview.mjs` captures four local views with JavaScript disabled and without feedback tokens. Performance checks require the Worker preview on port 8787.

## Add content

[src/data/site.json](src/data/site.json) is the page/route registry, hostname, metadata, dates, related IDs, and reviewed aliases. [src/content](src/content) contains Markdown bodies; [src/data/sources.json](src/data/sources.json) holds source provenance. Astro renders HTML, and [scripts/build-discovery.mjs](scripts/build-discovery.mjs) generates Markdown, catalog, sitemap, and `llms.txt` from the same records.

Add a Markdown body and a registry record with a stable ID/path and genuine dates. Add primary-source records with supported claims. Only set `status: published` after checking sources/examples; drafts and review records are excluded. Keep SEO titles within 70 characters and run the checks above. Source dates reflect actual review, not deployment time.

Explicit `.md` URLs are noindex alternatives. Canonical Accept negotiation honors quality/specificity; missing/wildcard-only preferences return HTML, positive explicit Markdown ties favor Markdown, and unsupported-only requests return 406. Unknown routes return genuine 404s. HTML/Markdown substantive content and source dates agree.

## Measurement and storage

[worker/index.ts](worker/index.ts) handles Worker-first routing, headers, representations, activity insertion, and endpoints. [worker/lab.ts](worker/lab.ts) owns one SQLite Durable Object. [The public methodology](src/content/methodology.md) is the measurement contract.

Both rolling windows end at the snapshot's UTC minute boundary, excluding the incomplete minute. Counts are eligible canonical document GET requests, including HTML/Markdown, grouped into mutually exclusive AI / human estimate / other bot / unknown. Assets, unknown paths, redirects, lab/API endpoints, HEAD, recognized prefetches, previews, and marked tests are excluded. Requests blocked before the Worker and failed collection are outside coverage. User-Agent identity is reported, not independently verified. There is no referrer or citation counter.

`X-AITraffic-Test: 1`, `?test=1`, and test mode exclude diagnostics. These markers and User-Agent strings are spoofable; this is not an authenticated census. Production observations are never seeded with samples.

Configuration in [wrangler.jsonc](wrangler.jsonc): `RETENTION_DAYS=31`, `FEEDBACK_RETENTION_DAYS=90`, `TOKEN_TTL_SECONDS=1800`. Test feedback lasts one day. Expired token hashes are removed. Storage alarms and hourly housekeeping enforce retention. Changing retention or classification requires corresponding public methodology/privacy updates and tests.

No raw IPs, full User-Agents, query strings, referrer URLs, or application access logs are stored. A daily salted network fingerprint supports short-lived hourly rate limits. Dynamic documents are private/no-store; hashed production CSS is immutable. Response-specific tokens are issued after shared static content retrieval, never shared between visitors.

Snapshots may be reused for 30 seconds; page context has an 800ms deadline. Storage failure leaves articles readable. Eligible document delivery records one bucket increment asynchronously; home/guide HTML also requests page context. Snapshot misses run aggregate SQL queries. This adds Worker/storage costs. The single-object preview is not load-tested as a high-volume analytics platform, and no paid API runs during delivery.

## Feedback and moderation

A random 256-bit token scopes one record to a page, issued response, reported label, expiry, and test flag. Only its SHA-256 hash is stored. GET parameters and POST JSON accept exactly `token`, `rating` (integer 1–5), and `comment` (nonempty plain text, 1–500 Unicode characters). Both rating and comment are required. Inspection, HEAD, prefetch, missing/invalid fields, expiry, and forgery cannot mutate records. Repeats are idempotent; changed submissions are limited to 10 per token.

**Production feedback starts pending.** Updates return it to pending. Only eligible production records appear publicly, and tests can never be approved. Moderation is for abuse/private data/unsafe content, not removal of criticism or low ratings. Comments are untrusted text, never application instructions. No AggregateRating markup is used.

To enable private moderation, choose a strong unique secret and use Wrangler's secure prompt:

```sh
npx wrangler secret put LAB_ADMIN_KEY
```

Enter the same value locally without putting it in shell history:

```sh
read -rs -p 'Moderation key: ' LAB_ADMIN_KEY
export LAB_ADMIN_KEY
npm run moderate -- list
npm run moderate -- moderate RECORD_ID eligible
unset LAB_ADMIN_KEY
```

`quarantined` and `pending` are also valid states. The queue is private: do not commit, publish, or paste its output into public issues. The admin endpoint is disabled until the owner configures the secret. Collecting pending feedback does not require it.

GET mutation deliberately departs from safe HTTP semantics. No completed action URLs occur in navigation, images, preloads, or sitemaps. Action responses are no-store/noindex/no-referrer and project observability is disabled. Client history and provider security/service logs remain outside this code's full control. Never submit sensitive content. POST is also supported.

## Deployment and rollback

The owner authorized deployment and apex/www binding for this preview. Use the intended Cloudflare account through Wrangler; no account IDs or credentials are committed. The production config binds only this project's hostnames.

```sh
npm run check
npm test
npm run build
npm run validate:content
npm run test:e2e
npx wrangler deploy
npm run smoke:live
```

`assets.run_worker_first: true` is essential. The HTTPS apex is canonical. `www` redirects ordinary navigation; action endpoints reject noncanonical hosts without redirecting query parameters. Preview hosts are noindex and excluded from production collection. CI validates push/PR changes; it does not auto-deploy, run paid research, or schedule jobs. The Durable Object alarm is only for retention housekeeping.

The live smoke script marks diagnostic traffic as tests, checks representations/discovery, and exercises only synthetic feedback. It does not publish reviews. The [research log](docs/research-log.md) records actual deployment status/version.

```sh
npx wrangler deployments list
npx wrangler rollback VERSION_ID
```

Rollback restores Worker code/assets, **not Durable Object data**. Keep schemas backward compatible and preserve migrations. Never deploy the test fixture configuration.

## Research and remaining owner choices

One authorized DataForSEO task cost **US$0.09** for 18 English/US phrases. [Sanitized results](docs/keyword-research-2026-09-10.json) retain keyword estimates, scope, and cost only. The returned monthly series covers August 2025–July 2026. These are Google Ads estimates, not an exact census or additive demand across variants; null does not establish zero demand. No recurring research is scheduled.

Content is AI-assisted and attributed to the project; no human expert is invented. A dedicated private contact, formal operator/legal details, final reuse licenses, moderation-key setup, and independent editorial review remain owner tasks. Public visibility does not grant a new license to original code/content or third-party sources. The older CSV analyzer and universal Markdown-auditor CLI are deferred in favor of the requested live lab.
