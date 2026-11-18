import { getProjectBySlug, projectPath, projects, slugOf } from "./index";
import { validateProjects } from "./validate";
import { buildSitemap, projectToMarkdown } from "./export";
import { getRouteMeta } from "../seo/meta";
import type { Project } from "./types";

test("현재 프로젝트 데이터가 검사를 통과한다", () => {
    expect(validateProjects(projects)).toEqual([]);
});

test("잘못된 데이터는 검사에 걸린다", () => {
    const bad: Project[] = [
        { id: "a", category: "unity", title: "A", slug: "Bad Slug" },
        { id: "a", category: "unity", title: "B", startDate: "2025/01" },
        {
            id: "c",
            category: "unity",
            title: "C",
            externalLinks: [{ type: "github", url: "http://example.com" }],
            media: [{ type: "youtube", src: "https://example.com/not-a-video" }],
            technicalChallenges: [{ title: "t", status: "solved", problem: "p", remaining: "아직 남음" }],
        },
        { id: "d", category: "unity", title: "D", description: "ghp_" + "a".repeat(36) },
    ];
    const errors = validateProjects(bad).join("\n");
    expect(errors).toMatch(/slug "Bad Slug" 형식 오류/);
    expect(errors).toMatch(/\[a\] id 중복/);
    expect(errors).toMatch(/startDate "2025\/01" 형식 오류/);
    expect(errors).toMatch(/https URL 이 아님/);
    expect(errors).toMatch(/YouTube ID/);
    expect(errors).toMatch(/partial/);
    expect(errors).toMatch(/공개하면 안 되는 값/);
});

test("모든 프로젝트가 고유 URL, 메타데이터, Markdown, sitemap 항목을 가진다", () => {
    const sitemap = buildSitemap();
    for (const p of projects) {
        expect(getProjectBySlug(slugOf(p))).toBe(p);
        const meta = getRouteMeta(projectPath(p));
        expect(meta.status).toBe(200);
        expect(meta.canonical).toBe(`https://human.minyee2913.net/projects/${slugOf(p)}`);
        const md = projectToMarkdown(p);
        expect(md.startsWith(`# `)).toBe(true);
        for (const f of p.features ?? []) expect(md).toContain(f.name.replace(/([\\`*_[\]<>])/g, "\\$1"));
        expect(sitemap).toContain(`<loc>https://human.minyee2913.net/projects/${slugOf(p)}</loc>`);
    }
    expect(getRouteMeta("/projects/does-not-exist").status).toBe(404);
});
