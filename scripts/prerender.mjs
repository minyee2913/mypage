// npm run build 의 두 번째 단계.
// react-scripts build 결과(build/index.html)를 템플릿으로 모든 공개 페이지를 정적 HTML 로 만들고,
// sitemap.xml / llms.txt / projects.json / projects/<slug>.md 를 같은 데이터에서 생성한다.
//
// GitHub Pages 는 /foo 요청에 foo.html 을 200 으로 돌려주고, 없는 경로에는 404.html 을 404 로 돌려준다.
//   /                   → index.html
//   /projects/          → projects/index.html
//   /projects/<slug>    → projects/<slug>.html
//   /project?sec=&pj=   → project.html (이전 주소, 브라우저에서 /projects/<slug> 로 이동)
//   그 외               → 404.html
import fs from "node:fs";
import path from "node:path";
import { ROOT, loadSsr } from "./lib/load-ssr.mjs";

const BUILD = path.join(ROOT, "build");
const PUBLIC = path.join(ROOT, "public");

function fail(msg) {
    console.error(`\n[prerender] ${msg}\n`);
    process.exit(1);
}

const templatePath = path.join(BUILD, "index.html");
if (!fs.existsSync(templatePath)) fail("build/index.html 이 없습니다. react-scripts build 를 먼저 실행하세요.");

// 이미 프리렌더된 index.html 로 다시 돌리는 경우를 막기 위해 원본 템플릿을 보관한다.
const pristinePath = path.join(ROOT, "node_modules", ".cache", "prerender", "template.html");
let template = fs.readFileSync(templatePath, "utf8");
if (template.includes('data-prerendered="true"')) {
    if (!fs.existsSync(pristinePath)) fail("build/index.html 이 이미 프리렌더되어 있습니다. npm run build 로 다시 빌드하세요.");
    template = fs.readFileSync(pristinePath, "utf8");
} else {
    fs.mkdirSync(path.dirname(pristinePath), { recursive: true });
    fs.writeFileSync(pristinePath, template);
}
if (!template.includes('<div id="root"></div>')) fail('템플릿에서 <div id="root"></div> 를 찾을 수 없습니다.');

const ssr = await loadSsr();

/* ---------- 1. 데이터 검증 ---------- */
const errors = ssr.validateProjects(ssr.projects, (p) => fs.existsSync(path.join(PUBLIC, p)));
if (errors.length) fail("프로젝트 데이터 오류:\n  " + errors.join("\n  "));

/* ---------- 2. HTML 생성 ---------- */
function page(url, { metaPath = url } = {}) {
    const meta = ssr.getRouteMeta(metaPath);
    const body = ssr.render(url);
    const head = ssr.renderHeadTags(meta);
    return template
        .replace(/<html lang="[^"]*"/, `<html lang="${ssr.SITE.lang}"`)
        .replace(/<title>[^<]*<\/title>/, "")
        .replace(/<meta name="description"[^>]*>/, "")
        .replace("</head>", `${head}</head>`)
        .replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${body}</div>`);
}

const written = [];
function write(rel, content) {
    const file = path.join(BUILD, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
    written.push(rel);
}

write("index.html", page("/"));
write("projects/index.html", page("/projects/"));
for (const p of ssr.projects) {
    write(`projects/${ssr.slugOf(p)}.html`, page(ssr.projectPath(p)));
    write(`projects/${ssr.slugOf(p)}.md`, ssr.projectToMarkdown(p));
    // 이름을 바꾼 프로젝트의 예전 주소: 새 페이지 내용 + canonical(새 주소) + noindex + 즉시 이동
    for (const a of p.aliases ?? []) write(`projects/${a}.html`, page(ssr.projectPath(p), { metaPath: `/projects/${a}` }));
}
// 이전 공유 링크(/project?sec=..&pj=..): 본문은 목록, canonical 은 /projects/, noindex
write("project.html", page("/projects/", { metaPath: "/project" }));
write("repositories.html", page("/repositories"));
write("downloads.html", page("/downloads"));
write("404.html", page("/404"));

/* ---------- 3. 기계가 읽는 자료 ---------- */
write("sitemap.xml", ssr.buildSitemap());
write("llms.txt", ssr.buildLlmsTxt());
write("projects.json", JSON.stringify(ssr.buildProjectsJson(), null, 2) + "\n");

/* ---------- 4. 공개 산출물에 비밀값이 섞이지 않았는지 확인 ---------- */
const leaks = [];
for (const rel of written) {
    const text = fs.readFileSync(path.join(BUILD, rel), "utf8");
    for (const re of ssr.SECRET_PATTERNS) if (re.test(text)) leaks.push(`${rel}: ${re}`);
}
const jsDir = path.join(BUILD, "static", "js");
if (fs.existsSync(jsDir)) {
    for (const f of fs.readdirSync(jsDir).filter((f) => f.endsWith(".js"))) {
        const text = fs.readFileSync(path.join(jsDir, f), "utf8");
        for (const re of ssr.SECRET_PATTERNS.slice(0, 5)) if (re.test(text)) leaks.push(`static/js/${f}: ${re}`);
    }
}
if (leaks.length) fail("공개 산출물에서 비밀값으로 보이는 문자열 발견:\n  " + leaks.join("\n  "));

console.log(`[prerender] ${written.length} files written (${ssr.projects.length} projects).`);
