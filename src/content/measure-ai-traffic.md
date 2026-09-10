AI traffic analytics starts with separating **requests made by software**, **visits referred by an AI product**, and **citations observed in an answer**. They answer different questions. A useful report keeps them separate, states what it can observe, and gives a publisher a concrete next step.

This guide proposes a measurement practice for a small publication. Our [live lab](/live-lab) demonstrates request measurement and optional feedback on this website. It does not count unique visitors, identify every AI system, or monitor citations across the web.

## Four signals, four different questions

An AI crawler can download a page without a person ever reading it. A person can arrive from an AI answer without the originating crawler visiting your server that day. An answer can cite a page without anyone clicking. Feedback adds another signal: someone holding a response token chose to submit a rating and comment.

| Signal | Useful question | What it cannot establish |
| --- | --- | --- |
| Agent page request | Can this reported agent reach this resource? | A unique person, use in an answer, or a citation |
| AI-referred visit | Did an observable visit carry an AI-platform referrer? | All AI influence or all visits from that platform |
| Observed citation | Was this page referenced in the sampled answer? | A complete citation count or a resulting visit |
| Optional feedback | What did a token holder say was useful or missing? | Independent identity, representative satisfaction, or provider endorsement |

Treat these as separate report sections. Adding them together produces a total with no coherent unit. Even the first two may overlap: a browser-looking request with a referrer is still a request, while a session report groups interactions under a different method.

## A crawler name is a claim about identity

The `User-Agent` header is useful evidence, but the sender chooses its value. Recognizing `GPTBot` tells you what the request calls itself. Independently verifying the operator requires additional evidence, such as matching a source address against the provider's current published ranges. Keep the matching method and the date of that evidence.

[OpenAI documents separate agents](https://developers.openai.com/api/docs/bots) for search discovery, potential training use, and some user-triggered actions. Those documented roles help interpret a label; they do not reveal exactly what happened to your particular page after retrieval. A user-triggered fetch is not itself a human browser visit.

Store identity and purpose in separate fields. A useful record might say “reported OAI-SearchBot; network identity not checked; documented role: search.” Do not collapse that into “verified ChatGPT reader.” If signals conflict, keep an unknown category and investigate the rule before forcing a classification.

Our lab matches a small, versioned list of agent tokens and clearly labels them as unverified. It does not run IP-range verification. Browser navigation headers support an estimated-human category, but automation can imitate those headers too.

## Decide where your observation begins

Before choosing a chart, draw the delivery path. Does a request reach a CDN first? Can the CDN answer without the origin? Does a browser script execute only after HTML is delivered? Each collection point sees a different population.

[Cloudflare's AI traffic reports](https://developers.cloudflare.com/ai-crawl-control/features/analyze-ai-traffic/) expose crawler and path dimensions and distinguish referral reporting. Confirm the fields and features available in your account; an exported table containing only paths and counts cannot retrospectively supply individual identities or response statuses.

Keep the original scope next to an import. Record its timezone, date range, host filter, content filter, report name, and whether rows were truncated. Two exports of the same period may overlap. Summing them is not a way to increase coverage.

For this publication, observation begins when an eligible document request reaches our Worker. Requests blocked earlier are invisible to it. Assets and the lab's own endpoints are excluded. This is a bounded view of delivery, not a replacement for every infrastructure report.

## Build a small measurement plan

Start with one question: “Are the pages I want to share being delivered successfully to the agents requesting them?” Choose a short list of canonical pages. Keep meaningful response formats separate in the raw aggregate dimensions, then label any combined total as document requests.

For each reporting window, capture the following:

1. **Scope:** production hostname, eligible paths, methods, and collection layer.
2. **Time:** UTC start and exclusive end, aggregation precision, and collection start.
3. **Delivery:** request count by canonical page, format, reported label, and observed status.
4. **Confidence:** classification version and which verification checks actually ran.
5. **Exclusions:** assets, test checks, endpoint requests, and known collection gaps.

Review failures before celebrating volume. A frequently requested guide that returns an error is a delivery problem. A working guide with no observable requests may need distribution, time, or clearer internal linking. Neither observation is proof that rewriting the title will change AI recommendations.

Keep your first report small enough to inspect manually. Compare equal windows with the same collection rules. If you change the classifier or start observing CDN hits, annotate the break; the next increase may reflect instrumentation rather than new interest.

## Work through a synthetic example

Suppose a **synthetic** one-day export covers 00:00–24:00 UTC on an example date and includes 100 eligible document GET requests. The classification method assigns 20 to named AI agents, 50 to estimated humans, 10 to other automation, and 20 to unknown. These four groups are mutually exclusive and sum to the 100-request denominator.

The reported AI request share is 20 out of 100, or 20%, under that classifier. It is not the share of people using AI, nor a citation rate. If five of the estimated-human requests carry a recognized AI referrer, they are a subset of those 50 requests; do not add five to the site total.

If the export contains no status field, write “response success not observable.” If it covers only origin requests, write “CDN-served hits excluded.” Every number remains useful only within those boundaries. This example is invented for explanation and never enters our production lab.

## Measure referrals and citations independently

For referrals, use the analytics product's actual definitions. A referrer can be absent or shortened, and an AI-assisted reader may copy a URL or return later. Call the metric “observed AI-referred visits” when that is what you measured, not “all AI traffic.” Our first lab release deliberately does not retain referrer URLs or publish referral counts.

For citations, define a separate research sample: exact question set, answer provider, model when available, date, session conditions, and a reproducible way to inspect references. Record a citation only when it is observable in that answer. Report both the count and the sample denominator; repeated prompts are not independent people.

[Google's guidance for AI search features](https://developers.google.com/search/docs/appearance/ai-features) points publishers to ordinary search fundamentals. A public bot counter or feedback rating is not an additional eligibility requirement. We have no controlled evidence that displaying either improves ranking or citation frequency.

## Turn a signal into a useful action

Use a weekly review to identify one bounded repair: restore a broken link, clarify an ambiguous answer, correct a stale source, or fix a format that is being served incorrectly. Keep the original observation and retest the same condition after the change.

An optional comment can help locate a problem, but verify it against the page and its sources. It may be wrong, malicious, duplicated across tokens, or unrepresentative. In our lab, a token represents an issued response and supports one updatable submission; it does not represent an independently verified reviewer.

The practical takeaway: **measure access, referrals, citations, and feedback on their own terms, then use each to guide a testable improvement**. Next, read [how to collect bot requests without JavaScript](/guides/track-ai-bots), or inspect this site's [measurement definitions](/methodology) alongside its actual observations.
