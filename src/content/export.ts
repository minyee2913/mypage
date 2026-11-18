/**
 * 기계가 읽기 쉬운 공개 문서 생성기. 프리렌더 단계에서 호출된다.
 * HTML 과 같은 데이터(src/content)에서 만들어지므로 내용이 항상 일치한다.
 */
import {
    ACHIEVEMENT_LABEL,
    CATEGORIES,
    CHALLENGE_STATUS_LABEL,
    PROJECTS_PATH,
    SITE,
    STATUS_LABEL,
    absoluteUrl,
    assetPath,
    formatPeriod,
    formatReleaseTarget,
    formatTeam,
    getProjectsByCategory,
    getCategory,
    linkLabel,
    projectPath,
    projectSummary,
    projects,
    slugOf,
} from "./index";
import type { MediaItem, Project } from "./types";

const mdEscapeRaw = (s: string) => s.replace(/([\\`*_[\]<>])/g, "\\$1");
/** 마크다운 특수문자를 이스케이프하되, 데이터의 **강조** 표시는 마크다운 굵은 글씨로 살린다 */
const mdEscape = (s: string) =>
    s
        .split(/\*\*(.+?)\*\*/g)
        .map((part, i) => (i % 2 === 1 ? `**${mdEscapeRaw(part)}**` : mdEscapeRaw(part)))
        .join("");
const list = (items: string[] | undefined, indent = "") => (items ?? []).map((i) => `${indent}- ${mdEscape(i)}`).join("\n");

function mediaUrl(m: MediaItem): string {
    return m.type === "youtube" ? m.src : absoluteUrl(assetPath(m.src));
}

export const markdownPath = (p: Project) => `/projects/${slugOf(p)}.md`;

export function projectToMarkdown(p: Project): string {
    const out: string[] = [];
    const push = (...lines: string[]) => out.push(...lines);

    push(`# ${mdEscape(p.title)}`, "");
    if (p.tagline) push(`> ${mdEscape(p.tagline)}`, "");
    if (p.subtitle) push(`> ${mdEscape(p.subtitle)}`, "");
    if (p.description) push(mdEscape(p.description), "");
    push(`- 페이지: ${absoluteUrl(projectPath(p))}`, `- 카테고리: ${getCategory(p.category)?.name ?? p.category}`);

    const info: [string, string | undefined][] = [
        ["개발 기간", formatPeriod(p)],
        ["개발 상태", p.status ? STATUS_LABEL[p.status] : undefined],
        ["출시 일정", formatReleaseTarget(p)],
        ["플랫폼", p.platform],
        ["장르", p.genres?.join(", ")],
        ["팀 구성", formatTeam(p)],
        ["담당 역할", p.roles?.join(", ")],
        ["기여도", p.contribution],
        ["게임 엔진", p.engine],
        ["사용 언어", p.languages?.join(", ")],
        ["프레임워크 / 라이브러리", p.frameworks?.join(", ")],
        ["주요 기술", p.technologies?.join(", ")],
    ];
    for (const [k, v] of info) if (v) push(`- ${k}: ${mdEscape(v)}`);
    push("");

    if (p.overview?.length) push("## 프로젝트 소개", "", ...p.overview.map((o) => mdEscape(o) + "\n"));
    if (p.highlights?.length) push("### 주요 특징", "", ...p.highlights.map((h) => `- ${mdEscape(h)}`), "");
    if (p.gameplay?.length) push("## 게임 플레이", "", list(p.gameplay), "");
    if (p.history?.length) push("## 개발 연혁", "", ...p.history.map((h) => `- ${h.date}: ${mdEscape(h.text)}`), "");
    if (p.architecture?.length) push("## 설계 / 패턴", "", list(p.architecture), "");

    if (p.features?.length) {
        push("## 핵심 구현 기능", "");
        for (const f of p.features) {
            push(`### ${mdEscape(f.name)}`, "");
            if (f.summary) push(mdEscape(f.summary), "");
            if (f.purpose) push(`**구현 목적**: ${mdEscape(f.purpose)}`, "");
            if (f.how?.length) push("**동작 방식**", "", list(f.how), "");
            if (f.architecture?.length) push("**구조**", "", list(f.architecture), "");
            if (f.technologies?.length) push(`**사용 기술**: ${f.technologies.map(mdEscape).join(", ")}`, "");
            if (f.code) {
                if (f.code.caption) push(`*${mdEscape(f.code.caption)}*`, "");
                push("```" + f.code.language, f.code.code, "```", "");
            }
            if (f.considerations?.length) push("**고려 사항**", "", list(f.considerations), "");
            if (f.links?.length) push(...f.links.map((l) => `- [${mdEscape(linkLabel(l))}](${l.url})`), "");
            if (f.media?.length)
                push(...f.media.map((m) => `- ${m.type === "image" ? "이미지" : "영상"}: ${mediaUrl(m)}${m.caption ? ` (${mdEscape(m.caption)})` : ""}`), "");
        }
    }

    if (p.technicalChallenges?.length) {
        push("## 기술적 문제 해결", "");
        for (const c of p.technicalChallenges) {
            push(`### ${mdEscape(c.title)} [${CHALLENGE_STATUS_LABEL[c.status]}]`, "");
            push(`- 문제 상황: ${mdEscape(c.problem)}`);
            if (c.cause) push(`- 원인 분석: ${mdEscape(c.cause)}`);
            if (c.process?.length) push("- 해결 과정:", list(c.process, "  "));
            if (c.approach?.length) push(`- 적용한 기술 / 접근: ${c.approach.map(mdEscape).join(", ")}`);
            if (c.result) push(`- 결과: ${mdEscape(c.result)}`);
            if (c.remaining) push(`- 남은 문제: ${mdEscape(c.remaining)}`);
            if (c.metrics?.length) {
                push("", "| 항목 | 개선 전 | 개선 후 |", "| --- | --- | --- |");
                push(...c.metrics.map((mt) => `| ${mdEscape(mt.label)} | ${mdEscape(mt.before)} | ${mdEscape(mt.after)} |`));
            }
            push("");
        }
    }

    if (p.achievements?.length) {
        push("## 개발 결과 및 성과", "");
        for (const a of p.achievements) {
            const parts = [`[${ACHIEVEMENT_LABEL[a.type]}] ${mdEscape(a.title)}`];
            if (a.date) parts.push(`(${a.date})`);
            if (a.description) parts.push(`- ${mdEscape(a.description)}`);
            if (a.url) parts.push(`<${a.url}>`);
            push(`- ${parts.join(" ")}`);
        }
        push("");
    }

    if (p.externalLinks?.length) {
        push("## 링크", "", ...p.externalLinks.map((l) => `- [${mdEscape(linkLabel(l))}](${l.url})`), "");
    }
    if (p.media?.length) {
        push("## 미디어", "");
        push(...p.media.map((m) => `- ${m.type === "image" ? "이미지" : "영상"}: ${mediaUrl(m)}${m.caption ? ` (${mdEscape(m.caption)})` : ""}`), "");
    }

    return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

/** /projects.json — 공개 데이터 그대로 + 절대 URL */
export function buildProjectsJson(): object {
    return {
        site: SITE.url + "/",
        author: SITE.author.name,
        description: SITE.description,
        source: "Generated at build time from the same data that renders the HTML pages.",
        categories: CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
        projects: projects.map((p) => ({
            ...p,
            slug: slugOf(p),
            url: absoluteUrl(projectPath(p)),
            markdown: absoluteUrl(markdownPath(p)),
            period: formatPeriod(p),
            statusLabel: p.status ? STATUS_LABEL[p.status] : undefined,
            releaseTargetLabel: formatReleaseTarget(p),
            media: p.media?.map((m) => ({ ...m, src: mediaUrl(m) })),
            features: p.features?.map((f) => ({ ...f, media: f.media?.map((m) => ({ ...m, src: mediaUrl(m) })) })),
        })),
    };
}

export function buildLlmsTxt(): string {
    const lines: string[] = [];
    lines.push(`# ${SITE.name} — Game Developer Portfolio`, "");
    lines.push(`> ${SITE.description}`, "");
    lines.push(
        "이 사이트는 게임 개발자 minyee2913의 포트폴리오입니다. 모든 페이지는 JavaScript 없이도 HTML 본문에 내용이 포함되도록 정적으로 생성됩니다.",
        "",
        "## 개발자",
        "",
        `- 소개: ${SITE.author.about}`,
        `- 주요 기술: ${SITE.author.skills.join(", ")}`,
        ...SITE.social.map((s) => `- ${s.name}: ${s.url}`),
        "",
        "## 대표 프로젝트",
        "",
    );
    for (const p of projects.filter((x) => x.featured)) {
        const tech = [p.engine, ...(p.languages ?? [])].filter(Boolean).join(", ");
        const meta = [p.platform, p.status ? STATUS_LABEL[p.status] : undefined, formatReleaseTarget(p), tech].filter(Boolean).join(" · ");
        lines.push(`- [${p.title}](${absoluteUrl(projectPath(p))}): ${projectSummary(p)} (${meta}) — Markdown: ${absoluteUrl(markdownPath(p))}`);
    }
    for (const c of CATEGORIES) {
        lines.push("", `## ${c.name}`, "");
        for (const p of getProjectsByCategory(c.id)) {
            lines.push(`- [${p.title}](${absoluteUrl(projectPath(p))}): ${projectSummary(p)}`);
        }
    }
    lines.push(
        "",
        "## 기계가 읽기 쉬운 자료",
        "",
        `- [전체 프로젝트 JSON](${absoluteUrl("/projects.json")}): 화면과 같은 원본 데이터`,
        `- 프로젝트별 Markdown: ${absoluteUrl("/projects/<slug>.md")} (예: ${absoluteUrl(markdownPath(projects[0]))})`,
        `- [프로젝트 목록 페이지](${absoluteUrl(PROJECTS_PATH)})`,
        `- [사이트맵](${absoluteUrl("/sitemap.xml")})`,
        "",
    );
    return lines.join("\n");
}

export function buildSitemap(): string {
    const urls = ["/", PROJECTS_PATH, ...projects.map(projectPath), "/downloads", "/repositories"];
    const body = urls.map((u) => `  <url><loc>${absoluteUrl(u)}</loc></url>`).join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
