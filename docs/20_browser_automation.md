# Browser automation in Worker JavaScript

`@cloudflare/computer/plugins/puppeteer` lets code running in `WorkerJavaScriptBackend` use Cloudflare Browser Run. Puppeteer and its `Browser` and `Page` objects stay inside the isolated Dynamic Worker; Chromium runs in Browser Run.

## Configure the plugin

The host Worker needs Worker Loader and Browser Run bindings:

```jsonc
{
  "compatibility_flags": ["nodejs_compat", "experimental"],
  "worker_loaders": [{ "binding": "LOADER" }],
  "browser": { "binding": "BROWSER" }
}
```

Pass both bindings to the backend:

```ts
import { DurableObject } from "cloudflare:workers";
import { type DurableObjectStorageLike, Workspace } from "@cloudflare/computer";
import { WorkerJavaScriptBackend } from "@cloudflare/computer/backends/worker-javascript";
import { puppeteer } from "@cloudflare/computer/plugins/puppeteer";

export class BrowserWorkspace extends DurableObject<Env> {
  readonly workspace: Workspace;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.workspace = new Workspace({
      storage: ctx.storage as unknown as DurableObjectStorageLike,
      backends: [
        new WorkerJavaScriptBackend({
          loader: env.LOADER,
          plugins: [puppeteer({ browser: env.BROWSER })],
        }),
      ],
    });
  }
}
```

The plugin bundles the Worker-compatible Puppeteer client, so the application does not need a separate runtime dependency on `@cloudflare/puppeteer`.

## Run a browser task

Code passed to `workspace.runtime.exec()` imports the configured module normally:

```ts
using execution = await workspace.runtime.exec(
  `
    import { withBrowser } from "@cloudflare/puppeteer";

    export default (input) => withBrowser(async (browser) => {
      const page = await browser.newPage();
      await page.goto(input.url, { waitUntil: "domcontentloaded" });
      return { title: await page.title(), finalUrl: page.url() };
    }, {
      guardrails: { allowedDomains: [input.hostname] },
    });
  `,
  {
    input: {
      url: "https://developers.cloudflare.com/agents/",
      hostname: "developers.cloudflare.com",
    },
  },
);

const result = await execution.result();
```

`withBrowser(callback, options?)` launches a connection-bound browser, runs the callback, and closes the browser afterward. Use `launch(options?)` when code needs to manage the browser itself:

```js
import { launch } from "@cloudflare/puppeteer";

const browser = await launch();
try {
  // Use Puppeteer normally.
} finally {
  await browser.close();
}
```

The module also exports `browserBinding`, the unchanged upstream default export, and upstream runtime exports. `browserBinding` is useful for APIs such as `puppeteer.sessions()` that take the Browser Run binding directly.

Do not return Puppeteer objects from an execution. Return structured data or write larger output to the Workspace.

## Save browser output

Worker JavaScript provides Workspace-backed `node:fs` and `node:fs/promises`. A screenshot can be written without returning its bytes through the structured result:

```js
import { withBrowser } from "@cloudflare/puppeteer";
import fs from "node:fs/promises";

export default (input) => withBrowser(async (browser) => {
  const page = await browser.newPage();
  await page.goto(input.url);
  await fs.writeFile(input.outputPath, await page.screenshot({ type: "png" }));
  return { title: await page.title(), outputPath: input.outputPath };
});
```

The Dynamic Worker is disposable, but files written to the Workspace remain available to later executions.

## Authority and limits

Installing the plugin grants every execution on that backend access to its public browser API. Put browser-enabled work on a separate named backend when only some callers should have that authority. Plugins installed on one backend are mutually trusted and share the plugin binding authority domain; caller modules and ordinary configured modules cannot import the internal binding bridge.

Browser navigation happens through Browser Run, not through the backend's `globalOutbound` policy. Validate user input and set Browser Run guardrails when the application accepts URLs from other users.

Computer execution timeouts and Puppeteer navigation timeouts are separate. Set both for the workload. `withBrowser()` closes the browser after normal completion or an error. Cancellation and timeout dispose the Dynamic Worker and its client connection, so application cleanup code may not finish in those paths.

Screenshots are encoded when they cross the Workspace filesystem bridge. For larger screenshots, raise the capability limits deliberately:

```ts
new WorkerJavaScriptBackend({
  loader: env.LOADER,
  plugins: [puppeteer({ browser: env.BROWSER })],
  maxCapabilityBytes: 8 * 1024 * 1024,
  maxCapabilityRequestBytes: 16 * 1024 * 1024,
});
```

See [`examples/browser-rendering`](../examples/browser-rendering) for a complete self-hosted example that scrapes pages and writes Markdown, JSON, and PNG output to a durable Workspace.
