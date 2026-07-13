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
      const body = await readFile(filePath);
      const headers = {
        "accept-ranges": "bytes",
        "cache-control": "no-store",
        "content-type": mime[extname(filePath)] ?? "application/octet-stream",
      };
      const range = request.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
      if (request.headers.range && !range) {
        response.writeHead(416, { ...headers, "content-range": `bytes */${body.length}` });
        response.end();
        return;
      }
      if (range) {
        const suffixLength = range[1] === "" ? Number(range[2]) : undefined;
        const start = suffixLength === undefined
          ? Number(range[1])
          : Math.max(0, body.length - suffixLength);
        const requestedEnd = range[2] === "" || suffixLength !== undefined
          ? body.length - 1
          : Number(range[2]);
        const end = Math.min(requestedEnd, body.length - 1);
        if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start > end || start >= body.length) {
          response.writeHead(416, { ...headers, "content-range": `bytes */${body.length}` });
          response.end();
          return;
        }
        const chunk = body.subarray(start, end + 1);
        response.writeHead(206, {
          ...headers,
          "content-length": chunk.length,
          "content-range": `bytes ${start}-${end}/${body.length}`,
        });
        response.end(request.method === "HEAD" ? undefined : chunk);
        return;
      }
      response.writeHead(200, { ...headers, "content-length": body.length });
      response.end(request.method === "HEAD" ? undefined : body);
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
