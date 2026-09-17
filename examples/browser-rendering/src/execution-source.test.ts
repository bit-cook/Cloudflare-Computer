import { describe, expect, it } from "vitest";

import { EXECUTION_SOURCE } from "./execution-source.js";

describe("browser execution source", () => {
  it("creates a durable research bundle in one execution", () => {
    expect(EXECUTION_SOURCE).toContain('input.action === "research"');
    expect(EXECUTION_SOURCE).toContain("await fs.writeFile(input.reportPath");
    expect(EXECUTION_SOURCE).toContain("await fs.writeFile(input.dataPath");
    expect(EXECUTION_SOURCE).toContain("await fs.writeFile(input.screenshotPath");
    expect(EXECUTION_SOURCE).toContain("report.md");
    expect(EXECUTION_SOURCE).toContain("page.json");
    expect(EXECUTION_SOURCE).toContain("screenshot.png");
  });

  it("uses the plugin lifecycle helper to close Browser Run", () => {
    expect(EXECUTION_SOURCE).toContain('import { withBrowser } from "@cloudflare/puppeteer"');
    expect(EXECUTION_SOURCE).toContain("return withBrowser(async (browser) =>");
  });
});
