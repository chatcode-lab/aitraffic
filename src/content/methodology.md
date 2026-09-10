The public lab measures eligible document requests reaching this site's Cloudflare Worker. It does not measure unique visitors, sessions, all internet bots, or citations. Classifier version: **2026-09-10.1**. Public data is production data; synthetic requests are excluded.

## Scope and rolling windows

Eligible requests are successful or failed GET deliveries for registry-listed editorial HTML and Markdown pages on the production apex. Explicit Markdown and negotiated Markdown map to the same canonical page and are separate format dimensions within the request denominator. Home, guides, the guide index, and explanatory pages are included.

Static assets, unknown URLs, redirects, HEAD requests, recognizable prefetch/prerender requests, `/live-lab` views, verification views, API endpoints, feedback actions, preview hosts, and marked tests are excluded. Requests blocked before the Worker, platform failures, and failed collection are not observable. Status counts describe document delivery at this layer, not all Cloudflare response codes.

Counts use UTC minute buckets. Each snapshot ends at the start of its current minute, exclusively. “Last 24 hours” means the preceding 1,440 complete minutes; “Last 30 days” means the preceding 43,200 complete minutes. The current incomplete minute is omitted. This keeps both periods comparable and can delay a new request's appearance by about a minute, plus up to 30 seconds of snapshot reuse. The displayed snapshot timestamp identifies that exclusive end; the collection-start timestamp explains partial launch coverage.

Trend tables partition the selected window into 24 equal intervals for 24 hours, or 30 equal intervals for 30 days, ending at the same snapshot boundary. Page and agent breakdowns use that same boundary and denominator. An agent filter is always a labeled subset of the underlying totals.

## Four mutually exclusive categories

1. **AI agents:** exactly one recognized agent token in the User-Agent: OAI-SearchBot, GPTBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, or Perplexity-User. This includes named crawlers and some user-triggered fetchers; it does not establish their actual task.
2. **Other bots:** a known automation marker such as crawler, spider, bot, a command-line client, or headless-browser marker, after AI matching.
3. **Estimated human traffic:** a browser-looking User-Agent with navigation and document Fetch Metadata headers, after bot matching. Automated browsers can meet this heuristic.
4. **Unknown:** insufficient evidence or conflicting recognized AI labels.

The label list was checked against [OpenAI](https://developers.openai.com/api/docs/bots), [Anthropic](https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), and [Perplexity](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) documentation on 10 September 2026. Other automated clients may fall into other bots or unknown.

The four counts sum to all eligible document requests. They are request counts, not unique agents or people. AI identity confidence is “reported User-Agent; not independently verified.” This release does not verify source IPs against provider ranges. Changing the list or precedence requires a new version and an annotation in the research log.

## Feedback, eligibility, and averages

Each token is randomly generated with 256 bits of entropy; only its SHA-256 hash is stored. It is scoped to one issued HTML response, a canonical page, a reported or simulated agent label, and test status. Tokens expire after 30 minutes. A submission requires an integer rating from 1 to 5 and 1–500 Unicode characters of nonempty plain text.

One token maps to one record, enforced by the storage key and an atomic transaction. Identical repetitions do not add records. A changed rating or comment replaces the prior value and awaits moderation again. Expired or forged tokens cannot update records. HEAD, prefetches, missing or repeated parameters, and endpoint inspection never mutate feedback.

Public feedback lists only approved, unexpired-by-retention production records, ordered by latest update. Public averages, when present, use all eligible records in the selected scope whose latest update falls inside the selected window. The sample size is the number of those token records, not independent reviewers. Tests, pending and quarantined records are excluded. No provider endorsement or representative quality score is implied.

## Limits, retention, and failure behavior

Document aggregates are kept for 31 days. Production feedback is retained for up to 90 days after its latest update; test feedback for one day. Expired token hashes are removed. Hourly on-demand housekeeping and a storage alarm apply retention even when traffic stops; deletion can lag the threshold by up to an hour under normal operation. Public queries enforce the window immediately. Platform backup retention is separate.

Abuse controls limit feedback invitations to 20 per client per hour and 2,000 globally per hour, and submissions to 60 per client per hour and 3,000 globally per hour. A daily salted, one-way client network fingerprint is kept only in hourly rate-limit buckets, for at most two days. It is not used to identify readers or count unique visitors. Shared networks share these limits. Token records allow at most 10 changed submissions. Tests also consume limits.

The Worker waits at most 800 milliseconds for page context before showing an unavailable activity state. It may reuse a snapshot for up to 30 seconds; timestamps remain explicit. Storage failure does not remove article content. The experiment uses one SQLite Durable Object; it adds bounded storage and Worker work and is not a free, unlimited analytics service. No upstream research API runs during page delivery.
