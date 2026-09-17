import { describe, expect, it } from "vitest";

import { UI_HTML } from "./ui.js";

describe("browser rendering UI", () => {
  it("starts with the Cloudflare Agents documentation", () => {
    expect(UI_HTML).toContain('value="https://developers.cloudflare.com/agents/"');
  });

  it("separates the concise plugin API from the example application", () => {
    expect(UI_HTML).toContain("Plugin setup");
    expect(UI_HTML).toContain("new Workspace({");
    expect(UI_HTML).toContain("storage: ctx.storage");
    expect(UI_HTML).toContain("new WorkerJavaScriptBackend({");
    expect(UI_HTML).toContain("plugins: [puppeteer({ browser: env.BROWSER })]");
    expect(UI_HTML).toContain('import { withBrowser } from "@cloudflare/puppeteer"');
    expect(UI_HTML).toContain("Full example task source");
    expect(UI_HTML).toContain("The scraper, research workflow, and artifact UI are example code");
  });

  it("uses Phosphor icons and action-specific result components", () => {
    expect(UI_HTML).toContain("@phosphor-icons/web@2.1.2");
    expect(UI_HTML).toContain('id="metrics"');
    expect(UI_HTML).toContain('id="scrape-result"');
    expect(UI_HTML).toContain('id="screenshot-result"');
    expect(UI_HTML).toContain('data-action="research"');
    expect(UI_HTML).toContain('id="research-result"');
    expect(UI_HTML).toContain('id="workspace-tree"');
  });

  it("renders an in-flight response with its submitted action", () => {
    expect(UI_HTML).toContain("const submittedAction = action;");
    expect(UI_HTML).toContain("JSON.stringify({ action: submittedAction, url: target })");
    expect(UI_HTML).toContain("renderValue(payload.value, submittedAction)");
  });

  it("ships syntactically valid client JavaScript", () => {
    const script = UI_HTML.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
    expect(script).toBeDefined();
    expect(() => new Function(script ?? "")).not.toThrow();
  });
});
