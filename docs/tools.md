# Tool specifications

## Current scope amendment — 2026-09-10

The newer owner-selected [build prompt](../aitrafficanalytic-build-prompt.md) replaces the two tools below with the working **AI Traffic & Agent Feedback Lab**. Its contract is in [worker/index.ts](../worker/index.ts), [worker/lab.ts](../worker/lab.ts), and [public methodology](../src/content/methodology.md). The [README](../README.md) documents timed challenges, automatic feedback publication, and optional removal; integration tests exercise the actual Worker and SQLite implementation. The earlier analyzer and auditor are deferred backlog, not unfinished public navigation items.

Build two bounded tools. Share pure parsing/validation functions between UI, CLI, and tests where useful. No external account or paid API is required to use either initial tool.

## Tool 1: AI traffic export analyzer

Canonical documentation/UI: `/tools/ai-traffic-analyzer`; Markdown: `/tools/ai-traffic-analyzer.md`.

### Job

Let a publisher inspect a Cloudflare path export, understand what was requested, separate content from assets and likely probes, and prepare a reviewed follow-up list. Everything runs locally in the browser, with a deterministic local CLI using the same core if feasible in the first pass.

### Input contract

The two actual MultiPass Cloudflare files inspected for this handoff both have this header:

```csv
Path,Host,Requests
```

They contain neither timestamps, individual user agents, verification signals, referrers, nor HTTP status codes. The user must label the import as popular paths, unmet demand, or unknown, and optionally enter its date range. Do not infer “all rows are 404s,” “Perplexity,” or “citations” from this schema or from a filename.

Support that schema first, including quoted fields, UTF-8 BOM, CRLF, commas/quotes inside paths, and blank lines. Validate required columns and finite nonnegative safe-integer counts. A generalized column mapper is later work; unsupported schemas should fail clearly rather than guess.

Synthetic fixture, not observed site data:

```csv
Path,Host,Requests
/guides/example,example.com,120
/guides/example.md,example.com,35
/old-example,example.com,8
/.env,example.com,4
/assets/cover.png,example.com,20
```

### Behavior and output

- Parse a single file by default. Set explicit initial limits, such as 10 MiB and 100,000 rows; show progress/cancel and avoid locking the mobile main thread. Exceeding a limit is a visible error, not a truncated success report.
- Count input rows, accepted/rejected rows, and request totals separately. Show reasons for rejection and never silently drop malformed data.
- Require host/path consistency; reject invalid URLs. Preserve meaningful path case/escaping. Strip query/fragment from displayed groups by default, disclose aggregation, and avoid decoding encoded slashes into a different path.
- Group by normalized host + path within the file; sum request counts and report duplicate keys. Do not claim these are unique visitors. Do not merge multiple potentially overlapping exports automatically.
- Classify into content candidate, Markdown, asset, likely probe, and unknown using documented deterministic rules. “Likely probe” is a triage label, not proof of malicious intent.
- Show request share using an explicit denominator; if assets/probes are excluded, label the new denominator. Do not add `.md` requests to HTML and also retain them as disjoint traffic totals.
- For an unmet-demand import, propose review categories, not automatic redirects. Let the user annotate an exact canonical target; export proposals for human review rather than executing them.
- Offer a sortable, filterable list with region-free/general route grouping, useful summaries, and local Markdown/JSON/CSV exports. Include schema version, user-supplied period, import kind, totals, exclusions, and limitations.
- Do not fetch imported URLs. Treat paths as untrusted text, not HTML. Protect downloadable CSV from spreadsheet-formula injection; escape output appropriately for each format.
- Explain that downloads can contain private paths. Provide a redacted aggregate export option and never put raw input in share URLs or browser analytics events.

### Tests

Fixtures cover valid/BOM/quoted CSV, missing fields, unsafe counts, duplicate paths, overlapping-export warning, encoded paths, query stripping, unexpected hosts, formula/HTML injection, exact totals, and missing-date/bot/status metadata. Test empty input, cancel, keyboard interaction, and a representative large file on a phone viewport. Network interception must show no upload or imported-URL fetch.

## Tool 2: Markdown negotiation auditor

Canonical documentation: `/tools/markdown-auditor`; Markdown: `/tools/markdown-auditor.md`.

### Job

A local TypeScript/Node CLI checks a public document's HTML/Markdown responses, alternate discovery, redirects, and visible caching contract. The site provides working installation/run instructions and a readable sample report. A browser cannot reliably inspect arbitrary origins without CORS, so do not present a browser-only cross-origin fetch as a working universal scanner.

Suggested local command interface to implement, not a command available yet:

```sh
npm run audit:markdown -- --url https://example.com/guide --format json
```

Support Markdown output too. Discover an explicit Markdown alternate through response/HTML links; accept `--markdown-url` for a user-declared fallback. Do not assume every site uses `.md`. Limit active tests to the provided document and its relevant alternates, not a recursive crawl.

### Request matrix

| Request | This project's expected result |
| --- | --- |
| GET without Accept, or wildcard-only Accept | HTML default |
| GET `Accept: text/html` | HTML |
| GET `Accept: text/markdown` | Native Markdown |
| GET `Accept: text/markdown;q=0, text/html;q=1` | HTML |
| GET `Accept: text/markdown;q=0.3, text/html;q=0.9` | HTML |
| GET `Accept: text/markdown;q=1, text/html;q=0.5` | Markdown |
| GET explicit Markdown and HTML with equal positive quality | Markdown, by this project's documented policy |
| HEAD with corresponding headers | Same metadata, no response body |
| GET explicit Markdown alternate | Markdown with HTML canonical |
| Alternating HTML → Markdown → HTML → Markdown | Correct representation each time; inspect cache headers when available |
| Alias, missing page, or unsupported-only Accept | Correct redirect/404/406 under the declared site contract, not a successful unrelated page |

For other sites, distinguish standards/representation defects, unsupported optional features, and differences from our chosen policy. “No Markdown alternate” is not proof of poor SEO. Do not emit a made-up universal “AI readiness” score.

Inspect status, content type, relevant Link metadata, robots directives, Vary, ETag if present, size, timing, redirect chain, and a small deterministic body signature. Compare substantive title/source content when feasible; differing templates or ads alone are not proof of different answers. Flag suspicious HTML masquerading as Markdown without declaring every embedded HTML tag invalid.

Repeated requests from one location can reveal variant contamination but cannot prove correctness at every edge/cache. Mark conclusions accordingly. A timestamp or `Age` is a cache observation, not evidence of content review.

### Network and output safety

- Allow only HTTP(S); reject credentials in URLs. Do not print sensitive query parameters or response cookies/auth headers. No persisted raw response bodies by default.
- Use bounded redirects (for example 5), per-request timeout (10 seconds), body limit (2 MiB), and a total run/request budget. Do not retry rate limits endlessly; honor failures and provider guidance.
- Default to public destinations; allow loopback/private addresses only through an explicit local-test option. Revalidate each redirect target and resolved addresses. No internal-network discovery.
- Return stable machine-readable findings with test name, result (`pass`, `warning`, `fail`, `not-tested`), observation, and remediation. Define exit codes: 0 for no failures, 1 for audit failures, 2 for invalid input/runtime inability to complete.
- Test against a local fixture server using the explicit local-test option. Ordinary CI must not depend on third-party sites staying available.
- A hosted version would need a separate SSRF/DNS-rebinding, rate-limit, privacy, egress-cost, and abuse review. It is expressly deferred.

## Later tools, only when demand supports them

Candidate additions: a tested crawler identity registry, referrer classification rules, a robots/discovery explainer, a request-cost calculator with user-entered prices, and a reproducible report generator. Each needs a data/source/refresh contract before becoming an indexable tool.

Prefer extending a useful core over adding many thin tool pages. Keep parser/classifier versions in exports so future changes are explainable.
