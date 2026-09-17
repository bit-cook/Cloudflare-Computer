import { DurableObject } from "cloudflare:workers";
import { type DurableObjectStorageLike, Workspace } from "@cloudflare/computer";
import {
  WorkerJavaScriptBackend,
  type WorkerJavaScriptPlugin,
} from "@cloudflare/computer/backends/worker-javascript";
import { puppeteer } from "@cloudflare/computer/plugins/puppeteer";
import { authorizeDemoRequest } from "./demo-auth.js";
import { EXECUTION_SOURCE } from "./execution-source.js";
import { UI_HTML } from "./ui.js";

interface Env {
  BrowserWorkspace: DurableObjectNamespace<BrowserWorkspace>;
  BROWSER: Fetcher;
  DEMO_TOKEN?: string;
  LOADER: WorkerLoader;
}

export type BrowserAction = "scrape" | "screenshot" | "page-info" | "research";

interface BrowserRunRequest {
  action?: BrowserAction;
  url?: string;
}

interface BrowserResultValue {
  requestedUrl: string;
  finalUrl: string;
  status: number | null;
  title: string;
  description?: string | null;
  language?: string | null;
  summary?: string;
  text?: string;
  headings?: Array<{ level: string; text: string }>;
  links?: Array<{ text: string; href: string }>;
  sections?: Array<{ level: string; text: string }>;
  codeSamples?: Array<{ text: string }>;
  internalLinks?: Array<{ text: string; href: string }>;
  files?: Array<{ name: string; path: string; mediaType: string; bytes: number }>;
  reportPath?: string;
  dataPath?: string;
  screenshotPath?: string;
  dimensions?: { width: number; height: number };
  viewport?: { width: number; height: number; devicePixelRatio: number };
  document?: { elements: number; images: number; links: number; scripts: number };
  timing?: { responseEnd: number; domContentLoaded: number; load: number } | null;
}

interface BrowserRunResult {
  exitCode: number;
  value: BrowserResultValue;
}

export class BrowserWorkspace extends DurableObject<Env> {
  readonly #workspace: Workspace;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // This registration is the entire host-side plugin integration. The limits
    // below belong to this example application.
    const browserPlugin: WorkerJavaScriptPlugin = puppeteer({ browser: env.BROWSER });
    const backend = new WorkerJavaScriptBackend({
      loader: env.LOADER,
      plugins: [browserPlugin],
      defaultTimeoutMs: 60_000,
      maxTimeoutMs: 90_000,
      maxConcurrentExecutions: 3,
      maxCapabilityBytes: 8 * 1024 * 1024,
      maxCapabilityRequestBytes: 16 * 1024 * 1024,
    });
    this.#workspace = new Workspace({
      storage: ctx.storage as unknown as DurableObjectStorageLike,
      backends: [backend],
    });
  }

  async run(action: BrowserAction, target: string): Promise<BrowserRunResult> {
    const url = new URL(target);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("url must use http or https");
    }
    const outputDirectory = `/workspace/browser-runs/${crypto.randomUUID()}`;
    const screenshotPath = `${outputDirectory}/screenshot.png`;
    const reportPath = `${outputDirectory}/report.md`;
    const dataPath = `${outputDirectory}/page.json`;
    if (action === "screenshot" || action === "research") {
      await this.#workspace.fs.mkdir(outputDirectory, { recursive: true });
    }
    using execution = await this.#workspace.runtime.exec(EXECUTION_SOURCE, {
      backend: "worker-javascript",
      input: {
        action,
        url: url.href,
        hostname: url.hostname,
        outputDirectory,
        screenshotPath,
        reportPath,
        dataPath,
      },
      encoding: "utf8",
      timeoutMs: 60_000,
    });
    const result = await execution.result();
    if (result.status !== "completed" || result.value === undefined) {
      throw new Error(result.stderr.trim() || `browser execution exited with ${result.exitCode}`);
    }
    return { exitCode: result.exitCode, value: parseBrowserResult(result.value) };
  }

  readArtifact(path: string): Promise<ReadableStream<Uint8Array>> {
    if (
      !/^\/workspace\/browser-runs\/[0-9a-f-]+\/(?:report\.md|page\.json|screenshot\.png)$/.test(
        path,
      )
    ) {
      throw new Error("invalid browser artifact path");
    }
    return this.#workspace.fs.readFile(path);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const authorizationError = authorizeDemoRequest(request, env.DEMO_TOKEN);
    if (authorizationError) return authorizationError;
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/") {
      return new Response(UI_HTML, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
    if (request.method === "GET" && url.pathname === "/api/source") {
      return new Response(EXECUTION_SOURCE, {
        headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
      });
    }

    const stub = env.BrowserWorkspace.getByName("demo");
    if (request.method === "POST" && url.pathname === "/api/run") {
      let input: BrowserRunRequest;
      try {
        input = (await request.json()) as BrowserRunRequest;
        if (!isBrowserAction(input.action)) throw new Error("unknown browser action");
        if (typeof input.url !== "string") throw new Error("url must be a string");
      } catch (error) {
        return errorResponse(error, 400);
      }
      try {
        return Response.json(await stub.run(input.action, input.url));
      } catch (error) {
        return errorResponse(error, 500);
      }
    }
    if (request.method === "GET" && url.pathname === "/api/file") {
      const path = url.searchParams.get("path");
      if (path === null) return errorResponse(new Error("missing browser artifact path"), 400);
      try {
        const filename = path.slice(path.lastIndexOf("/") + 1);
        return new Response(await stub.readArtifact(path), {
          headers: {
            "content-type": artifactContentType(filename),
            "content-disposition": `inline; filename="${filename}"`,
            "cache-control": "private, max-age=300",
          },
        });
      } catch (error) {
        return errorResponse(error, 404);
      }
    }

    return new Response("not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

function parseBrowserResult(value: unknown): BrowserResultValue {
  if (!isRecord(value)) throw new Error("browser execution returned an invalid result");
  const requestedUrl = requiredString(value.requestedUrl, "requestedUrl");
  const finalUrl = requiredString(value.finalUrl, "finalUrl");
  const title = requiredString(value.title, "title");
  const status = value.status === null ? null : requiredNumber(value.status, "status");
  const parsed: BrowserResultValue = { requestedUrl, finalUrl, title, status };
  if (typeof value.description === "string" || value.description === null) {
    parsed.description = value.description;
  }
  if (typeof value.language === "string" || value.language === null) {
    parsed.language = value.language;
  }
  if (typeof value.summary === "string") parsed.summary = value.summary;
  if (typeof value.text === "string") parsed.text = value.text;
  if (typeof value.reportPath === "string") parsed.reportPath = value.reportPath;
  if (typeof value.dataPath === "string") parsed.dataPath = value.dataPath;
  if (typeof value.screenshotPath === "string") parsed.screenshotPath = value.screenshotPath;
  if (Array.isArray(value.headings)) {
    parsed.headings = value.headings.filter(isRecord).map((heading) => ({
      level: requiredString(heading.level, "heading level"),
      text: requiredString(heading.text, "heading text"),
    }));
  }
  if (Array.isArray(value.links)) {
    parsed.links = value.links.filter(isRecord).map((link) => ({
      text: requiredString(link.text, "link text"),
      href: requiredString(link.href, "link href"),
    }));
  }
  if (Array.isArray(value.sections)) {
    parsed.sections = value.sections.filter(isRecord).map((section) => ({
      level: requiredString(section.level, "section level"),
      text: requiredString(section.text, "section text"),
    }));
  }
  if (Array.isArray(value.codeSamples)) {
    parsed.codeSamples = value.codeSamples.filter(isRecord).map((sample) => ({
      text: requiredString(sample.text, "code sample"),
    }));
  }
  if (Array.isArray(value.internalLinks)) {
    parsed.internalLinks = value.internalLinks.filter(isRecord).map((link) => ({
      text: requiredString(link.text, "internal link text"),
      href: requiredString(link.href, "internal link href"),
    }));
  }
  if (Array.isArray(value.files)) {
    parsed.files = value.files.filter(isRecord).map((file) => ({
      name: requiredString(file.name, "artifact name"),
      path: requiredString(file.path, "artifact path"),
      mediaType: requiredString(file.mediaType, "artifact media type"),
      bytes: requiredNumber(file.bytes, "artifact size"),
    }));
  }
  if (isRecord(value.dimensions)) {
    parsed.dimensions = {
      width: requiredNumber(value.dimensions.width, "document width"),
      height: requiredNumber(value.dimensions.height, "document height"),
    };
  }
  if (isRecord(value.viewport)) {
    parsed.viewport = {
      width: requiredNumber(value.viewport.width, "viewport width"),
      height: requiredNumber(value.viewport.height, "viewport height"),
      devicePixelRatio: requiredNumber(value.viewport.devicePixelRatio, "device pixel ratio"),
    };
  }
  if (isRecord(value.document)) {
    parsed.document = {
      elements: requiredNumber(value.document.elements, "element count"),
      images: requiredNumber(value.document.images, "image count"),
      links: requiredNumber(value.document.links, "link count"),
      scripts: requiredNumber(value.document.scripts, "script count"),
    };
  }
  if (value.timing === null) parsed.timing = null;
  else if (isRecord(value.timing)) {
    parsed.timing = {
      responseEnd: requiredNumber(value.timing.responseEnd, "response timing"),
      domContentLoaded: requiredNumber(value.timing.domContentLoaded, "DOM timing"),
      load: requiredNumber(value.timing.load, "load timing"),
    };
  }
  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, name: string): string {
  if (typeof value !== "string") throw new Error(`browser result ${name} must be a string`);
  return value;
}

function requiredNumber(value: unknown, name: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`browser result ${name} must be a finite number`);
  }
  return value;
}

function isBrowserAction(value: unknown): value is BrowserAction {
  return (
    value === "scrape" || value === "screenshot" || value === "page-info" || value === "research"
  );
}

function artifactContentType(filename: string): string {
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".json")) return "application/json; charset=utf-8";
  return "text/markdown; charset=utf-8";
}

function errorResponse(error: unknown, status: number): Response {
  return Response.json(
    { error: error instanceof Error ? error.message : String(error) },
    { status },
  );
}
