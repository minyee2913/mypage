// JavaScript 를 실행하지 않는 HTTP 클라이언트 입장에서 사이트를 검사한다.
//   node scripts/verify-site.mjs http://localhost:5055
//   node scripts/verify-site.mjs https://human.minyee2913.net
// 기대값은 src/content 원본 데이터에서 가져오므로, 배포본이 최신 데이터와 다르면 실패한다.
import { loadSsr } from "./lib/load-ssr.mjs";

const base = (process.argv[2] ?? "http://localhost:5055").replace(/\/+$/, "");
const ssr = await loadSsr();
const { SITE, projects } = ssr;

let failures = 0;
let passes = 0;
const log = [];
function check(name, ok, detail = "") {
    if (ok) passes++;
    else failures++;
    log.push(`${ok ? "PASS" : "FAIL"}  ${name}${!ok && detail ? `\n        ${detail}` : ""}`);
}

const UA = "verify-site/1.0 (no-js http client)";
async function get(p) {
    const res = await fetch(base + p, { redirect: "manual", headers: { "User-Agent": UA } });
    return { status: res.status, type: res.headers.get("content-type") ?? "", body: await res.text(), location: res.headers.get("location") };
}

const decode = (s) =>
    s
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;|&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&");
const norm = (s) => s.replace(/\s+/g, " ").trim();
/** JS 없이 보이는 본문 텍스트 (script/style/head 제외) */
function bodyText(html) {
    const body = html.split(/<body[^>]*>/i)[1] ?? html;
    return norm(
        decode(
            body
                .replace(/<script[\s\S]*?<\/script>/gi, " ")
                .replace(/<style[\s\S]*?<\/style>/gi, " ")
                // 문장 안의 인라인 태그(강조, 용어 툴팁 등)는 글자를 끊지 않는다
                .replace(/<\/?(?:span|strong|em|b|i|abbr|time|code)\b[^>]*>/gi, "")
                .replace(/<[^>]+>/g, " "),
        ),
    );
}
// 마크다운: 이스케이프와 **굵은 글씨** 표시를 걷어 내고 비교
const mdText = (md) => norm(md.replace(/\*\*(?!\\)/g, "").replace(/\\([\\`*_[\]<>])/g, "$1"));
function jsonLd(html) {
    return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
}
function graphNodes(html) {
    return jsonLd(html).flatMap((j) => j["@graph"] ?? [j]);
}
const metaContent = (html, attr, key) =>
    decode(html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))?.[1] ?? "");
const canonical = (html) => html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
const h1 = (html) => norm(decode((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "").replace(/<[^>]+>/g, "")));

/** 화면에 보여야 하는 핵심 문구 */
function expectedTexts(p) {
    const out = [p.title];
    if (p.description) out.push(p.description);
    if (p.subtitle) out.push(p.subtitle);
    p.overview?.forEach((o) => out.push(o));
    p.gameplay?.forEach((o) => out.push(o));
    p.features?.forEach((f) => {
        out.push(f.name);
        if (f.purpose) out.push(f.purpose);
        f.how?.forEach((h) => out.push(h));
    });
    p.technicalChallenges?.forEach((c) => out.push(c.title, c.problem, ...(c.cause ? [c.cause] : []), ...(c.result ? [c.result] : [])));
    p.achievements?.forEach((a) => out.push(a.title));
    if (p.engine) out.push(p.engine);
    p.languages?.forEach((l) => out.push(l));
    // 데이터의 **강조** 표시는 화면에서 굵은 글씨가 되므로 비교할 때는 뺀다
    return out.map((t) => norm(ssr.stripEmphasis(t)));
}

/* ---------- 홈 ---------- */
{
    const r = await get("/");
    const text = bodyText(r.body);
    check("GET / → 200 text/html", r.status === 200 && r.type.includes("text/html"), `${r.status} ${r.type}`);
    check("홈 h1 = 개발자 이름", h1(r.body) === SITE.name, h1(r.body));
    for (const t of [SITE.author.jobTitle, SITE.author.tagline, SITE.author.about, SITE.author.skills.join(" | ")])
        check(`홈 본문에 소개 문구: "${t.slice(0, 30)}…"`, text.includes(norm(t)));
    check('홈에 <a href="/projects/"> 링크', r.body.includes('href="/projects/"'));
    check("홈 JSON-LD Person/WebSite", graphNodes(r.body).some((n) => n["@type"] === "Person") && graphNodes(r.body).some((n) => n["@type"] === "WebSite"));
    check("홈 lang=ko", /<html lang="ko"/.test(r.body));
    check("홈 canonical", canonical(r.body) === SITE.url + "/", canonical(r.body));
}

/* ---------- 목록 ---------- */
{
    const r = await get("/projects/");
    const text = bodyText(r.body);
    check("GET /projects/ → 200", r.status === 200, String(r.status));
    const missing = projects.filter((p) => !r.body.includes(`href="/projects/${ssr.slugOf(p)}"`) || !text.includes(norm(p.title)));
    check(`목록 HTML 에 프로젝트 ${projects.length}개 제목+링크`, missing.length === 0, missing.map((p) => p.id).join(", "));
    const list = graphNodes(r.body).find((n) => n["@type"] === "CollectionPage");
    check("목록 JSON-LD ItemList 개수 일치", list?.mainEntity?.numberOfItems === projects.length);
    const noSlash = await get("/projects");
    check("GET /projects → 200 또는 /projects/ 로 리다이렉트", noSlash.status === 200 || (noSlash.status === 301 && /\/projects\/$/.test(noSlash.location ?? "")), `${noSlash.status} ${noSlash.location ?? ""}`);
}

/* ---------- 이름을 바꾼 프로젝트의 예전 주소 ---------- */
for (const p of projects) {
    for (const a of p.aliases ?? []) {
        const r = await get(`/projects/${a}`);
        const target = `${SITE.url}/projects/${ssr.slugOf(p)}`;
        check(
            `예전 주소 /projects/${a} → 새 주소(${ssr.slugOf(p)})로 canonical·이동·noindex`,
            r.status === 200 &&
                canonical(r.body) === target &&
                r.body.includes(`http-equiv="refresh" content="0; url=/projects/${ssr.slugOf(p)}"`) &&
                r.body.includes('content="noindex'),
            `${r.status} ${canonical(r.body)}`,
        );
    }
}

/* ---------- 상세 + Markdown ---------- */
const imgSrcs = new Set();
for (const p of projects) {
    const slug = ssr.slugOf(p);
    const r = await get(`/projects/${slug}`);
    const text = bodyText(r.body);
    const want = expectedTexts(p);
    const missing = want.filter((t) => !text.includes(t));
    check(`/projects/${slug} → 200`, r.status === 200, String(r.status));
    check(`/projects/${slug} h1 = "${p.title}"`, h1(r.body) === norm(p.title), h1(r.body));
    check(`/projects/${slug} 본문에 핵심 문구 ${want.length}개`, missing.length === 0, missing.slice(0, 3).join(" | "));
    check(`/projects/${slug} canonical/og:title/description`,
        canonical(r.body) === `${SITE.url}/projects/${slug}` &&
            metaContent(r.body, "property", "og:title").includes(p.title) &&
            metaContent(r.body, "name", "description") === norm(ssr.projectSummary(p)),
        canonical(r.body));
    const entity = graphNodes(r.body).find((n) => n["@type"] === "VideoGame" || n["@type"] === "SoftwareApplication");
    check(`/projects/${slug} JSON-LD ${entity?.["@type"] ?? "?"} name 일치`, entity?.name === p.title);
    for (const m of r.body.matchAll(/<img[^>]+src="(\/[^"]+)"/g)) imgSrcs.add(m[1]);
    const noAlt = [...r.body.matchAll(/<img(?![^>]*\balt=)[^>]*>/g)];
    check(`/projects/${slug} 모든 img 에 alt`, noAlt.length === 0, noAlt[0]?.[0]);

    const md = await get(`/projects/${slug}.md`);
    const mdt = mdText(md.body);
    const mdMissing = want.filter((t) => !mdt.includes(t));
    check(`/projects/${slug}.md → 200, HTML 과 같은 핵심 문구`, md.status === 200 && mdMissing.length === 0, `${md.status} ${mdMissing.slice(0, 3).join(" | ")}`);
}

/* ---------- JSON / 크롤링 파일 ---------- */
{
    const r = await get("/projects.json");
    let data;
    try {
        data = JSON.parse(r.body);
    } catch {}
    check("GET /projects.json → 200 JSON", r.status === 200 && !!data, String(r.status));
    if (data) {
        const same = data.projects.length === projects.length &&
            data.projects.every((jp, i) => jp.slug === ssr.slugOf(projects[i]) && jp.title === projects[i].title && jp.description === projects[i].description);
        check("projects.json 내용 = 원본 데이터 (slug/title/description)", same);
    }

    const robots = await get("/robots.txt");
    check("GET /robots.txt → 200, Sitemap 지정, 전체 차단 없음",
        robots.status === 200 && robots.body.includes(`Sitemap: ${SITE.url}/sitemap.xml`) && !/^Disallow:\s*\/\s*$/m.test(robots.body),
        robots.body.slice(0, 120));

    const sm = await get("/sitemap.xml");
    const smMissing = projects.filter((p) => !sm.body.includes(`<loc>${SITE.url}/projects/${ssr.slugOf(p)}</loc>`));
    check("GET /sitemap.xml → 200, 모든 프로젝트 URL 포함", sm.status === 200 && smMissing.length === 0, smMissing.map((p) => p.id).join(","));

    const llms = await get("/llms.txt");
    const llmsMissing = projects.filter((p) => !llms.body.includes(`${SITE.url}/projects/${ssr.slugOf(p)}`));
    check("GET /llms.txt → 200, 모든 프로젝트 링크 포함", llms.status === 200 && llmsMissing.length === 0, llmsMissing.map((p) => p.id).join(","));
}

/* ---------- 상태 코드 ---------- */
for (const p of ["/projects/does-not-exist", "/no-such-page"]) {
    const r = await get(p);
    check(`GET ${p} → 404`, r.status === 404, String(r.status));
}
{
    const r = await get("/project?sec=unity&pj=ignotus");
    check("이전 주소 /project?sec=unity&pj=ignotus → 200 (브라우저에서 /projects/ignotus 로 이동), noindex",
        r.status === 200 && r.body.includes('content="noindex, follow"') && r.body.includes('href="/projects/ignotus"'), String(r.status));
    for (const pth of ["/repositories", "/downloads"]) {
        const x = await get(pth);
        check(`GET ${pth} → 200`, x.status === 200, String(x.status));
    }
}

/* ---------- 이미지 ---------- */
{
    const broken = [];
    for (const src of imgSrcs) {
        const res = await fetch(base + src, { method: "GET", headers: { "User-Agent": UA } });
        if (res.status !== 200 || !(res.headers.get("content-type") ?? "").startsWith("image/")) broken.push(`${src} (${res.status})`);
        await res.arrayBuffer();
    }
    check(`상세 페이지 이미지 ${imgSrcs.size}개 응답 200`, broken.length === 0, broken.join(", "));
}

console.log(log.join("\n"));
console.log(`\n${base}: ${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
