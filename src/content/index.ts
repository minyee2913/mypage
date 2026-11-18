import type {
    AchievementType,
    Category,
    CategoryId,
    ChallengeStatus,
    IntroStyle,
    LinkType,
    RevealStyle,
    MediaItem,
    Project,
    ProjectLink,
    ProjectStatus,
} from "./types";
import { ignotus } from "./projects/ignotus";
import { baldo } from "./projects/baldo";
import { luminous } from "./projects/luminous";
import {
    albedo,
    bumgeunRush,
    echo,
    escapeTheMusic,
    eucliwood,
    farmerHappyLife,
    isekaiButton,
    koroshite,
    survivalStrategy,
} from "./projects/unity";
import { blockBeat, valorant, videoParticle } from "./projects/minecraft";
import { goawayKnight } from "./projects/goawayKnight";
import { haneulOreum } from "./projects/haneulOreum";
import { iAmCup } from "./projects/iAmCup";
import { deliverHomez } from "./projects/deliverHomez";

export * from "./types";
export { SITE, absoluteUrl } from "./site";

/* ------------------------------------------------------------------ */
/* 데이터 등록: 새 프로젝트는 파일을 만들고 아래 배열에 추가한다.          */
/* 카테고리 안에서는 이 배열 순서대로(displayOrder 우선) 표시된다.        */
/* ------------------------------------------------------------------ */

export const CATEGORIES: Category[] = [
    { id: "unity", name: "게임 개발", icon: "/img/unity.png" },
    { id: "minecraft", name: "마인크래프트 개발", icon: "/img/minecraft.png" },
];

const ALL_PROJECTS: Project[] = [
    ignotus,
    baldo,
    goawayKnight,
    haneulOreum,
    iAmCup,
    survivalStrategy,
    albedo,
    koroshite,
    isekaiButton,
    deliverHomez,
    echo,
    bumgeunRush,
    escapeTheMusic,
    eucliwood,
    farmerHappyLife,
    luminous,
    valorant,
    videoParticle,
    blockBeat,
];

/* ------------------------------------------------------------------ */
/* 조회                                                                 */
/* ------------------------------------------------------------------ */

export const slugOf = (p: Project): string => p.slug ?? p.id;
export const projectPath = (p: Project): string => `/projects/${slugOf(p)}`;
export const PROJECTS_PATH = "/projects/";

function sortProjects(list: Project[]): Project[] {
    return list
        .map((p, i) => ({ p, i }))
        .sort((a, b) => (a.p.displayOrder ?? 1e9) - (b.p.displayOrder ?? 1e9) || a.i - b.i)
        .map(({ p }) => p);
}

/** 카테고리 순서 → 카테고리 내 순서로 정렬된 전체 목록 */
export const projects: Project[] = CATEGORIES.flatMap((c) =>
    sortProjects(ALL_PROJECTS.filter((p) => p.category === c.id)),
);

export function getCategory(id: CategoryId | string | null | undefined): Category | undefined {
    return CATEGORIES.find((c) => c.id === id);
}

export function getProjectsByCategory(id: CategoryId | string): Project[] {
    return projects.filter((p) => p.category === id);
}

export function getProjectBySlug(slug: string | undefined): Project | undefined {
    if (!slug) return undefined;
    const s = slug.toLowerCase();
    return projects.find((p) => slugOf(p) === s) ?? projects.find((p) => p.id === s);
}

/** 예전 slug(aliases)로 프로젝트 찾기 — 새 주소로 보내기 위해 쓴다 */
export function getProjectByAlias(slug: string | undefined): Project | undefined {
    if (!slug) return undefined;
    const s = slug.toLowerCase();
    return projects.find((p) => p.aliases?.includes(s));
}

export function getProjectById(id: string): Project | undefined {
    return projects.find((p) => p.id === id);
}

/** 메인 페이지 추천 카드 (카테고리 순서 → displayOrder) */
export function getFeaturedProjects(): Project[] {
    return projects.filter((p) => p.featured && getImages(p).length > 0);
}

/* ------------------------------------------------------------------ */
/* 표시용 헬퍼                                                          */
/* ------------------------------------------------------------------ */

export const STATUS_LABEL: Record<ProjectStatus, string> = {
    released: "출시",
    "in-development": "개발 중",
    completed: "개발 완료",
    paused: "개발 중단",
    prototype: "프로토타입",
};

export const STATUS_LABEL_EN: Record<ProjectStatus, string> = {
    released: "Released",
    "in-development": "In Development",
    completed: "Completed",
    paused: "Paused",
    prototype: "Prototype",
};

export const CHALLENGE_STATUS_LABEL: Record<ChallengeStatus, string> = {
    solved: "해결",
    partial: "부분 해결",
    unsolved: "미해결",
};

export const ACHIEVEMENT_LABEL: Record<AchievementType, string> = {
    release: "출시",
    award: "수상",
    selection: "선정",
    event: "출품",
    other: "기타",
};

export const LINK_LABEL: Record<LinkType, string> = {
    playstore: "Google Play",
    steam: "Steam",
    itch: "itch.io",
    discord: "Discord",
    github: "GitHub",
    youtube: "YouTube",
    playlist: "YouTube 재생목록",
    docs: "기획 / 문서",
    download: "다운로드",
    website: "웹사이트",
    other: "링크",
};

export const linkLabel = (l: ProjectLink): string => l.label ?? LINK_LABEL[l.type];

/** 기존 데이터의 "img/..." 같은 상대 경로도 사이트 루트 기준 절대 경로로 맞춘다 */
export function assetPath(src: string): string {
    if (/^(https?:)?\/\//.test(src) || src.startsWith("/")) return src;
    return "/" + src;
}

export function formatPeriod(p: Project): string | undefined {
    if (!p.startDate && !p.endDate) return undefined;
    const fmt = (d: string) => d.replace(/-/g, ".");
    if (p.startDate && p.endDate) return p.startDate === p.endDate ? fmt(p.startDate) : `${fmt(p.startDate)} ~ ${fmt(p.endDate)}`;
    if (p.startDate) return p.status === "in-development" ? `${fmt(p.startDate)} ~ 현재` : fmt(p.startDate);
    return `~ ${fmt(p.endDate!)}`;
}

/** releaseTarget 표기: "2027-H1" → "2027년 상반기 출시 예정" */
export function formatReleaseTarget(p: Project): string | undefined {
    const m = p.releaseTarget?.match(/^(\d{4})(?:-(H1|H2|\d{2}))?$/);
    if (!m) return undefined;
    const when = !m[2] ? `${m[1]}년` : m[2] === "H1" ? `${m[1]}년 상반기` : m[2] === "H2" ? `${m[1]}년 하반기` : `${m[1]}년 ${Number(m[2])}월`;
    return `${when} 출시 예정`;
}

/** 영문 표기: "2027-H1" → "2027 H1" */
export function formatReleaseTargetEn(p: Project): string | undefined {
    const m = p.releaseTarget?.match(/^(\d{4})(?:-(H1|H2|\d{2}))?$/);
    if (!m) return undefined;
    return m[2] ? `${m[1]} ${m[2]}` : m[1];
}

export function formatTeam(p: Project): string | undefined {
    if (p.teamSize === 1) return "1인 개발";
    const parts: string[] = [];
    if (p.teamSize) parts.push(`${p.teamSize}인 팀`);
    if (p.teamComposition) parts.push(parts.length ? `(${p.teamComposition})` : p.teamComposition);
    return parts.length ? parts.join(" ") : undefined;
}

export function extractYouTubeId(url: string): string | null {
    const m = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
}

export function getImages(p: Project): MediaItem[] {
    return (p.media ?? []).filter((m) => m.type === "image");
}

export function getLinks(p: Project, type: LinkType): ProjectLink[] {
    return (p.externalLinks ?? []).filter((l) => l.type === type);
}

export function getLink(p: Project, type: LinkType): string | undefined {
    return getLinks(p, type)[0]?.url;
}

/** 대표 이미지 (OG 이미지, 목록 썸네일) */
export function getCoverImage(p: Project): string | undefined {
    if (p.cover) return assetPath(p.cover);
    const img = getImages(p)[0];
    return img ? assetPath(img.src) : undefined;
}

/** 상세 페이지 상단 배경 이미지: hero → 첫 스크린샷 → YouTube 썸네일 */
export function getHeroImage(p: Project): string | undefined {
    if (p.hero) return assetPath(p.hero);
    const img = getImages(p)[0];
    if (img) return assetPath(img.src);
    const yt = (p.media ?? []).filter((m) => m.type === "youtube").map((m) => extractYouTubeId(m.src)).find(Boolean);
    return yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : undefined;
}

export const DEFAULT_ACCENT = "#f2c14e";

export function getRevealStyle(p: Project): RevealStyle {
    return p.reveal ?? (p.category === "minecraft" ? "blocks" : "pixels");
}

export function getIntroStyle(p: Project): IntroStyle {
    return p.intro ?? (p.category === "minecraft" ? "blocks" : "dust");
}

export function mediaAlt(p: Project, m: MediaItem, index: number): string {
    return m.alt ?? (m.caption ? `${p.title}: ${m.caption}` : `${p.title} 스크린샷 ${index + 1}`);
}

/** GitHub 저장소 (releases.json 생성과 다운로드 페이지에서 사용) */
export function getGithubRepo(p: Project): { owner: string; repo: string } | null {
    const gh = getLink(p, "github");
    if (gh) {
        const m = gh.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
        if (m) return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
    }
    const dl = getLink(p, "download");
    if (dl) {
        const m = dl.match(/github\.com\/([^/]+)\/([^/]+)\/releases\/download\//);
        if (m) return { owner: m[1], repo: m[2] };
    }
    return null;
}

/** 메타 description 용 요약 */
export function projectSummary(p: Project): string {
    return stripEmphasis(p.description ?? p.subtitle ?? p.title);
}

/** 데이터 문장 안의 **강조** 표시를 뺀 순수 텍스트 */
export function stripEmphasis(s: string): string {
    return s.replace(/\*\*(.+?)\*\*/g, "$1");
}
