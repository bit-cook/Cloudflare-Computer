const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function authorizeDemoRequest(request: Request, token: string | undefined): Response | null {
  if (LOCAL_HOSTS.has(new URL(request.url).hostname)) return null;
  if (!token) {
    return new Response("Set the DEMO_TOKEN secret before deploying this example.", {
      status: 503,
    });
  }

  const expected = `Basic ${encodeBase64Utf8(`demo:${token}`)}`;
  if (request.headers.get("authorization") === expected) return null;
  return new Response("Authentication required", {
    status: 401,
    headers: { "www-authenticate": 'Basic realm="Browser demo", charset="UTF-8"' },
  });
}

function encodeBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
