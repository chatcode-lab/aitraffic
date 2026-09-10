To track AI bots without JavaScript, collect requests at the server or CDN layer that actually serves the document. Classify the evidence you receive, keep the response status, and explain which traffic that layer misses. A browser analytics tag cannot stand in for request-level collection.

For WordPress, begin with your hosting and CDN reports before installing another plugin. For Shopify, use the platform's documented analytics capabilities and avoid assuming you have the same origin-log access as a self-hosted installation. This guide gives you a practical collection and verification sequence.

## Follow the request before choosing a counter

A typical page request travels from a client to a CDN and, on a cache miss, to an origin. The origin may run WordPress or another application. The response travels back through the CDN. A browser can then fetch images, execute scripts, and send analytics events.

Those are different observation points. An origin log records the requests that reach the origin. A CDN hit can deliver the entire article without running origin code. A JavaScript event depends on the client executing it and the event being delivered. Disagreement between the three does not automatically mean a tool is broken.

Create a simple coverage note before installing anything: “These are production document requests reaching this collection layer; static assets and health checks are excluded.” Add any sampling, retention, and export limits. Keep a separate total for failed requests when the layer can observe them.

## What to collect, and what to leave out

For a useful aggregate report, you need a bounded page identifier, a time bucket, a classification, a response format, a response status, and a count. A request's full URL may contain a search term or a private identifier. Map known public pages to stable IDs and discard queries before storing analytics.

You can inspect a `User-Agent` to classify the request without retaining the full header. Keep recognized labels and the classifier version. Do not infer a human simply because a familiar bot name is absent. Put insufficient evidence in unknown, and explain that estimated-human traffic may still include automation.

Avoid treating request logging as a reason to collect everything indefinitely. Decide the retention period, who can access records, and what becomes public. A public aggregate needs fewer details than a temporary security investigation; those are separate purposes and access decisions.

## Cloudflare: verify that the Worker actually runs

[Workers Static Assets routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/) can serve a matching asset before your Worker script. When collection and server-side presentation must run on document requests, explicitly configure worker-first handling for those paths, or for every request with an early static-asset exit.

This site's configuration uses `run_worker_first: true`. Its Worker recognizes published documents, fetches shared static content, obtains a bounded aggregate snapshot, and inserts the visible activity strip before returning HTML. Static assets and measurement endpoints do not become page views.

That architecture is a project choice, not a promise that all traffic reaches the Worker. An upstream block or platform failure can happen earlier. The [Cloudflare AI traffic reports](https://developers.cloudflare.com/ai-crawl-control/features/analyze-ai-traffic/) provide another perspective, with their own filters and feature availability. Compare definitions before reconciling totals.

When testing a similar implementation, request the same document repeatedly through the actual deployment. Check both ordinary browser navigation and named-agent headers. A development server that bypasses the production asset router cannot prove that cache hits are measured.

## A WordPress checklist that starts at hosting

Ask which request reports your host exposes, how long they retain data, and whether they include edge hits or only origin access. On a staging environment, fetch a public post once with an empty cache and again with a warm cache. Locate both requests in the relevant reports. A missing origin entry on the second fetch may be an expected cache hit.

WordPress [theme hooks](https://developer.wordpress.org/themes/advanced-topics/plugin-api-hooks/) let themes and plugins integrate behavior, including code in the page head or footer. Adding a script through one of those hooks still leaves execution to the client. It does not turn that script into a server log.

Likewise, a plugin that counts requests while PHP runs may miss requests answered by a page cache before PHP executes. Establish where the cache sits, and whether your measurement code runs before or after it. Test that behavior on your actual hosting configuration rather than assuming every caching plugin works alike.

For an initial report, use a short canonical-post allowlist. Exclude administration, login, previews, feeds if out of scope, and assets. Strip queries before aggregation. Preserve a separate category for unknown clients. If you enable an edge collector, compare one controlled test across edge and origin reports to understand duplication.

Do not install a plugin solely because it displays a list of AI brand names. Look for clear collection scope, exportable definitions, retention controls, and evidence about classification. This project supplies an example website and source code; it does not ship a WordPress plugin.

## Why a pixel is an incomplete bot sensor

An image probe counts an image request when the client actually fetches that image. A text-focused fetcher may request only HTML. An image can also be cached separately from the document, and a client may suppress remote media. Its absence does not establish that the page was unread.

Conversely, an image fetch is not proof that a person saw it. A preview service or automated browser can fetch media. Treat a probe as a measurement of that particular resource under specified conditions, not a universal census of AI agents.

Browser analytics remains useful for the interactions it observes. The mistake is relabeling those events as all bot requests. Keep it as a separate stream, and avoid adding overlapping browser events and server requests into one visitor count.

## Shopify needs a platform-specific approach

[Shopify documents a Human or bot session dimension](https://help.shopify.com/en/manual/intro-to-shopify/bots/bot-filtering) in analytics and reports. Its classification works on observed session events. Use its terminology when interpreting the result; a bot session is not the same unit as a raw request for a product page.

Start with the report dimensions available to your store and confirm which events and storefront surfaces they cover. Do not assume that inserting a theme script gives you all platform-side requests or the underlying edge logs. This publication has no Shopify integration, and its Worker deployment is not a drop-in Shopify instrumentation recipe.

[Editing Shopify's robots.txt.liquid](https://help.shopify.com/en/manual/promoting-marketing/seo/editing-robots-txt) changes crawler directives. It does not add analytics. Review access changes separately from measurement changes so that an apparent traffic shift is not actually the result of a new blocking rule.

## Verify with a controlled, labeled request

On this site, the following read-only test requests HTML and explicitly excludes the request from production metrics:

```sh
curl --silent --show-error \
  -H 'Accept: text/html' \
  -H 'X-AITraffic-Test: 1' \
  https://aitrafficanalytic.com/guides/track-ai-bots
```

Inspect the response body for the article, both activity windows, the UTC snapshot, and the verification link. These should be present without JavaScript. Use [test mode](/live-lab/test) to inspect the agent presentation and try a synthetic feedback submission. Selecting a name simulates a presentation; it does not authenticate an operator.

Then inspect the stable [live lab](/live-lab) view. The synthetic request must not increase production totals. Repeat the check with a warm content cache. Finally, test a collection failure locally: the article should stay readable while the statistics clearly say unavailable.

The takeaway: **measure at a delivery layer you understand, verify cache coverage, and keep request counts distinct from browser sessions**. Use the [AI traffic measurement guide](/guides/measure-ai-traffic) to turn those observations into a report with a defensible denominator.
