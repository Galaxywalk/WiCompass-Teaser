import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

export function startServer(port = 4173) {
  const root = normalize(join(import.meta.dirname, ".."));
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".m4a": "audio/mp4",
    ".mp3": "audio/mpeg",
  };

  const server = createServer(async (request, response) => {
    try {
      const requestedPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
      const relative = requestedPath === "/" ? "index.html" : requestedPath.replace(/^\/+/, "");
      const filePath = normalize(join(root, relative));
      if (!filePath.startsWith(root)) throw new Error("Invalid path");
      const info = await stat(filePath);
      if (!info.isFile()) throw new Error("Not a file");
      response.writeHead(200, { "content-type": mime[extname(filePath)] ?? "application/octet-stream", "cache-control": "no-store" });
      response.end(await readFile(filePath));
    } catch {
      response.writeHead(404, { "content-type": "text/plain" });
      response.end("Not found");
    }
  });

  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

if (process.argv[1] === import.meta.filename) {
  await startServer();
  process.stdout.write("WiCompass teaser preview: http://127.0.0.1:4173\n");
}
