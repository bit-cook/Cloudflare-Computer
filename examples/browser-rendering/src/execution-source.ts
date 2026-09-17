export const EXECUTION_SOURCE = String.raw`import { withBrowser } from "@cloudflare/puppeteer";
import fs from "node:fs/promises";

// withBrowser() is the complete execution-side plugin integration. The
// extraction and report code below belongs to this example application.

function buildMarkdown(page) {
  const lines = [
    "# " + page.title,
    "",
    page.description || page.summary || "No summary was available.",
    "",
    "## Page snapshot",
    "",
    "- URL: " + page.finalUrl,
    "- HTTP status: " + (page.status ?? "unknown"),
    "- Language: " + (page.language || "unknown"),
    "- Elements: " + page.document.elements,
    "- Images: " + page.document.images,
    "- Links: " + page.document.links,
    "",
    "## Sections",
    "",
  ];

  for (const section of page.sections) {
    lines.push("- " + section.level.toUpperCase() + ": " + section.text);
  }

  lines.push("", "## Code samples", "");
  if (page.codeSamples.length === 0) lines.push("No code samples found.", "");
  for (const [index, sample] of page.codeSamples.entries()) {
    lines.push("### Sample " + (index + 1), "");
    for (const line of sample.text.split("\n")) lines.push("    " + line);
    lines.push("");
  }

  lines.push("## Internal links", "");
  for (const link of page.internalLinks) {
    lines.push("- [" + (link.text || link.href) + "](" + link.href + ")");
  }
  return lines.join("\n") + "\n";
}

export default function run(input) {
  return withBrowser(async (browser) => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    page.setDefaultNavigationTimeout(30_000);
    const response = await page.goto(input.url, { waitUntil: "domcontentloaded" });
    const responseInfo = {
      requestedUrl: input.url,
      finalUrl: page.url(),
      status: response?.status() ?? null,
      title: await page.title(),
    };

    if (input.action === "research") {
      const extracted = await page.evaluate(() => {
        const clean = (value) => value?.replace(/\s+/g, " ").trim() ?? "";
        const sections = [...document.querySelectorAll("h1, h2, h3, h4")]
          .map((heading) => ({
            level: heading.tagName.toLowerCase(),
            text: clean(heading.textContent),
          }))
          .filter((heading) => heading.text)
          .slice(0, 80);
        const codeSamples = [...document.querySelectorAll("pre")]
          .map((sample) => ({ text: sample.textContent?.trim().slice(0, 4_000) ?? "" }))
          .filter((sample) => sample.text)
          .slice(0, 12);
        const seenLinks = new Set();
        const internalLinks = [...document.querySelectorAll("a[href]")]
          .map((anchor) => ({
            text: clean(anchor.textContent),
            href: anchor.href,
          }))
          .filter((link) => {
            try {
              const target = new URL(link.href);
              if (target.hostname !== location.hostname || seenLinks.has(target.href)) return false;
              seenLinks.add(target.href);
              return true;
            } catch {
              return false;
            }
          })
          .slice(0, 80);
        const paragraphs = [...document.querySelectorAll("main p, article p")]
          .map((paragraph) => clean(paragraph.textContent))
          .filter((text) => text.length > 60)
          .slice(0, 6);
        return {
          description: document.querySelector('meta[name="description"]')?.content ?? null,
          language: document.documentElement.lang || null,
          summary: paragraphs.join(" ").slice(0, 2_400),
          sections,
          codeSamples,
          internalLinks,
          document: {
            elements: document.querySelectorAll("*").length,
            images: document.images.length,
            links: document.links.length,
            scripts: document.scripts.length,
          },
        };
      });
      const pageData = { ...responseInfo, ...extracted };
      const markdown = buildMarkdown(pageData);
      const json = JSON.stringify(pageData, null, 2) + "\n";
      const png = await page.screenshot({ type: "png", fullPage: true });

      await fs.mkdir(input.outputDirectory, { recursive: true });
      await fs.writeFile(input.reportPath, markdown);
      await fs.writeFile(input.dataPath, json);
      await fs.writeFile(input.screenshotPath, png);

      return {
        ...pageData,
        reportPath: input.reportPath,
        dataPath: input.dataPath,
        screenshotPath: input.screenshotPath,
        files: [
          {
            name: "report.md",
            path: input.reportPath,
            mediaType: "text/markdown",
            bytes: new TextEncoder().encode(markdown).byteLength,
          },
          {
            name: "page.json",
            path: input.dataPath,
            mediaType: "application/json",
            bytes: new TextEncoder().encode(json).byteLength,
          },
          {
            name: "screenshot.png",
            path: input.screenshotPath,
            mediaType: "image/png",
            bytes: png.byteLength,
          },
        ],
      };
    }

    if (input.action === "screenshot") {
      const png = await page.screenshot({ type: "png", fullPage: true });
      await fs.writeFile(input.screenshotPath, png);
      const dimensions = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      }));
      return { ...responseInfo, dimensions, screenshotPath: input.screenshotPath };
    }

    if (input.action === "page-info") {
      const pageInfo = await page.evaluate(() => {
        const navigation = performance.getEntriesByType("navigation")[0];
        return {
          description: document.querySelector('meta[name="description"]')?.content ?? null,
          language: document.documentElement.lang || null,
          viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
          document: {
            elements: document.querySelectorAll("*").length,
            images: document.images.length,
            links: document.links.length,
            scripts: document.scripts.length,
          },
          timing: navigation ? {
            responseEnd: Math.round(navigation.responseEnd),
            domContentLoaded: Math.round(navigation.domContentLoadedEventEnd),
            load: Math.round(navigation.loadEventEnd),
          } : null,
        };
      });
      return { ...responseInfo, ...pageInfo };
    }

    const scraped = await page.evaluate(() => ({
      description: document.querySelector('meta[name="description"]')?.content ?? null,
      headings: [...document.querySelectorAll("h1, h2, h3")]
        .map((heading) => ({
          level: heading.tagName.toLowerCase(),
          text: heading.textContent?.trim() ?? "",
        }))
        .filter((heading) => heading.text)
        .slice(0, 30),
      links: [...document.querySelectorAll("a[href]")]
        .map((anchor) => ({
          text: anchor.textContent?.trim().replace(/\s+/g, " ") ?? "",
          href: anchor.href,
        }))
        .slice(0, 30),
      text: document.body?.innerText.trim().replace(/\n{3,}/g, "\n\n").slice(0, 12_000) ?? "",
    }));
    return { ...responseInfo, ...scraped };
  }, {
    guardrails: {
      allowedDomains: [input.hostname, "*." + input.hostname],
      allowedDomainSets: ["common-cdns"],
    },
  });
}`;
