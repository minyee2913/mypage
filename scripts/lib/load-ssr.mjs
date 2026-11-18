// src/ssr.tsx (React 앱 + 콘텐츠 데이터)를 Node 에서 쓸 수 있게 esbuild 로 번들해서 불러온다.
import { build } from "esbuild";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** React 앱 없이 콘텐츠 데이터만 필요할 때 (releases.json 생성 등) */
export const loadContent = () => loadSsr("src/content/index.ts", "content.cjs");

export async function loadSsr(entry = "src/ssr.tsx", outName = "ssr.cjs") {
    // node_modules 안에 출력해야 외부 패키지(react 등)를 그대로 require 할 수 있다.
    const outfile = path.join(ROOT, "node_modules", ".cache", "prerender", outName);
    await build({
        entryPoints: [path.join(ROOT, entry)],
        outfile,
        bundle: true,
        platform: "node",
        format: "cjs",
        target: "node18",
        jsx: "automatic",
        packages: "external",
        loader: { ".css": "empty", ".svg": "empty", ".png": "empty", ".ttf": "empty" },
        define: { "process.env.NODE_ENV": '"production"', "process.env.PUBLIC_URL": '""' },
        logLevel: "warning",
    });
    const require = createRequire(import.meta.url);
    delete require.cache[outfile];
    return require(outfile);
}
