# Product and content brief

## Current preview amendment — 2026-09-10

The owner selected [aitrafficanalytic-build-prompt.md](../aitrafficanalytic-build-prompt.md). The implemented navigation is Guides / Live Lab / How It Works. Three complete guides cover measurement, tracking without JavaScript (WordPress and Shopify included), and agent-assisted content auditing. The single working tool is this site's server-rendered traffic and optional feedback lab, with stable verification and synthetic test mode. The older two local tools and alternative article briefs below are deferred. One authorized DataForSEO task cost US$0.09. No customer integrations, invented activity, or universal citation metric is shipped. The older brief below is context, not a second simultaneous release checklist.

## Useful promise

Help a website owner answer: “What are AI systems requesting, is my useful content being served correctly, what human visits can I measure, and what should I improve next?”

The audience is independent publishers, small product teams, developers, and the agents assisting them. The site should itself demonstrate the practices it explains. It is not a promise to manufacture citations or sell a proprietary visibility score.

Four content areas are enough: measure traffic; serve agents reliably; diagnose missed demand; test improvements. Every guide should leave the reader with an actionable check, reproducible example, or reusable script.

## Initial release boundaries

Ship three substantial guides and two working tool surfaces. Add original research only when an experiment or reviewed dataset actually supports it. Collection pages with no useful content stay unpublished or non-indexable; never ship “coming soon” pages as search targets.

Not in the initial release: logins, payments, hosted log ingestion, live connections to customers' accounts, a multi-tenant dashboard, paid API calls, mass crawler-profile pages, translations, or a public arbitrary-URL scanner.

## Launch article briefs

These are editorial hypotheses, not validated search-volume findings. Test the examples and check primary sources before publication. Adjust the final title to fit the shared metadata budget.

| Priority / proposed canonical path | Reader intent and required original value | Companion |
| --- | --- | --- |
| P0 `/guides/measure-ai-traffic` | Explain crawler requests vs AI-referred visits vs citations; show which questions logs, Cloudflare reports, and browser analytics can actually answer. Include a worked synthetic export, explicit missing fields, and a measurement checklist. | CSV analyzer |
| P0 `/guides/markdown-for-ai-agents` | Implement explicit Markdown URLs and Accept negotiation without breaking browser caching. Show tested request/response examples, quality values, canonicals, and a cache-alternation test. Be explicit that Markdown is an interface, not a Google ranking requirement. | Markdown auditor |
| P0 `/guides/ai-crawler-missed-demand` | Turn meaningful unserved URLs into a reviewed repair queue. Distinguish aliases, gone content, denied requests, errors, assets, and hostile probes; never redirect every miss. Use synthetic examples and a before/after response test. | CSV analyzer + redirect checklist |

## Subsequent article backlog

Choose one bounded item per pass based on reader questions, first-party data, and evidence feasibility. Do not publish the entire table automatically.

| Proposed topic | Evidence or experiment needed before publication |
| --- | --- |
| Verify an AI crawler instead of trusting its name | Current operator documentation; separate user-agent matching from supported IP/network verification; include failure cases |
| `robots.txt`, `llms.txt`, sitemaps, and Markdown: different jobs | Primary protocol/vendor references and tested discovery examples; no claim of universal `llms.txt` adoption |
| AI referrals in privacy-friendly analytics | Current platform documentation plus an authorized test of referral/event reporting; note missing or stripped referrers |
| How much do bot requests cost? | Reproducible request-amplification model with user-supplied prices; dated vendor pricing only when checked |
| What an agent can actually read on your mobile-first site | JS-disabled/SSR and viewport tests showing equivalent content, links, and accessibility |
| A practical AI traffic report for a small publisher | A small, documented metric schema and sample report with comparable time windows |
| When to repair a 404, redirect it, or leave it alone | A reviewed set of legitimate aliases and intentional 404s with status/canonical tests |
| MultiPass Rank: lessons from actual agent requests | Owner-approved historical aggregates and methods, not copied private exports; no causal SEO-growth claim without a controlled comparison |
| Does Markdown reduce transfer size or parsing work? | Reproducible HTML/Markdown sample, declared byte/token method and source revision; smaller payload is not proof of better ranking |

Start with natural reader phrases such as “measure AI traffic,” “Cloudflare AI crawler analytics,” “AI referral traffic,” and “Markdown for AI agents.” These are candidate intents, not proven keywords. Use DataForSEO only for a concrete unresolved choice, with an approved cost cap and a recorded market/query list.

## Editorial structure

Lead with the answer, scope, and limitation. Then explain the distinction or workflow, give a runnable example or useful table, link the relevant tool, and state sources and review dates. Avoid padding to a word count. Choose depth according to the problem, not an alleged search algorithm preference.

Use [the article template](../templates/article.md). Drafts may contain open questions; published content must not present them as settled facts. Make test environment, sample period, and uncertainty visible wherever they change the conclusion.

## Design direction

Use MultiPass's eventual pragmatic polish as a reference, not its passport UI: calm typography, warm/light background, strong text contrast, restrained accent, thin separators, readable tables, and obvious links. A technical publication should feel more like a well-edited field guide than an analytics sales dashboard.

- Homepage: short useful description, two tool entry points, three guide links, then genuine recent research if available. No empty metric widgets, fake testimonials, or “unlock growth” copy.
- Navigation: Guides, Tools, Research when useful, and For agents. Keep the wordmark visible and allow wrapping on narrow screens.
- Articles: comfortable line length, concise table of contents for long pieces, dates and sources in context, copyable code, nearby Markdown link.
- Tool pages: explain input, output, privacy, limitations, and a labeled sample before requiring an upload or command.
- Mobile: test 320–430 CSS-pixel widths. No page-level overflow or hidden primary controls. Code may scroll within its own labeled block; tables must keep labels connected to values.
- Footer: a few grouped links, methodology/privacy, and factual project credit only if approved. No inherited partner logo or large keyword-link dump.
- Social images: real 1200×630 PNG/JPEG assets with explicit dimensions and a safe center region; editable SVG may remain the source. Do not ship an SVG as the only OG image.

## Success criteria

At launch: the guides answer their questions, tools run locally, agents can retrieve the same sourced content as humans, navigation works without JavaScript, mobile is usable, and response cost is bounded.

After launch: track useful guide/tool usage, legitimate misses fixed, response/representation correctness, content freshness, and AI-referred visits where observable. Report bot requests as bot requests. A citation study must disclose how answers were sampled; there is no complete citation counter implied by access logs.
