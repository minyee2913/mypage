// build/ 를 GitHub Pages 와 같은 규칙으로 서빙하는 로컬 서버 (검증용).
//   node scripts/serve-build.mjs [port]
// 규칙: 파일이 있으면 그대로 / 디렉터리면 끝에 / 를 붙여 301 → index.html /
//       확장자 없는 경로는 <path>.html / 그 외에는 404.html 을 404 상태로.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/load-ssr.mjs";

const BUILD = path.join(ROOT, "build");
const port = Number(process.argv[2] ?? 5055);
const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ttf": "font/ttf",
    ".map": "application/json",
};

const isFile = (p) => fs.existsSync(p) && fs.statSync(p).isFile();
const isDir = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();

function send(res, status, file) {
    res.writeHead(status, { "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
}

http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const rel = decodeURIComponent(url.pathname);
    const target = path.join(BUILD, rel);
    if (!target.startsWith(BUILD)) return send(res, 404, path.join(BUILD, "404.html"));

    if (isFile(target)) return send(res, 200, target);
    if (isDir(target)) {
        if (!rel.endsWith("/")) {
            res.writeHead(301, { Location: rel + "/" + url.search });
            return res.end();
        }
        if (isFile(path.join(target, "index.html"))) return send(res, 200, path.join(target, "index.html"));
    }
    if (isFile(target + ".html")) return send(res, 200, target + ".html");
    return send(res, 404, path.join(BUILD, "404.html"));
}).listen(port, () => console.log(`serving build/ at http://localhost:${port}`));
