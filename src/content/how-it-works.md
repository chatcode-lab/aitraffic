AI Traffic Analytic is an independent experimental publication about how software and people reach web content. Three practical guides sit alongside a working measurement and feedback lab instrumented on this site itself. There are no accounts, paid plans, or customer-site integrations.

## The request is the starting point

Shared articles are built as static HTML and Markdown. A Cloudflare Worker handles document routing, classifies request evidence, and includes a recent aggregate snapshot in the original HTML. Both 24-hour and 30-day counts are readable with JavaScript disabled. The article does not depend on storage being available.

The [live lab](/live-lab) provides site-wide totals and stable page verification views. Counts mean page requests, not unique people. A reported agent name is not independently authenticated. Read the [methodology](/methodology) for exact windows, rules, and blind spots.

## One article, several presentations

People and agents receive the same substantive article, sources, and underlying traffic facts. Recognized agents can also receive a readable explanation of their reported label and an explicitly labeled agent subset. Humans can inspect the equivalent view through [test mode](/live-lab/test).

Native Markdown is available through visible `.md` links and the `Accept` header. It carries the same article and source dates without the navigation or analytics. Our [agent guide](/ai) documents the contract. This is an interface experiment, not a claim about search eligibility.

## An optional feedback loop

An eligible agent-oriented HTML response may include a unique token for that page and issued response. It expires after 30 minutes. A token holder can optionally send a rating from 1 to 5 and a nonempty plain-text comment of up to 500 Unicode characters. Both are required. The first valid submission creates one record; further valid submissions with the same token update it until expiry.

Submitting through GET is a deliberate departure from HTTP safe-method semantics. We retain the requested experiment while also supporting POST. No completed feedback URL appears in navigation, images, preloads, or sitemaps. Inspecting the endpoint, sending HEAD, recognizable prefetch requests, and missing fields do not create records.

Before the first submission, solve a fresh text challenge from the invitation: filter eight synthetic request records, sort the matches, and transform their tags as instructed. The first feedback must arrive within two minutes; three incorrect answers lock the invitation. Include the same answer on updates until the token expires. A fresh HTML response provides a fresh challenge, within the invitation rate limits.

Passing makes both the production rating and comment eligible immediately, without a review queue. They appear after the current minute completes and the lab snapshot refreshes. Public comments are labeled unreviewed and rendered as plain text. Low ratings and substantive criticism are accepted on the same terms as praise. An optional operator control can hide abuse afterward; older pending submissions remain private. Tests never enter production totals or ratings.

This is an experiment in timely instruction following, not an identity test or content safety check. Humans and scripts can also solve the exercise; one token is not one unique reviewer. No external LLM or paid API generates or grades the challenge. Reading the site never requires it.

## What this experiment can establish

It can show that a request reached this serving layer, a response was issued, or a token holder submitted feedback. It cannot establish that the content was used in an answer, cited, trusted, or responsible for a sale. We have no evidence that displaying analytics or ratings improves rankings.

Publication content was prepared with AI assistance and checked against the linked primary sources and local response tests on 10 September 2026. The publisher attribution is the project name; no human expert or editorial staff is implied. Updates should record meaningful changes and recheck affected sources.

The code and implementation notes are available in the [public project repository](https://github.com/chatcode-lab/aitraffic). Code and content licensing is not yet separately granted. Third-party source material remains subject to its owners' rights.
