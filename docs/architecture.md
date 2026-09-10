# Architecture and publication contract

## Current preview amendment — 2026-09-10

The owner-selected [build prompt](../aitrafficanalytic-build-prompt.md) supersedes the original no-datastore scope below. The implementation retains prerendered Astro HTML/Markdown and one route registry, adding a Worker-first server layer and one SQLite Durable Object for this site's aggregate traffic, scoped feedback with timed challenges, automatic publication, optional abuse removal, and retention. No browser JavaScript is necessary. Dynamic HTML is private/no-store; hashed production assets are immutable. Page context has an 800ms deadline and degrades to unavailable statistics while retaining content. Snapshots use complete UTC minutes and can be reused for 30 seconds. This has Worker/storage costs; the old zero-read assumption no longer applies. See [README](../README.md) and [methodology](../src/content/methodology.md) for the implemented contract. The starting specification follows for historical context.

## Default design

Use Astro with TypeScript and prerendered Markdown content. Add client code only to tools or interactions that need it. Keep articles, the catalog, and discovery files build-generated; no KV, database, or network fetch on ordinary content requests.

Deployable target: Cloudflare Workers with Static Assets and a small front-door Worker for canonical routing and Markdown negotiation. Keep hashed assets on the static path. Verify the current supported Astro/Cloudflare configuration before implementation rather than copying MultiPass's older package versions.

Cloudflare can serve matching static assets before Worker code. Configure selective Worker-first routing for the negotiable document routes; merely adding Astro middleware to a prerendered site is not proof that it executes. Test both ordinary browser navigation and agent requests. [Cloudflare's Worker routing documentation](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/) describes this distinction.

Suggested implementation structure, not files that already exist:

```text
src/content/                 reviewed guides and research
src/content.config.ts        validated content collections
src/lib/content.ts           public content model
src/lib/routes.ts            canonical/alternate/alias registry
src/lib/markdown.ts          native representation rendering
src/lib/accept.ts            tested media negotiation
src/lib/analytics/           pure parser and classification functions
src/pages/                   HTML and generated public artifacts
src/components/              shared layout and small tool islands
worker/                      minimal routing/header layer if needed
scripts/                     local CLI tools and content validators
tests/fixtures/              synthetic, explicitly labeled samples
```

## One source, several representations

The content source and route registry generate the body, title, summary, sources, dates, alternate links, sitemap membership, and machine catalog. Do not maintain separately rewritten HTML, Markdown, and JSON versions of the same claim. Handle custom components with deterministic Markdown equivalents; never expose raw framework imports to readers.

Each content record needs a stable `id`, `kind`, canonical `slug`, `title`, `seoTitle`, `description`, `summary`, `status` (`draft`, `review`, `published`), `authorId`, `publishedAt`, `updatedAt`, `reviewedAt`, `sources`, and related content IDs. Draft dates/author may be null; published records need real values. Each source stores `id`, title, publisher, URL, access date, and the claims it supports. Distinguish observed, tested, inferred, and unresolved claims in the text and research record.

Choose the accurate publisher identity before public launch. Never invent a person's expertise. Content can be AI-assisted, but review dates and names must reflect actual review. Keep original content/code licensing separate from third-party source rights.

## URL and index contract

Use HTTPS apex host and no trailing slash except `/`. Normalize recognized HTML aliases in one permanent hop where possible. The registry determines eligibility; do not negotiate arbitrary paths because they happen to resemble article URLs.

| Surface | Example | Index / sitemap |
| --- | --- | --- |
| Home and useful collections | `/`, `/guides`, `/tools`, `/research` | Yes when substantive |
| Reviewed article | `/guides/measure-ai-traffic` | Yes / yes |
| Working tool documentation | `/tools/ai-traffic-analyzer` | Yes / yes |
| Methodology and agent guide | `/methodology`, `/ai` | Yes / yes when useful |
| Markdown representation | `/guides/measure-ai-traffic.md`; root `/index.md` | HTML canonical / no |
| Negotiated Markdown | HTML path with appropriate `Accept` | Same resource; no new sitemap URL |
| Machine catalog | `/api/v1/catalog.json` | Not a search landing page / no |
| Agent discovery | `/llms.txt` | Supplementary discovery / no |
| Local tool state | Tool query or fragment | Not a separate landing page / no |
| Draft or empty collection | Preview-only or excluded build output | No / no |
| Unknown path or probe | `/.env`, `/not-a-real-article` | Genuine 404 / no |

Tools must never put uploaded content, log paths, or private URLs in shareable state. Tracking-only query parameters do not create distinct content. If a later tool has non-sensitive meaningful query scenarios, decide its index/noindex policy explicitly before shipping them.

## Markdown negotiation contract

Offer explicit `.md` alternatives with visible links, HTML alternate metadata, and HTTP `Link` headers. These remain the fallback for clients unable to set headers.

For eligible GET/HEAD document requests, support `text/markdown` when explicitly acceptable and at least as preferred as HTML. Honor quality values and media-range specificity. If both HTML and explicitly requested Markdown tie positively, choose Markdown. Missing `Accept` or wildcard-only requests receive HTML; `text/markdown;q=0` never receives Markdown. An unsupported-only request can receive a genuine 406; document this policy and test it rather than returning an incorrect representation.

Serve native Markdown at the requested canonical URL via internal asset routing, not a permanent redirect based on request headers. Preserve valid public query semantics; never negotiate binary assets, APIs, or nonexistent routes. HEAD has the corresponding GET headers without a body. If conditional requests are implemented, ETags belong to each representation separately.

Markdown uses `Content-Type: text/markdown; charset=utf-8`, an absolute HTTP `Link` canonical to HTML, and optionally an explicitly approximate token-count header. Include a stable source URL, summary, headings, references, and actual content/review dates; omit navigation clutter and analytics. Explicit `.md` aliases may use `X-Robots-Tag: noindex` to avoid duplicate search entries; do not carry that directive onto negotiated responses at an indexable HTML URL.

`Vary: Accept` must be present on eligible canonical document responses, including the default HTML response, while preserving existing dimensions. Do not assume a `Vary` header by itself proves the configured CDN separates variants. Use representation-specific internal cache keys/assets, and test alternating browser/agent fetches through the actual serving layer. If edge variant isolation is not verified, disable shared caching for negotiated canonical responses until it is; explicit HTML/Markdown assets can retain their safe distinct caches.

This project maintains its own Markdown instead of depending on provider conversion. Cloudflare's [Markdown for Agents documentation](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/) is an interoperability reference, not a required paid feature or a substitute for cache tests.

## Public machine interface

Generate `/api/v1/catalog.json` with `schemaVersion`, `siteUrl`, meaningful `updatedAt`, and published items containing stable ID, kind, title, summary, canonical URL, Markdown URL, review date, and source references. This is a small static discovery catalog, not a speculative API platform.

`/ai` explains discovery, exact paths, Accept behavior, citations, date interpretation, tool input/output, and limitations. `/llms.txt` points to that guide and a small curated set of entry points. Do not imply every crawler recognizes it. Readers must not need an agent protocol to access ordinary content.

## Caching and operations

- Content must not fan out into datastore/API reads per request. Build the publication and catalog atomically.
- Initial public content policy: short browser caching/revalidation and a bounded edge TTL (for example 1 hour), only with verified representation separation. Make freshness independent of request time.
- Hashed assets can use long immutable caching. Use short bounded negative caching for genuine 404s; no client-specific or sensitive responses in public caches.
- Treat freshness as a content-review concept, not “last deploy.” Set sitemap `lastmod` only for meaningful content changes.
- Keep preview environments out of search with response-level directives; do not rely on robots blocking to hide a preview.
- Add a content-change CI build with tests. Do not add daily rebuilds or unbounded URL-checking jobs merely because MultiPass refreshed daily data.
- Browser analytics, if later authorized, uses this site's own configuration. Do not send uploaded data or private tool inputs. Do not claim its JavaScript pageviews count all bot requests.
- Log ingestion, hosted scanning, IP verification services, and paid integrations require a later privacy/security/cost design. The MVP has none.
