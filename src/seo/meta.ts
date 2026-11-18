import {
    CATEGORIES,
    PROJECTS_PATH,
    SITE,
    STATUS_LABEL,
    absoluteUrl,
    getCategory,
    getCoverImage,
    getHeroImage,
    getLink,
    getLinks,
    getProjectByAlias,
    getProjectBySlug,
    getProjectsByCategory,
    projectPath,
    projectSummary,
    projects,
} from "../content";
import type { Project } from "../content";

export interface PageMeta {
    title: string;
    description: string;
    /** 절대 URL */
    canonical: string;
    /** 절대 URL */
    image: string;
    imageAlt: string;
    ogType: "website" | "article" | "profile";
    noindex?: boolean;
    /** 예전 주소: 이 경로로 즉시 이동 (meta refresh) */
    redirectTo?: string;
    status: 200 | 404;
    jsonLd: object[];
}

const PERSON_ID = `${SITE.url}/#person`;
const WEBSITE_ID = `${SITE.url}/#website`;

function person(): object {
    return {
        "@type": "Person",
        "@id": PERSON_ID,
        name: SITE.author.name,
        url: SITE.url + "/",
        jobTitle: SITE.author.jobTitle,
        description: SITE.author.about,
        knowsAbout: [...SITE.author.skills],
        sameAs: SITE.social.filter((s) => s.name !== "KakaoTalk Open Chat").map((s) => s.url),
    };
}

function website(): object {
    return {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE.url + "/",
        name: SITE.title,
        description: SITE.description,
        inLanguage: SITE.lang,
        author: { "@id": PERSON_ID },
    };
}

function breadcrumb(items: { name: string; path: string }[]): object {
    return {
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: it.name,
            item: absoluteUrl(it.path),
        })),
    };
}

function projectEntity(p: Project): object {
    const url = absoluteUrl(projectPath(p));
    const isGame = (p.kind ?? "game") === "game";
    const store = getLink(p, "playstore");
    const sameAs = (p.externalLinks ?? [])
        .filter((l) => ["steam", "itch", "playstore", "github", "docs"].includes(l.type))
        .map((l) => l.url);
    const awards = (p.achievements ?? []).filter((a) => a.type === "award").map((a) => a.title);
    const image = getCoverImage(p);
    const videos = getLinks(p, "youtube").map((l) => l.url);

    const entity: Record<string, unknown> = {
        "@type": isGame ? "VideoGame" : "SoftwareApplication",
        "@id": `${url}#project`,
        name: p.title,
        url,
        description: projectSummary(p),
        author: { "@id": PERSON_ID },
        applicationCategory: isGame ? "Game" : "MultimediaApplication",
    };
    if (p.subtitle) entity.alternativeHeadline = p.subtitle;
    if (image) entity.image = absoluteUrl(image);
    if (p.genres?.length) entity.genre = p.genres;
    if (p.platform) entity[isGame ? "gamePlatform" : "operatingSystem"] = p.platform;
    // 실제로 설치할 수 있는(출시된) 경우에만 설치 링크를 넣는다
    if (store && p.status === "released") {
        entity.operatingSystem = "Android";
        entity.installUrl = store;
    }
    if (p.startDate) entity.dateCreated = p.startDate;
    if (p.engine || p.languages?.length) {
        entity.keywords = [p.engine, ...(p.languages ?? []), ...(p.frameworks ?? [])].filter(Boolean).join(", ");
    }
    if (p.status) entity.creativeWorkStatus = STATUS_LABEL[p.status];
    if (awards.length) entity.award = awards;
    if (sameAs.length) entity.sameAs = sameAs;
    if (videos.length) entity.subjectOf = videos.map((v) => ({ "@type": "VideoObject", name: `${p.title} 영상`, url: v }));
    return entity;
}

function graph(...nodes: object[]): object[] {
    return [{ "@context": "https://schema.org", "@graph": nodes }];
}

const base = {
    image: absoluteUrl(SITE.defaultImage),
    imageAlt: "IGNOTUS 타이틀 화면",
};

export function getRouteMeta(pathname: string): PageMeta {
    const path = pathname.replace(/\/+$/, "") || "/";

    if (path === "/") {
        return {
            ...base,
            title: SITE.title,
            description: SITE.description,
            canonical: SITE.url + "/",
            ogType: "profile",
            status: 200,
            jsonLd: graph(website(), person(), {
                "@type": "ProfilePage",
                "@id": SITE.url + "/#webpage",
                url: SITE.url + "/",
                name: SITE.title,
                inLanguage: SITE.lang,
                isPartOf: { "@id": WEBSITE_ID },
                mainEntity: { "@id": PERSON_ID },
            }),
        };
    }

    if (path === "/projects" || path === "/project") {
        const url = absoluteUrl(PROJECTS_PATH);
        return {
            ...base,
            title: `Projects | ${SITE.name}`,
            description: `${SITE.name}의 게임·마인크래프트 프로젝트 ${projects.length}개 목록. ${CATEGORIES.map(
                (c) => `${c.name}: ${getProjectsByCategory(c.id)
                    .map((p) => p.title)
                    .join(", ")}`,
            ).join(" / ")}`.slice(0, 300),
            canonical: url,
            ogType: "website",
            noindex: path === "/project",
            status: 200,
            jsonLd: graph(
                {
                    "@type": "CollectionPage",
                    "@id": `${url}#webpage`,
                    url,
                    name: `Projects | ${SITE.name}`,
                    inLanguage: SITE.lang,
                    isPartOf: { "@id": WEBSITE_ID },
                    author: { "@id": PERSON_ID },
                    mainEntity: {
                        "@type": "ItemList",
                        numberOfItems: projects.length,
                        itemListElement: projects.map((p, i) => ({
                            "@type": "ListItem",
                            position: i + 1,
                            url: absoluteUrl(projectPath(p)),
                            name: p.title,
                        })),
                    },
                },
                breadcrumb([
                    { name: "Home", path: "/" },
                    { name: "Projects", path: PROJECTS_PATH },
                ]),
            ),
        };
    }

    const m = path.match(/^\/projects\/([^/]+)$/);
    if (m) {
        // 이름을 바꾼 프로젝트의 예전 주소: 새 페이지 내용 + canonical 은 새 주소 + 즉시 이동
        const renamed = getProjectByAlias(decodeURIComponent(m[1]));
        if (renamed) {
            const target = projectPath(renamed);
            return { ...getRouteMeta(target), noindex: true, redirectTo: target };
        }
        const p = getProjectBySlug(decodeURIComponent(m[1]));
        if (p) {
            const url = absoluteUrl(projectPath(p));
            // 공유 이미지는 큰 키아트(hero)가 있으면 그것을, 없으면 대표 스크린샷을 쓴다
            const cover = p.hero ? getHeroImage(p) : getCoverImage(p);
            const cat = getCategory(p.category);
            return {
                title: `${p.title}${p.subtitle ? ` - ${p.subtitle}` : ""} | ${SITE.name}`,
                description: projectSummary(p),
                canonical: url,
                image: cover ? absoluteUrl(cover) : base.image,
                imageAlt: cover ? `${p.title} 대표 이미지` : base.imageAlt,
                ogType: "article",
                status: 200,
                jsonLd: graph(
                    {
                        "@type": "WebPage",
                        "@id": `${url}#webpage`,
                        url,
                        name: p.title,
                        description: projectSummary(p),
                        inLanguage: SITE.lang,
                        isPartOf: { "@id": WEBSITE_ID },
                        author: { "@id": PERSON_ID },
                        about: { "@id": `${url}#project` },
                    },
                    projectEntity(p),
                    breadcrumb([
                        { name: "Home", path: "/" },
                        { name: cat ? `Projects (${cat.name})` : "Projects", path: PROJECTS_PATH },
                        { name: p.title, path: projectPath(p) },
                    ]),
                ),
            };
        }
    }

    if (path === "/repositories") {
        return {
            ...base,
            title: `Repositories | ${SITE.name}`,
            description: `${SITE.name}의 공개 GitHub 저장소 목록.`,
            canonical: absoluteUrl("/repositories"),
            ogType: "website",
            status: 200,
            jsonLd: graph(website(), person()),
        };
    }

    if (path === "/downloads") {
        return {
            ...base,
            title: `Downloads | ${SITE.name}`,
            description: `${SITE.name}의 프로젝트별 빌드 파일과 스토어 링크.`,
            canonical: absoluteUrl("/downloads"),
            ogType: "website",
            status: 200,
            jsonLd: graph(website(), person()),
        };
    }

    return {
        ...base,
        title: `404 PAGE NOT FOUND | ${SITE.name}`,
        description: "요청한 페이지를 찾을 수 없습니다.",
        canonical: absoluteUrl(pathname),
        ogType: "website",
        noindex: true,
        status: 404,
        jsonLd: [],
    };
}

/* ------------------------------------------------------------------ */
/* 직렬화 (프리렌더)                                                     */
/* ------------------------------------------------------------------ */

const escAttr = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** JSON-LD 안에서 </script> 가 끊기지 않도록 이스케이프 */
export const jsonForScript = (data: unknown) =>
    JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");

export function renderHeadTags(meta: PageMeta): string {
    const t = escAttr(meta.title);
    const d = escAttr(meta.description);
    const tags = [
        `<title>${t}</title>`,
        `<meta name="description" content="${d}">`,
        `<link rel="canonical" href="${escAttr(meta.canonical)}">`,
        meta.noindex ? `<meta name="robots" content="noindex, follow">` : "",
        meta.redirectTo ? `<meta http-equiv="refresh" content="0; url=${escAttr(meta.redirectTo)}">` : "",
        `<meta property="og:site_name" content="${escAttr(SITE.name)}">`,
        `<meta property="og:locale" content="${SITE.locale}">`,
        `<meta property="og:type" content="${meta.ogType}">`,
        `<meta property="og:title" content="${t}">`,
        `<meta property="og:description" content="${d}">`,
        `<meta property="og:url" content="${escAttr(meta.canonical)}">`,
        `<meta property="og:image" content="${escAttr(meta.image)}">`,
        `<meta property="og:image:alt" content="${escAttr(meta.imageAlt)}">`,
        `<meta name="twitter:card" content="summary_large_image">`,
        `<meta name="twitter:title" content="${t}">`,
        `<meta name="twitter:description" content="${d}">`,
        `<meta name="twitter:image" content="${escAttr(meta.image)}">`,
        `<link rel="alternate" type="application/json" href="/projects.json" title="Projects (JSON)">`,
        `<link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt">`,
        ...meta.jsonLd.map((j) => `<script type="application/ld+json">${jsonForScript(j)}</script>`),
    ];
    return tags.filter(Boolean).join("");
}

/* ------------------------------------------------------------------ */
/* 클라이언트 라우팅 시 head 갱신                                          */
/* ------------------------------------------------------------------ */

function upsert(selector: string, create: () => HTMLElement, attr: string, value: string) {
    let el = document.head.querySelector(selector) as HTMLElement | null;
    if (!el) {
        el = create();
        document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
}

export function applyMeta(meta: PageMeta) {
    if (typeof document === "undefined") return;
    document.title = meta.title;
    const metaTag = (key: "name" | "property", name: string) => () => {
        const el = document.createElement("meta");
        el.setAttribute(key, name);
        return el;
    };
    upsert('meta[name="description"]', metaTag("name", "description"), "content", meta.description);
    upsert('meta[property="og:title"]', metaTag("property", "og:title"), "content", meta.title);
    upsert('meta[property="og:description"]', metaTag("property", "og:description"), "content", meta.description);
    upsert('meta[property="og:url"]', metaTag("property", "og:url"), "content", meta.canonical);
    upsert('meta[property="og:image"]', metaTag("property", "og:image"), "content", meta.image);
    upsert(
        'link[rel="canonical"]',
        () => {
            const el = document.createElement("link");
            el.setAttribute("rel", "canonical");
            return el;
        },
        "href",
        meta.canonical,
    );
    document.head.querySelectorAll('script[type="application/ld+json"]').forEach((el) => el.remove());
    for (const j of meta.jsonLd) {
        const s = document.createElement("script");
        s.type = "application/ld+json";
        s.text = JSON.stringify(j);
        document.head.appendChild(s);
    }
}
