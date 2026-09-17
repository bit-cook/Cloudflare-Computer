# Computer browser rendering example

This is a self-hosted demonstration of the public `@cloudflare/computer/plugins/puppeteer` integration. A generated ECMAScript module gets the normal Puppeteer `Browser` and `Page` APIs, while Cloudflare Browser Run supplies the managed Chromium session.

## Plugin usage

The reusable integration has two pieces. First, register the plugin on a Worker JavaScript backend:

```ts
import { Workspace } from "@cloudflare/computer";
import { WorkerJavaScriptBackend } from "@cloudflare/computer/backends/worker-javascript";
import { puppeteer } from "@cloudflare/computer/plugins/puppeteer";

const workspace = new Workspace({
  storage: ctx.storage,
  backends: [
    new WorkerJavaScriptBackend({
      loader: env.LOADER,
      plugins: [puppeteer({ browser: env.BROWSER })],
    }),
  ],
});
```

Then use the bound lifecycle helper inside an ordinary `workspace.runtime.exec()` module:

```js
import { withBrowser } from "@cloudflare/puppeteer";

export default (input) => withBrowser(async (browser) => {
  const page = await browser.newPage();
  await page.goto(input.url);
  return { title: await page.title() };
}, {
  guardrails: { allowedDomains: [input.hostname] },
});
```

That is the complete plugin boundary. `withBrowser()` uses the configured Browser Run binding and closes the connection-bound browser after the callback. `Browser`, `Page`, selectors, and page evaluation stay inside the Dynamic Worker; Chromium runs in Browser Run.

## What the example adds

The rest of this directory is an example application, not code required by the plugin. Its web interface accepts a user-provided HTTP(S) URL and adds:

- text, heading, metadata, and link scraping;
- a full-page screenshot written to the durable Workspace;
- response, document, viewport, and navigation timing data;
- a research workflow that writes `report.md`, `page.json`, and `screenshot.png` to one durable Workspace directory;
- artifact routes, result components, and a Workspace file tree.

Those pieces show ways to combine Browser Run with Computer's durable filesystem. Applications can instead execute a module as small as the one above.

## Run it

From the repository root:

```sh
npm install
npm run build --workspace @cloudflare/computer
npm run dev --workspace @example/computer-browser-rendering
```

Open the URL printed by Wrangler. Local development uses the Browser Run binding, so requests consume Browser Run quota and need a Cloudflare account with Browser Run access.

Local development does not require authentication. Before deploying, set a token and deploy from the example directory:

```sh
cd examples/browser-rendering
npx wrangler secret put DEMO_TOKEN
npm run deploy
```

The deployed site uses HTTP Basic authentication. Enter `demo` as the username and the secret as the password.

The Worker needs both bindings shown in `wrangler.jsonc`:

```jsonc
{
  "compatibility_flags": ["nodejs_compat", "experimental"],
  "worker_loaders": [{ "binding": "LOADER" }],
  "browser": { "binding": "BROWSER" }
}
```

## Files

- `src/index.ts` configures Computer and exposes the API and durable artifact routes.
- `src/execution-source.ts` defines the browser task that runs inside the Dynamic Worker and writes the research bundle through Computer's built-in `node:fs/promises` module.
- `src/ui.ts` contains the dependency-free demonstration interface.
- `wrangler.jsonc` declares the Worker Loader, Browser Run, and Durable Object bindings.

The example requires authentication when deployed, applies Browser Run guardrails for the requested host, and uses connection-bound browser sessions. Add workload-specific URL policy and quota handling if you adapt it for a shared service.
