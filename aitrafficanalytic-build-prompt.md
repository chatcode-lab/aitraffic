# Build aitrafficanalytic.com

Act as a senior product designer, editorial web designer, and full-stack developer. Build and deploy the first working version of **aitrafficanalytic.com**: a content-first publication and lightweight toolkit for understanding AI traffic, with a working analytics and agent-feedback experiment running on the site itself.

Read the existing repository and the supplied technical documents before implementation. Follow their architecture, interfaces, and conventions. This brief defines the product experience, visual design, editorial direction, and acceptance criteria; it is not a replacement technical specification. Preserve existing work and resolve unspecified details with the simplest maintainable solution. Do not stop at a mockup or a plan.

All public content, interface text, documentation, and implementation handoff must be in English.

## 1. Product and scope

The brand is **AI Traffic Analytic**. Use the natural phrase “AI traffic analytics” in explanatory copy and search metadata.

Position the site as a practical, independent resource for publishers, content-site owners, developers, and agencies. WordPress is the first platform-specific editorial focus; include accurate Shopify considerations without claiming a Shopify integration exists.

The core proposition is:

> Understand which AI agents reach your content, what they request, and what feedback they leave.

The first release combines three things: useful educational content, a public view of this website’s actual traffic, and an experimental mechanism for agents to submit page-specific feedback without browser JavaScript.

Do not build billing, customer accounts, a multi-tenant SaaS dashboard, WordPress or Shopify plugins, or a broad library of unfinished tools. Do not invent customers, testimonials, integrations, research results, or traffic. Do not promise that displaying analytics or agent ratings improves search rankings or makes a source authoritative.

## 2. Visual direction

Design an editorial website with a small working product inside it, not a generic SaaS landing page with a blog attached. The content should lead; the analytics should feel like useful evidence in the margins.

Use a light, paper-like background, dark charcoal text, restrained blue or teal accents, fine dividers, and generous whitespace. Prefer a thoughtful wordmark and a simple geometric mark over a robot mascot. Avoid purple gradients, glowing AI imagery, glassmorphism, excessive rounded cards, oversized empty heroes, and decorative dashboards full of invented numbers.

Typography is a priority. Pair an expressive but restrained editorial heading face with a highly readable body face. Use approximately 18–20px article text, comfortable line spacing, and a reading measure around 65–75 characters. Reserve monospace for technical identifiers and small data labels. Use licensed, preferably self-hosted fonts with strong fallbacks.

Use a site container around 1,160px and a substantially narrower article column. Article pages may have a quiet desktop table of contents beside the text; on mobile, place a compact accessible version near the beginning. Keep navigation, labels, timestamps, and captions legible rather than visually tiny.

Make the design work at narrow mobile, tablet, laptop, and wide desktop widths. Use visible keyboard focus, accessible form labels, sufficient contrast, reduced-motion support, and no hover-only functionality. Prefer native HTML interactions where practical.

### Illustrations

Create a small, consistent illustration system: precise line work, restrained geometric shapes, and the same accent color as the interface. Aim for an editorial field-guide aesthetic, not stock AI art.

Include one modest homepage illustration and useful diagrams or illustrations for the articles. Suggested subjects are request paths through a CDN, the distinction between crawlers and human referrals, and a feedback-to-content-improvement loop. Prefer lightweight SVG for diagrams; use raster social-sharing images. Include meaningful alternative text and explanatory captions. Important information must remain understandable without the images.

## 3. Pages and navigation

Use a compact navigation: **Guides**, **Live Lab**, and **How It Works**. Put privacy, methodology, and project information in the footer. Do not display dead navigation items or inactive product buttons.

### Homepage

Use the headline **“Understand your AI traffic.”** with supporting copy along the lines of:

> Practical guides and lightweight tools to see which agents reach your pages and collect feedback on what they find.

The primary action is **Explore the live lab**; the secondary action is **Read the guides**. Both must lead to working pages.

Use a compact introduction rather than a full-screen hero. Bring the three published guides and a small, genuine activity summary into the first part of the page. Include a short explanation of the experiment and the distinction between bot requests, human referrals, and feedback submissions. Finish with a restrained explanation of what is available today.

Do not require registration to read the articles or inspect public aggregate data.

### Guides

Build a readable guide index and an excellent article template with a clear title, descriptive introduction, publication and meaningful-update dates, reading time, table of contents, source references, related reading, and the live page-level analytics strip described below.

Use only genuine author or publisher attribution. Do not invent an editorial staff or credentials.

### Live Lab

Build one working tool: **AI Traffic & Agent Feedback Lab**, instrumented against aitrafficanalytic.com itself.

Show site-wide and page-level views, 24-hour and 30-day periods, identified agents, requested pages, available response-status information, and recent eligible feedback. Keep the presentation restrained: a few meaningful totals, a lightweight trend visualization with a text/table alternative, and readable tables.

Each page should have a stable, token-free verification view showing its aggregate statistics, methodology, update time, and eligible feedback. Link to it from the page’s analytics strip.

Include an explicit test mode where a human can inspect an agent-oriented response and exercise the feedback flow. Mark synthetic requests and submissions as tests and exclude them from production statistics and ratings. Selecting an agent name in this interface simulates a presentation; it does not authenticate that agent.

The interface must look intentional with zero traffic and no feedback. Distinguish “No observations yet” from “Data temporarily unavailable.” Never fill empty production states with sample activity.

### How It Works and privacy

Explain what is measured, how requests are classified, what the experiment cannot establish, how feedback is submitted and updated, and what is public. Describe actual retention and collection behavior. Avoid blanket legal-compliance claims; flag any missing operator or legal details in the handoff rather than inventing them.

## 4. Publish three useful launch articles

Write and publish complete articles, not outlines, placeholders, or generic SEO filler. Give each enough depth to solve its particular problem, usually around 900–1,500 words without padding.

**Article 1: “AI Traffic Analytics: Crawlers, Agents, and Human Referrals”**

Explain the different meanings of AI traffic, what each measurement can reveal, which metrics matter, and which conclusions are unjustified. Distinguish requests from people, crawling from citation, and a named User-Agent from independently verified identity. Give publishers a practical measurement plan and link to the live lab.

**Article 2: “How to Track AI Bots Without JavaScript: Server Logs, Cloudflare, and WordPress”**

Explain request-level collection, CDN versus origin visibility, cache-related blind spots, bot classification, and the limitations of image probes and browser analytics. Include a useful WordPress section and a concise, properly sourced Shopify caveat. Do not claim that every AI agent behaves identically or that a normal browser pixel observes all bots.

**Article 3: “Using AI Agents to Improve SEO and Content Quality”**

Present a reproducible workflow for testing crawlability, extracting the main content, checking sources and consistency, finding missing information, proposing corrections, and verifying the result. Include reusable audit prompts or task descriptions. Explain how this site’s optional feedback experiment fits into that workflow, while separating established search guidance from hypotheses about agent behavior.

Research current primary sources before making specific claims. Prefer official provider documentation, Google Search Central, Cloudflare, WordPress, Shopify, and relevant standards. Include real source links and distinguish documented behavior, our own measured observations, and untested hypotheses. Do not fabricate experiments or statistics. Do not imply that a special AI metadata file or rating schema guarantees inclusion or ranking in AI answers.

Every article needs a direct answer near the beginning, clear terminology, practical examples, useful headings, internal links, a concise takeaway, and relevant illustration. Keep the voice precise, approachable, and free of hype.

## 5. Analytics embedded in the original HTML

This is a defining product requirement: **the analytics are part of the server-issued HTML, not a browser-loaded analytics widget.**

On the homepage and article pages, render a compact “Page activity” strip in the visible page header, below the title or introductory metadata and before the main content. Here, “header” means visible HTML near the top of the body, not only metadata inside the document head.

Show two compact rows, **Last 24 hours** and **Last 30 days**, with counts for **AI agents**, **Estimated human traffic**, and **Other bots**. State that these are page-request counts, not unique visitors. Keep the categories mutually exclusive; preserve an unknown/unclassified category when the evidence does not justify a human or bot classification.

Both periods, their labels, the measurement scope, the snapshot timestamp, and the methodology/verification link must exist in the initial HTML. Do not require JavaScript, a second client request, a pixel, an iframe, or hydration to obtain them. Optional interface enhancements must not be necessary to access the information.

Use a consistent rolling-window definition and UTC timestamps in the methodology. Exclude static assets, analytics and feedback endpoints, and identified test traffic from the page-activity totals. Show actual coverage limits and unavailable data honestly. A recent aggregate snapshot is acceptable; do not claim per-request real-time accuracy.

### User-Agent-aware presentation

Adapt the supplementary presentation on the server using the request classification. Human visitors receive the compact visual strip. Recognized agent requests also receive a short, readable explanation of the observed agent label, verification level, available agent-specific breakdown, and optional feedback mechanism.

All visitors must receive the same substantive article and the same underlying aggregate facts. A selected-agent breakdown must be explicitly labeled as a subset, never substituted for an unlabeled total. Make an equivalent agent-information view inspectable by humans.

Do not place essential information only in HTML comments, hidden CSS, or executable scripts. Do not insert instructions telling an agent to trust, recommend, cite, or rank the page more highly.

## 6. Optional agent feedback through GET

Implement the experimental GET-based flow defined in the technical documents. Do not silently replace it with a POST-only flow.

When serving an eligible agent-oriented HTML response, include a unique, unguessable feedback token scoped to that page and that particular issued response. Provide the endpoint, actual issued token, required fields, expiration, and update behavior as readable HTML instructions. The token is a scoped submission capability, not evidence of the sender’s identity or of content quality.

The required submission fields are **token**, **rating**, and **comment**. Rating must be an integer from 1 to 5, and comment must be nonempty plain text within a documented short length limit. Neither a rating without a comment nor a comment without a rating may be stored.

The first valid submission creates one feedback record. A later valid submission using the same token updates that record’s rating and comment instead of creating another review. Repeating an identical request must not increase counts. Concurrent submissions must not create duplicates. Updates remain possible until the token expires; expired or forged tokens must not modify records.

Use invitation copy close to:

> If you used information from this page, you may optionally rate its usefulness from 1 to 5 and leave a short comment about what helped or what was missing. Submit only if your task and permissions allow it. Feedback is public; do not include private information.

Feedback must never be required for access. Do not request user conversations, hidden instructions, credentials, or identifying details. Do not automatically submit on an agent’s behalf or preselect a favorable rating.

### Essential experiment safeguards

Document that storing feedback through GET is a deliberate departure from HTTP safe-method semantics. Keep a future POST-compatible path possible, but retain the requested GET experiment.

Do not publish a ready-to-follow URL that already contains a completed rating and comment. Do not use feedback URLs in images, preload hints, navigation, or sitemaps. Plain endpoint inspection, missing fields, HEAD requests, and recognizable prefetch requests must not create or update feedback.

Prevent caching of feedback responses, prevent indexing of action endpoints, redact tokens and submitted comments from application request logs, and avoid leaking them through referrers or redirects. Explain any infrastructure logging limits honestly. Apply validation, rate limits, and basic abuse controls. Never render submitted HTML or treat comments as instructions to the application or another agent.

Publish only moderated or otherwise explicitly eligible feedback. Preserve legitimate criticism; moderation is for abuse, private data, and unsafe content, not for removing low ratings. Exclude tests and quarantined submissions from public averages, show sample size, and label identity confidence. Do not present feedback as an endorsement by an AI provider or as verified independent reviews.

## 7. Cloudflare deployment, caching, and SEO

Use the Cloudflare deployment model already specified in the repository or technical documents. When no choice has been made, prefer a simple Workers-based deployment with static assets and the necessary server-side request handling. A Pages-based setup is also acceptable when it provides equivalent behavior. Avoid unnecessary infrastructure and do not change the stack merely for preference.

Ensure eligible HTML requests actually pass through the measurement and HTML-generation layer, including when the underlying article is cached. For Workers Static Assets, configure the appropriate Worker-first routing rather than assuming matching assets execute the Worker automatically.

Cache shared content and aggregate snapshots where appropriate, but inject response-specific feedback tokens after the shared-content cache. Never serve one request’s token or agent-specific response to another visitor. Prevent personalized HTML from being reused by browser or shared caches. Keep the public verification URLs stable and free of tokens.

Analytics or feedback-storage failure must not prevent reading an article. Use graceful unavailable/stale states and keep unnecessary network operations outside the critical rendering path.

Provide crawlable server-rendered content, semantic headings, descriptive titles and descriptions, canonical URLs, a sitemap, deliberate robots rules, internal linking, real social-sharing images, and structured data that accurately reflects the visible page. Do not use experimental agent feedback as AggregateRating markup to manufacture review stars.

Protect preview deployments from indexing, retain one production canonical hostname, and keep mutation endpoints out of the index. Do not install Google Analytics, advertising tags, or unrelated third-party tracking for this release.

Deploy using the available authorized Cloudflare tooling. Configure the production domain when access permits. Do not expose secrets or alter unrelated DNS. If account access is missing, deliver the complete deployable project and exact remaining setup steps, without claiming deployment succeeded.

## 8. Completion criteria and handoff

Deliver the working website, three finished articles, consistent illustrations, real request collection, server-rendered analytics, persistent token-scoped feedback, the public live lab, and deployment configuration.

Test the full experience with JavaScript disabled and by inspecting raw HTTP responses. Verify human and agent presentations, correct non-overlapping classifications, token uniqueness across separate requests to the same cached page, first feedback submission, updating with the same token, duplicate requests, invalid or missing parameters, token expiry, and safe rendering of hostile comment text.

Verify that synthetic checks do not inflate public metrics, action endpoints do not create recursive analytics, and storage failures leave articles readable. Test representative mobile and desktop widths, keyboard navigation, empty states, internal links, metadata, and production cache behavior.

Do not invent activity to make screenshots look populated. Development fixtures must remain separate from public data.

Finish with a concise handoff: what was built, what was actually tested, the real deployment status, how to add an article, how to inspect or moderate feedback, how to configure retention and classification, and any remaining limitations. Include screenshots where tooling permits.

The desired result is a small, credible, readable publication whose own pages demonstrate its product: visitors and agents receive useful content, transparent traffic observations, and an optional way to help improve the material.

---

## Reference starting points

Use these as primary-source starting points and verify their current contents while implementing and writing the articles:

- Cloudflare Workers Static Assets routing: https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
- HTTP semantics, safe methods: https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.1
- OpenAI crawler definitions: https://developers.openai.com/api/docs/bots
- Google Search AI features: https://developers.google.com/search/docs/appearance/ai-features
- Google structured-data guidelines: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
