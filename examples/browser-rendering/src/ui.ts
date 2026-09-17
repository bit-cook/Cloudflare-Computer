export const UI_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Computer Browser</title>
  <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.2/src/regular/style.css">
  <style>
    :root {
      color-scheme: dark;
      --bg: #0a0b0d;
      --surface: #121418;
      --surface-2: #181b20;
      --surface-3: #20242a;
      --ink: #f7f5ef;
      --muted: #9b9da3;
      --line: rgba(255, 255, 255, 0.11);
      --line-strong: rgba(255, 255, 255, 0.2);
      --orange: #f6821f;
      --orange-bright: #ff9a3d;
      --green: #73d69b;
      --red: #ff7b7b;
      --blue: #8cc8ff;
      --radius: 16px;
      --shadow: 0 28px 90px rgba(0, 0, 0, 0.4);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      color: var(--ink);
      background:
        radial-gradient(circle at 12% -10%, rgba(246, 130, 31, 0.15), transparent 34rem),
        radial-gradient(circle at 95% 12%, rgba(63, 104, 176, 0.11), transparent 32rem),
        var(--bg);
      font: 14px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    body::before {
      position: fixed;
      inset: 0;
      z-index: -1;
      content: "";
      opacity: 0.12;
      background-image:
        linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: linear-gradient(to bottom, black, transparent 70%);
    }

    button, input { font: inherit; }
    button { color: inherit; }
    [hidden] { display: none !important; }

    .shell {
      width: min(1240px, calc(100% - 32px));
      margin: 0 auto;
      padding: 22px 0 64px;
    }

    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 46px;
    }

    .brand {
      display: flex;
      gap: 10px;
      align-items: center;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .brand-mark {
      display: grid;
      width: 32px;
      height: 32px;
      place-items: center;
      border-radius: 9px;
      color: #201308;
      background: var(--orange);
      box-shadow: 0 0 28px rgba(246, 130, 31, 0.3);
      font-size: 18px;
    }

    .stack-badge, .status-pill, .result-status {
      display: inline-flex;
      gap: 7px;
      align-items: center;
      border: 1px solid var(--line);
      border-radius: 999px;
      color: var(--muted);
      background: rgba(255,255,255,.035);
      font-size: 12px;
    }

    .stack-badge { padding: 7px 11px; }
    .stack-badge i { color: var(--orange-bright); font-size: 15px; }

    .title-row {
      display: flex;
      gap: 24px;
      align-items: end;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0;
      font-size: clamp(38px, 6vw, 68px);
      font-weight: 680;
      line-height: 0.98;
      letter-spacing: -0.055em;
    }

    .subtitle {
      max-width: 450px;
      margin: 0 0 5px;
      color: var(--muted);
      font-size: 15px;
    }

    .app-grid {
      display: grid;
      grid-template-columns: minmax(300px, 0.72fr) minmax(480px, 1.28fr);
      min-height: 600px;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 20px;
      background: rgba(18, 20, 24, 0.86);
      box-shadow: var(--shadow);
      backdrop-filter: blur(20px);
    }

    .controls {
      padding: 22px;
      border-right: 1px solid var(--line);
      background: rgba(255,255,255,.015);
    }

    .section-label {
      display: flex;
      gap: 7px;
      align-items: center;
      margin: 0 0 10px;
      color: var(--muted);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .section-label i { color: var(--orange-bright); font-size: 14px; }

    .url-field {
      position: relative;
      margin-bottom: 20px;
    }

    .url-field > i {
      position: absolute;
      top: 50%;
      left: 13px;
      color: var(--muted);
      font-size: 17px;
      transform: translateY(-50%);
      pointer-events: none;
    }

    input[type="url"] {
      width: 100%;
      min-width: 0;
      padding: 13px 13px 13px 39px;
      border: 1px solid var(--line);
      border-radius: 11px;
      outline: none;
      color: var(--ink);
      background: rgba(0,0,0,.28);
      transition: border-color .15s, box-shadow .15s;
    }

    input[type="url"]:focus {
      border-color: rgba(246,130,31,.8);
      box-shadow: 0 0 0 3px rgba(246,130,31,.12);
    }

    .actions {
      display: grid;
      gap: 8px;
      margin-bottom: 20px;
    }

    .action {
      display: grid;
      grid-template-columns: 38px 1fr 18px;
      gap: 10px;
      min-height: 62px;
      padding: 10px 12px;
      border: 1px solid var(--line);
      border-radius: 11px;
      align-items: center;
      text-align: left;
      cursor: pointer;
      background: rgba(255,255,255,.022);
      transition: border-color .15s, background .15s, transform .15s;
    }

    .action:hover { border-color: var(--line-strong); transform: translateY(-1px); }
    .action[aria-pressed="true"] { border-color: rgba(246,130,31,.8); background: rgba(246,130,31,.09); }
    .action.research-action { border-style: dashed; }
    .action.research-action[aria-pressed="true"] { border-style: solid; }

    .action-icon {
      display: grid;
      width: 36px;
      height: 36px;
      place-items: center;
      border-radius: 9px;
      color: var(--orange-bright);
      background: rgba(246,130,31,.1);
      font-size: 19px;
    }

    .action strong { display: block; font-size: 13px; }
    .action small { display: block; margin-top: 1px; color: var(--muted); font-size: 11px; }
    .action > .ph-check-circle { color: var(--orange); opacity: 0; font-size: 17px; }
    .action[aria-pressed="true"] > .ph-check-circle { opacity: 1; }

    .run {
      display: flex;
      width: 100%;
      min-height: 46px;
      padding: 0 16px;
      border: 0;
      border-radius: 11px;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #211306;
      cursor: pointer;
      background: var(--orange);
      font-weight: 750;
      transition: filter .15s, transform .15s;
    }

    .run:hover { filter: brightness(1.07); transform: translateY(-1px); }
    .run:disabled { cursor: wait; filter: grayscale(.25); opacity: .72; transform: none; }
    .run.loading i { animation: spin .9s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .run-status {
      display: flex;
      min-height: 28px;
      margin-top: 12px;
      align-items: center;
      gap: 8px;
      color: var(--muted);
      font-size: 12px;
    }

    .run-status i { font-size: 15px; }
    .run-status.running i { color: var(--orange); }
    .run-status.done i { color: var(--green); }
    .run-status.error i { color: var(--red); }

    .runtime-stack {
      display: grid;
      gap: 8px;
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid var(--line);
    }

    .runtime-stack div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--muted);
      font-size: 11px;
    }

    .runtime-stack b { color: var(--ink); font-weight: 550; }

    .output { min-width: 0; }

    .output-head {
      display: flex;
      min-height: 61px;
      padding: 0 20px;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--line);
    }

    .output-head h2 { margin: 0; font-size: 14px; }
    .output-actions { display: flex; gap: 8px; align-items: center; }

    .icon-button {
      display: inline-grid;
      width: 34px;
      height: 34px;
      padding: 0;
      border: 1px solid var(--line);
      border-radius: 9px;
      place-items: center;
      color: var(--muted);
      cursor: pointer;
      background: rgba(255,255,255,.025);
    }

    .icon-button:hover { color: var(--ink); border-color: var(--line-strong); }
    .status-pill { padding: 5px 9px; }

    .empty-state {
      display: grid;
      min-height: 538px;
      padding: 32px;
      place-items: center;
      color: var(--muted);
      text-align: center;
    }

    .empty-state i { display: block; margin-bottom: 12px; color: #5b5e65; font-size: 42px; }
    .empty-state b { display: block; margin-bottom: 4px; color: var(--ink); }

    .result { padding: 20px; }

    .result-summary {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 18px;
      margin-bottom: 18px;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--line);
    }

    .result-summary h3 { margin: 0 0 4px; font-size: 20px; letter-spacing: -.025em; }
    .result-summary a { color: var(--blue); word-break: break-all; font-size: 12px; text-decoration: none; }
    .result-status { align-self: start; padding: 5px 9px; color: var(--green); }

    .error-box {
      padding: 18px;
      border: 1px solid rgba(255,123,123,.3);
      border-radius: 12px;
      color: #ffd0d0;
      background: rgba(255,123,123,.07);
    }

    .error-box i { margin-right: 7px; }

    .screenshot-result {
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #08090b;
    }

    .screenshot-result img {
      display: block;
      width: 100%;
      max-height: 470px;
      object-fit: contain;
      object-position: top;
      background: white;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .metric {
      min-width: 0;
      padding: 14px;
      border: 1px solid var(--line);
      border-radius: 11px;
      background: rgba(255,255,255,.025);
    }

    .metric i { color: var(--orange-bright); font-size: 17px; }
    .metric strong { display: block; margin-top: 10px; overflow: hidden; text-overflow: ellipsis; font-size: 18px; }
    .metric span { color: var(--muted); font-size: 11px; }

    .scrape-result, .research-result { display: grid; gap: 16px; }
    .description { margin: 0; color: #d7d7d4; font-size: 14px; }

    .research-intro {
      display: flex;
      gap: 12px;
      padding: 14px;
      border: 1px solid rgba(115,214,155,.24);
      border-radius: 11px;
      align-items: center;
      color: #d8f6e3;
      background: rgba(115,214,155,.06);
    }

    .research-intro > i { color: var(--green); font-size: 22px; }
    .research-intro strong { display: block; font-size: 13px; }
    .research-intro span { display: block; color: var(--muted); font-size: 11px; }

    .workspace-visual {
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: rgba(4,5,7,.55);
    }

    .workspace-visual header {
      display: flex;
      min-height: 42px;
      padding: 0 13px;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid var(--line);
      color: var(--muted);
      font-size: 11px;
      font-weight: 650;
      letter-spacing: .04em;
      text-transform: uppercase;
    }

    .workspace-visual header i { color: var(--orange-bright); font-size: 15px; }
    .workspace-visual header span { margin-left: auto; color: #696c72; font-family: "SFMono-Regular", Consolas, monospace; font-size: 9px; letter-spacing: 0; text-transform: none; }
    .workspace-tree-shell { padding: 11px 12px 12px; font-family: "SFMono-Regular", Consolas, monospace; font-size: 11px; }

    .tree-row, .tree-file {
      display: flex;
      min-height: 26px;
      align-items: center;
      gap: 7px;
      color: #cfd2d8;
    }

    .tree-row i { color: var(--orange-bright); font-size: 14px; }
    .tree-indent { position: relative; padding-left: 21px; }
    .tree-indent::before { position: absolute; top: 0; bottom: 0; left: 7px; width: 1px; content: ""; background: var(--line); }
    .tree-run { color: var(--ink); }

    .workspace-tree { position: relative; display: grid; padding-left: 21px; }
    .workspace-tree::before { position: absolute; top: 0; bottom: 13px; left: 7px; width: 1px; content: ""; background: var(--line); }

    .tree-file {
      position: relative;
      min-width: 0;
      color: #d9dce2;
      text-decoration: none;
    }

    .tree-file::before { width: 9px; height: 1px; margin-left: -14px; content: ""; background: var(--line); }
    .tree-file:hover { color: white; }
    .tree-file > i { color: var(--blue); font-size: 14px; }
    .tree-file strong { overflow: hidden; text-overflow: ellipsis; font-weight: 500; white-space: nowrap; }
    .tree-file small { margin-left: auto; color: #73767d; font-size: 9px; }
    .tree-file .ph-check-circle { margin-left: 4px; color: var(--green); }

    .artifact-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 9px;
    }

    .artifact {
      display: grid;
      min-width: 0;
      padding: 13px;
      border: 1px solid var(--line);
      border-radius: 11px;
      color: var(--ink);
      background: rgba(255,255,255,.025);
      text-decoration: none;
      transition: border-color .15s, transform .15s;
    }

    .artifact:hover { border-color: var(--line-strong); transform: translateY(-1px); }
    .artifact i { margin-bottom: 12px; color: var(--orange-bright); font-size: 20px; }
    .artifact strong { overflow: hidden; text-overflow: ellipsis; font-size: 12px; }
    .artifact span { color: var(--muted); font-size: 10px; }

    .content-block {
      padding: 15px;
      border: 1px solid var(--line);
      border-radius: 11px;
      background: rgba(255,255,255,.018);
    }

    .content-block h4 { margin: 0 0 10px; font-size: 12px; }
    .excerpt { max-height: 180px; overflow: auto; color: var(--muted); white-space: pre-wrap; font-size: 12px; }
    .item-list { display: grid; gap: 7px; margin: 0; padding: 0; list-style: none; }
    .item-list li { display: flex; gap: 8px; min-width: 0; color: #d7d7d4; font-size: 12px; }
    .item-list i { flex: 0 0 auto; margin-top: 3px; color: var(--orange-bright); }
    .item-list a { overflow: hidden; color: var(--blue); text-overflow: ellipsis; white-space: nowrap; text-decoration: none; }

    .raw-result { margin-top: 16px; border-top: 1px solid var(--line); }
    .raw-result summary { padding: 14px 0 0; color: var(--muted); cursor: pointer; font-size: 12px; }
    .raw-result pre { max-height: 280px; margin: 12px 0 0; overflow: auto; }

    pre, code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; }
    pre { color: #d6dde5; font-size: 12px; line-height: 1.6; }

    .below-grid {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 14px;
      margin-top: 16px;
      align-items: start;
    }

    .code-panel, .source-button {
      border: 1px solid var(--line);
      border-radius: 14px;
      background: rgba(18,20,24,.7);
    }

    .code-panel summary {
      display: flex;
      min-height: 50px;
      padding: 0 16px;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: 620;
      list-style: none;
    }

    .code-panel summary::-webkit-details-marker { display: none; }
    .code-panel summary i { color: var(--orange-bright); font-size: 17px; }
    .code-panel summary .ph-caret-down { margin-left: auto; color: var(--muted); transition: transform .15s; }
    .code-panel[open] summary .ph-caret-down { transform: rotate(180deg); }
    .code-intro { margin: 0; padding: 0 18px 16px; color: var(--muted); font-size: 12px; line-height: 1.6; }
    .code-label { padding: 0 18px 8px; color: var(--orange-bright); font-size: 10px; font-weight: 750; letter-spacing: .1em; text-transform: uppercase; }
    .code-panel pre { margin: 0; padding: 0 18px 18px; overflow: auto; }

    .source-button {
      display: flex;
      min-height: 50px;
      padding: 0 16px;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      white-space: nowrap;
    }

    .source-button:hover { border-color: var(--line-strong); }
    .source-button i { color: var(--orange-bright); font-size: 17px; }

    dialog {
      width: min(850px, calc(100% - 32px));
      max-height: calc(100vh - 64px);
      padding: 0;
      overflow: hidden;
      border: 1px solid var(--line-strong);
      border-radius: 16px;
      color: var(--ink);
      background: var(--surface);
      box-shadow: var(--shadow);
    }

    dialog::backdrop { background: rgba(0,0,0,.72); backdrop-filter: blur(5px); }
    .dialog-head { display: flex; min-height: 56px; padding: 0 16px; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }
    .dialog-head h2 { margin: 0; font-size: 14px; }
    dialog pre { max-height: calc(100vh - 150px); margin: 0; padding: 18px; overflow: auto; }

    @media (max-width: 880px) {
      nav { margin-bottom: 34px; }
      .title-row { display: block; }
      .subtitle { margin-top: 12px; }
      .app-grid { grid-template-columns: 1fr; }
      .controls { border-right: 0; border-bottom: 1px solid var(--line); }
      .empty-state { min-height: 320px; }
      .metrics { grid-template-columns: repeat(2, 1fr); }
      .artifact-grid { grid-template-columns: 1fr; }
      .below-grid { grid-template-columns: 1fr; }
      .source-button { justify-content: center; }
    }

    @media (max-width: 540px) {
      .shell { width: min(100% - 20px, 1240px); padding-top: 14px; }
      .stack-badge { display: none; }
      .controls, .result { padding: 16px; }
      .metrics { grid-template-columns: 1fr 1fr; }
      .result-summary { grid-template-columns: 1fr; }
      h1 { font-size: 42px; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <nav>
      <div class="brand"><span class="brand-mark"><i class="ph ph-cpu"></i></span>Cloudflare Computer</div>
      <span class="stack-badge"><i class="ph ph-browser"></i> Worker JavaScript + Browser Run</span>
    </nav>

    <header class="title-row">
      <h1>Browser workspace</h1>
      <p class="subtitle">Run a real Puppeteer task, inspect the result, and keep generated files in one durable Computer workspace.</p>
    </header>

    <section class="app-grid">
      <form id="runner" class="controls">
        <p class="section-label"><i class="ph ph-globe-hemisphere-west"></i> Target</p>
        <div class="url-field">
          <i class="ph ph-link"></i>
          <input id="url" name="url" type="url" value="https://developers.cloudflare.com/agents/" autocomplete="url" spellcheck="false" required aria-label="Target URL">
        </div>

        <p class="section-label"><i class="ph ph-cursor-click"></i> Action</p>
        <div class="actions" role="group" aria-label="Browser action">
          <button class="action" type="button" data-action="scrape" data-label="Scrape page" aria-pressed="true">
            <span class="action-icon"><i class="ph ph-text-align-left"></i></span>
            <span><strong>Scrape</strong><small>Content, headings, and links</small></span>
            <i class="ph ph-check-circle"></i>
          </button>
          <button class="action" type="button" data-action="screenshot" data-label="Capture screenshot" aria-pressed="false">
            <span class="action-icon"><i class="ph ph-camera"></i></span>
            <span><strong>Screenshot</strong><small>Full-page PNG in the workspace</small></span>
            <i class="ph ph-check-circle"></i>
          </button>
          <button class="action" type="button" data-action="page-info" data-label="Inspect page" aria-pressed="false">
            <span class="action-icon"><i class="ph ph-chart-bar"></i></span>
            <span><strong>Page info</strong><small>Document and navigation metrics</small></span>
            <i class="ph ph-check-circle"></i>
          </button>
          <button class="action research-action" type="button" data-action="research" data-label="Build research bundle" aria-pressed="false">
            <span class="action-icon"><i class="ph ph-folder-notch-open"></i></span>
            <span><strong>Research bundle</strong><small>Scrape, analyze, and write three durable files</small></span>
            <i class="ph ph-check-circle"></i>
          </button>
        </div>

        <button id="run" class="run" type="submit"><i class="ph ph-play"></i><span>Scrape page</span></button>
        <div id="status" class="run-status"><i class="ph ph-circle"></i><span>Ready</span></div>

        <div class="runtime-stack" aria-label="Execution stack">
          <div><span>JavaScript</span><b>Dynamic Worker</b></div>
          <div><span>Chromium</span><b>Browser Run</b></div>
          <div><span>Files</span><b>Durable Workspace</b></div>
        </div>
      </form>

      <section class="output" aria-live="polite">
        <header class="output-head">
          <h2>Result</h2>
          <div class="output-actions"><span id="runtime" class="status-pill">Not run</span></div>
        </header>

        <div id="empty" class="empty-state">
          <div><i class="ph ph-browser"></i><b>Ready to browse</b>Select an action and run it against the URL.</div>
        </div>

        <div id="result" class="result" hidden>
          <div id="error" class="error-box" hidden><i class="ph ph-warning-circle"></i><span></span></div>

          <div id="result-summary" class="result-summary" hidden>
            <div><h3 id="result-title"></h3><a id="result-url" target="_blank" rel="noreferrer"></a></div>
            <span id="result-status" class="result-status"></span>
          </div>

          <div id="screenshot-result" class="screenshot-result" hidden>
            <img id="image" alt="Screenshot captured by Browser Run">
          </div>

          <div id="metrics" class="metrics" hidden></div>

          <div id="scrape-result" class="scrape-result" hidden>
            <p id="description" class="description"></p>
            <section class="content-block"><h4>Page text</h4><div id="excerpt" class="excerpt"></div></section>
            <section id="headings-block" class="content-block"><h4>Headings</h4><ul id="headings" class="item-list"></ul></section>
            <section id="links-block" class="content-block"><h4>Links</h4><ul id="links" class="item-list"></ul></section>
          </div>

          <div id="research-result" class="research-result" hidden>
            <div class="research-intro"><i class="ph ph-check-circle"></i><div><strong>Durable research bundle created</strong><span>All three files were written from the same isolated tool execution.</span></div></div>
            <section class="workspace-visual" aria-label="Durable Workspace files">
              <header><i class="ph ph-hard-drives"></i> Durable workspace <span>DOFS · persisted</span></header>
              <div class="workspace-tree-shell">
                <div class="tree-row"><i class="ph ph-folder-open"></i><strong>/workspace</strong></div>
                <div class="tree-indent">
                  <div class="tree-row"><i class="ph ph-folder-open"></i>browser-runs</div>
                  <div class="tree-indent">
                    <div class="tree-row tree-run"><i class="ph ph-folder-open"></i><span id="workspace-run">run</span></div>
                    <div id="workspace-tree" class="workspace-tree" role="tree"></div>
                  </div>
                </div>
              </div>
            </section>
            <div id="artifacts" class="artifact-grid"></div>
            <section class="content-block"><h4>Extracted summary</h4><div id="research-summary" class="excerpt"></div></section>
            <section class="content-block"><h4>Section map</h4><ul id="research-sections" class="item-list"></ul></section>
          </div>

          <details class="raw-result"><summary>Raw execution result</summary><pre><code id="json"></code></pre></details>
        </div>
      </section>
    </section>

    <section class="below-grid">
      <details class="code-panel" open>
        <summary><i class="ph ph-plugs-connected"></i> Plugin setup <i class="ph ph-caret-down"></i></summary>
        <p class="code-intro">The public plugin boundary is the backend registration and the <code>withBrowser()</code> call below. The scraper, research workflow, and artifact UI are example code, not required plugin setup.</p>
        <div class="code-label">Host Worker</div>
        <pre><code>import { DurableObject } from "cloudflare:workers";
import { Workspace } from "@cloudflare/computer";
import { WorkerJavaScriptBackend } from "@cloudflare/computer/backends/worker-javascript";
import { puppeteer } from "@cloudflare/computer/plugins/puppeteer";

export class BrowserWorkspace extends DurableObject&lt;Env&gt; {
  readonly #workspace: Workspace;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.#workspace = new Workspace({
      storage: ctx.storage,
      backends: [
        new WorkerJavaScriptBackend({
          loader: env.LOADER,
          plugins: [puppeteer({ browser: env.BROWSER })],
        }),
      ],
    });
  }
}</code></pre>
        <div class="code-label">Executed module</div>
        <pre><code>import { withBrowser } from "@cloudflare/puppeteer";

export default (input) =&gt; withBrowser(async (browser) =&gt; {
  const page = await browser.newPage();
  await page.goto(input.url);
  return { title: await page.title() };
}, {
  guardrails: { allowedDomains: [input.hostname] },
});</code></pre>
      </details>
      <button id="show-source" class="source-button" type="button"><i class="ph ph-code"></i> Full example task source</button>
    </section>
  </main>

  <dialog id="source-dialog">
    <header class="dialog-head"><h2>Full example task source</h2><button id="close-source" class="icon-button" type="button" aria-label="Close"><i class="ph ph-x"></i></button></header>
    <pre><code id="source">Loading…</code></pre>
  </dialog>

  <script type="module">
    const byId = (id) => document.getElementById(id);
    const runner = byId("runner");
    const urlInput = byId("url");
    const runButton = byId("run");
    const status = byId("status");
    const runtime = byId("runtime");
    const empty = byId("empty");
    const result = byId("result");
    const errorBox = byId("error");
    const summary = byId("result-summary");
    const title = byId("result-title");
    const resultUrl = byId("result-url");
    const resultStatus = byId("result-status");
    const screenshot = byId("screenshot-result");
    const image = byId("image");
    const metrics = byId("metrics");
    const scrapeResult = byId("scrape-result");
    const researchResult = byId("research-result");
    const workspaceRun = byId("workspace-run");
    const workspaceTree = byId("workspace-tree");
    const artifacts = byId("artifacts");
    const researchSummary = byId("research-summary");
    const researchSections = byId("research-sections");
    const description = byId("description");
    const excerpt = byId("excerpt");
    const headings = byId("headings");
    const headingsBlock = byId("headings-block");
    const links = byId("links");
    const linksBlock = byId("links-block");
    const json = byId("json");
    const sourceDialog = byId("source-dialog");
    const source = byId("source");
    const actionButtons = Array.from(document.querySelectorAll(".action"));
    let action = "scrape";
    let sourceLoaded = false;

    function selectAction(button) {
      action = button.dataset.action;
      for (const candidate of actionButtons) {
        candidate.setAttribute("aria-pressed", String(candidate === button));
      }
      runButton.lastElementChild.textContent = button.dataset.label;
    }

    for (const button of actionButtons) {
      button.addEventListener("click", () => selectAction(button));
    }

    function setRunStatus(state, icon, text) {
      status.className = "run-status " + state;
      status.firstElementChild.className = "ph " + icon;
      status.lastElementChild.textContent = text;
    }

    function showOnly(section) {
      screenshot.hidden = section !== screenshot;
      metrics.hidden = section !== metrics;
      scrapeResult.hidden = section !== scrapeResult;
      researchResult.hidden = section !== researchResult;
    }

    function addMetric(icon, label, value) {
      const card = document.createElement("article");
      card.className = "metric";
      const glyph = document.createElement("i");
      glyph.className = "ph " + icon;
      const number = document.createElement("strong");
      number.textContent = String(value ?? "—");
      const caption = document.createElement("span");
      caption.textContent = label;
      card.append(glyph, number, caption);
      metrics.append(card);
    }

    function renderSummary(value) {
      title.textContent = value.title || "Untitled page";
      resultUrl.textContent = value.finalUrl || value.requestedUrl || "";
      resultUrl.href = value.finalUrl || value.requestedUrl || "#";
      resultStatus.textContent = value.status == null ? "No response" : "HTTP " + value.status;
      summary.hidden = false;
    }

    function renderScreenshot(value) {
      showOnly(screenshot);
      image.src = "/api/file?path=" + encodeURIComponent(value.screenshotPath) + "&v=" + Date.now();
    }

    function renderPageInfo(value) {
      showOnly(metrics);
      metrics.replaceChildren();
      addMetric("ph-monitor", "Viewport", value.viewport ? value.viewport.width + " × " + value.viewport.height : "—");
      addMetric("ph-corners-out", "Document", value.document ? value.document.elements + " elements" : "—");
      addMetric("ph-image", "Images", value.document?.images);
      addMetric("ph-link", "Links", value.document?.links);
      addMetric("ph-code", "Scripts", value.document?.scripts);
      addMetric("ph-timer", "DOMContentLoaded", value.timing ? value.timing.domContentLoaded + " ms" : "—");
    }

    function appendListItem(list, icon, text, href) {
      const item = document.createElement("li");
      const glyph = document.createElement("i");
      glyph.className = "ph " + icon;
      const content = href ? document.createElement("a") : document.createElement("span");
      content.textContent = text;
      if (href) {
        content.href = href;
        content.target = "_blank";
        content.rel = "noreferrer";
      }
      item.append(glyph, content);
      list.append(item);
    }

    function renderScrape(value) {
      showOnly(scrapeResult);
      description.textContent = value.description || "No page description.";
      excerpt.textContent = value.text || "No body text returned.";
      headings.replaceChildren();
      links.replaceChildren();
      for (const heading of value.headings || []) {
        appendListItem(headings, "ph-text-h", heading.text);
      }
      for (const link of value.links || []) {
        appendListItem(links, "ph-arrow-up-right", link.text || link.href, link.href);
      }
      headingsBlock.hidden = headings.children.length === 0;
      linksBlock.hidden = links.children.length === 0;
    }

    function formatBytes(bytes) {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KiB";
      return (bytes / (1024 * 1024)).toFixed(1) + " MiB";
    }

    function renderResearch(value) {
      showOnly(researchResult);
      artifacts.replaceChildren();
      workspaceTree.replaceChildren();
      researchSections.replaceChildren();
      researchSummary.textContent = value.summary || value.description || "No summary returned.";
      const files = value.files || [];
      const directory = files[0]?.path.slice(0, files[0].path.lastIndexOf("/")) || "";
      workspaceRun.textContent = directory.slice(directory.lastIndexOf("/") + 1) || "run";
      for (const file of files) {
        const href = "/api/file?path=" + encodeURIComponent(file.path);
        const fileIcon = file.name.endsWith(".png") ? "ph-image" : file.name.endsWith(".json") ? "ph-brackets-curly" : "ph-file-md";
        const treeLink = document.createElement("a");
        treeLink.className = "tree-file";
        treeLink.href = href;
        treeLink.target = "_blank";
        treeLink.rel = "noreferrer";
        treeLink.setAttribute("role", "treeitem");
        const treeIcon = document.createElement("i");
        treeIcon.className = "ph " + fileIcon;
        const treeName = document.createElement("strong");
        treeName.textContent = file.name;
        const treeSize = document.createElement("small");
        treeSize.textContent = formatBytes(file.bytes);
        const persisted = document.createElement("i");
        persisted.className = "ph ph-check-circle";
        persisted.setAttribute("aria-label", "Persisted");
        treeLink.append(treeIcon, treeName, treeSize, persisted);
        workspaceTree.append(treeLink);

        const link = document.createElement("a");
        link.className = "artifact";
        link.href = href;
        link.target = "_blank";
        link.rel = "noreferrer";
        const icon = document.createElement("i");
        icon.className = "ph " + fileIcon;
        const name = document.createElement("strong");
        name.textContent = file.name;
        const size = document.createElement("span");
        size.textContent = formatBytes(file.bytes);
        link.append(icon, name, size);
        artifacts.append(link);
      }
      for (const section of value.sections || []) {
        appendListItem(researchSections, "ph-text-h", section.level.toUpperCase() + " · " + section.text);
      }
    }

    function renderValue(value, submittedAction) {
      errorBox.hidden = true;
      renderSummary(value);
      if (submittedAction === "screenshot") renderScreenshot(value);
      else if (submittedAction === "page-info") renderPageInfo(value);
      else if (submittedAction === "research") renderResearch(value);
      else renderScrape(value);
      json.textContent = JSON.stringify(value, null, 2);
    }

    function renderError(error) {
      showOnly(null);
      summary.hidden = true;
      errorBox.hidden = false;
      errorBox.lastElementChild.textContent = error instanceof Error ? error.message : String(error);
      json.textContent = JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2);
    }

    runner.addEventListener("submit", async (event) => {
      event.preventDefault();
      const target = urlInput.value.trim();
      if (!urlInput.reportValidity()) return;
      const submittedAction = action;
      runButton.disabled = true;
      runButton.classList.add("loading");
      runButton.firstElementChild.className = "ph ph-spinner-gap";
      setRunStatus("running", "ph-spinner-gap", "Launching Browser Run…");
      runtime.textContent = "Running";
      empty.hidden = true;
      result.hidden = false;
      errorBox.hidden = true;
      summary.hidden = true;
      showOnly(null);
      const started = performance.now();

      try {
        const response = await fetch("/api/run", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: submittedAction, url: target }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Browser execution failed");
        renderValue(payload.value, submittedAction);
        runtime.textContent = Math.round(performance.now() - started) + " ms · exit " + payload.exitCode;
        setRunStatus("done", "ph-check-circle", "Completed in an isolated Worker");
      } catch (error) {
        renderError(error);
        runtime.textContent = "Failed";
        setRunStatus("error", "ph-warning-circle", "Execution failed");
      } finally {
        runButton.disabled = false;
        runButton.classList.remove("loading");
        runButton.firstElementChild.className = "ph ph-play";
      }
    });

    byId("show-source").addEventListener("click", async () => {
      sourceDialog.showModal();
      if (sourceLoaded) return;
      try {
        const response = await fetch("/api/source");
        source.textContent = await response.text();
        sourceLoaded = true;
      } catch {
        source.textContent = "The execution source could not be loaded.";
      }
    });

    byId("close-source").addEventListener("click", () => sourceDialog.close());
    sourceDialog.addEventListener("click", (event) => {
      if (event.target === sourceDialog) sourceDialog.close();
    });
  </script>
</body>
</html>`;
