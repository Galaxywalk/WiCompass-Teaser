import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

export function startServer(port = 0) {
  const root = normalize(join(import.meta.dirname, ".."));
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ttf": "font/ttf",
    ".m4a": "audio/mp4",
    ".mp3": "audio/mpeg",
  };

  const server = createServer(async (request, response) => {
    try {
      const requestedPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
      const relative = requestedPath === "/" ? "index.html" : requestedPath.replace(/^\/+/, "");
      const filePath = normalize(join(root, relative));
      if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) throw new Error("Invalid path");
      const info = await stat(filePath);
      if (!info.isFile()) throw new Error("Not a file");
      response.writeHead(200, { "content-type": mime[extname(filePath)] ?? "application/octet-stream", "cache-control": "no-store" });
      response.end(await readFile(filePath));
    } catch {
      response.writeHead(404, { "content-type": "text/plain" });
      response.end("Not found");
    }
  });

  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => {
    const address = server.address();
    resolve({ server, origin: `http://127.0.0.1:${address.port}` });
  }));
}

if (process.argv[1] === import.meta.filename) {
  const port = Math.max(1, Number(process.env.PORT) || 4173);
  const { origin } = await startServer(port);
  process.stdout.write(`WiCompass teaser preview: ${origin}\n`);
}
