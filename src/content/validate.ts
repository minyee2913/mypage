import type { MediaItem, Project, ProjectLink } from "./types";
import { CATEGORIES, extractYouTubeId, slugOf } from "./index";

const STATUSES = ["released", "in-development", "completed", "paused", "prototype"];
const CHALLENGE_STATUSES = ["solved", "partial", "unsolved"];
const ACHIEVEMENT_TYPES = ["release", "award", "selection", "event", "other"];
const LINK_TYPES = ["playstore", "steam", "itch", "discord", "github", "youtube", "playlist", "docs", "download", "website", "other"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RELEASE_TARGET_RE = /^\d{4}(-(H1|H2|0[1-9]|1[0-2]))?$/;
const DATE_RE = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;

/** 공개되면 안 되는 값이 섞여 들어갔는지 확인하는 패턴 */
export const SECRET_PATTERNS: RegExp[] = [
    /ghp_[A-Za-z0-9]{20,}/,
    /github_pat_[A-Za-z0-9_]{20,}/,
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /AIza[0-9A-Za-z_-]{35}/,
    /[A-Za-z]:\\(Users|projects)\\/i,
];

/**
 * 프로젝트 데이터 검사. 문제 목록을 돌려준다(비어 있으면 통과).
 * fileExists 를 넘기면 로컬 이미지 경로가 실제로 있는지도 확인한다.
 */
export function validateProjects(list: Project[], fileExists?: (publicPath: string) => boolean): string[] {
    const errors: string[] = [];
    const ids = new Set<string>();
    const slugs = new Set<string>();

    const checkUrl = (where: string, url: string) => {
        if (!/^https:\/\/[^\s]+$/.test(url)) errors.push(`${where}: https URL 이 아님 (${url})`);
    };
    const checkLink = (where: string, l: ProjectLink) => {
        if (!LINK_TYPES.includes(l.type)) errors.push(`${where}: 알 수 없는 링크 type "${l.type}"`);
        checkUrl(where, l.url);
    };
    const checkMedia = (where: string, m: MediaItem) => {
        if (m.type === "youtube") {
            if (!extractYouTubeId(m.src)) errors.push(`${where}: YouTube ID 를 찾을 수 없음 (${m.src})`);
            return;
        }
        if (/^https?:\/\//.test(m.src)) return checkUrl(where, m.src);
        if (!m.src.startsWith("/")) errors.push(`${where}: 로컬 경로는 "/" 로 시작해야 함 (${m.src})`);
        if (fileExists && !fileExists(m.src)) errors.push(`${where}: public${m.src} 파일이 없음`);
    };

    for (const p of list) {
        const at = `[${p.id || "?"}]`;
        if (!p.id) errors.push(`${at} id 없음`);
        if (!p.title?.trim()) errors.push(`${at} title 없음`);
        if (!CATEGORIES.some((c) => c.id === p.category)) errors.push(`${at} 알 수 없는 category "${p.category}"`);

        const slug = slugOf(p);
        if (!SLUG_RE.test(slug)) errors.push(`${at} slug "${slug}" 형식 오류 (소문자, 숫자, 하이픈)`);
        if (ids.has(p.id)) errors.push(`${at} id 중복`);
        if (slugs.has(slug)) errors.push(`${at} slug "${slug}" 중복`);
        for (const a of p.aliases ?? []) {
            if (!SLUG_RE.test(a)) errors.push(`${at} alias "${a}" 형식 오류`);
            if (list.some((q) => (q.slug ?? q.id) === a || q.id === a)) errors.push(`${at} alias "${a}" 가 다른 프로젝트 주소와 겹침`);
        }
        ids.add(p.id);
        slugs.add(slug);

        if (p.status && !STATUSES.includes(p.status)) errors.push(`${at} 알 수 없는 status "${p.status}"`);
        for (const k of ["startDate", "endDate"] as const) {
            const v = p[k];
            if (v && !DATE_RE.test(v)) errors.push(`${at} ${k} "${v}" 형식 오류 (YYYY, YYYY-MM, YYYY-MM-DD)`);
        }
        if (p.startDate && p.endDate && p.startDate > p.endDate) errors.push(`${at} startDate 가 endDate 보다 늦음`);
        for (const k of ["hero", "cover", "logo"] as const) {
            const v = p[k];
            if (v && !v.startsWith("/img/")) errors.push(`${at} ${k} 는 /img/ 아래 로컬 이미지여야 함`);
            else if (v && fileExists && !fileExists(v)) errors.push(`${at} ${k}: public${v} 파일이 없음`);
        }
        p.history?.forEach((h, i) => {
            if (!/^\d{4}(-(0[1-9]|1[0-2]))?$/.test(h.date)) errors.push(`${at} history[${i}].date "${h.date}" 형식 오류 (YYYY, YYYY-MM)`);
            if (!h.text.trim()) errors.push(`${at} history[${i}].text 비어 있음`);
        });
        if (p.intro && !["embers", "slash", "magic", "stars", "steam", "motes", "blocks", "dust", "notes", "wind", "smog", "speed"].includes(p.intro))
            errors.push(`${at} 알 수 없는 intro "${p.intro}"`);
        if (p.reveal && !["burn", "slash", "cards", "warp", "drain", "light", "blocks", "pixels", "toss", "clock", "shatter", "scan", "portal", "ripple", "dash", "beat", "purify"].includes(p.reveal))
            errors.push(`${at} 알 수 없는 reveal "${p.reveal}"`);
        if (p.accent && !/^#[0-9a-fA-F]{6}$/.test(p.accent)) errors.push(`${at} accent "${p.accent}" 형식 오류 (#rrggbb)`);
        if (p.releaseTarget) {
            if (!RELEASE_TARGET_RE.test(p.releaseTarget))
                errors.push(`${at} releaseTarget "${p.releaseTarget}" 형식 오류 (YYYY, YYYY-H1, YYYY-H2, YYYY-MM)`);
            if (p.status === "released") errors.push(`${at} 출시된 프로젝트(status: released)에 releaseTarget 이 있음`);
        }
        if (p.teamSize !== undefined && (!Number.isInteger(p.teamSize) || p.teamSize < 1))
            errors.push(`${at} teamSize 는 1 이상의 정수`);

        p.externalLinks?.forEach((l, i) => checkLink(`${at} externalLinks[${i}]`, l));
        p.media?.forEach((m, i) => checkMedia(`${at} media[${i}]`, m));

        p.features?.forEach((f, i) => {
            const w = `${at} features[${i}]`;
            if (!f.name?.trim()) errors.push(`${w} name 없음`);
            f.links?.forEach((l, j) => checkLink(`${w}.links[${j}]`, l));
            f.media?.forEach((m, j) => checkMedia(`${w}.media[${j}]`, m));
        });

        p.technicalChallenges?.forEach((c, i) => {
            const w = `${at} technicalChallenges[${i}]`;
            if (!c.title?.trim()) errors.push(`${w} title 없음`);
            if (!c.problem?.trim()) errors.push(`${w} problem(문제 상황) 없음`);
            if (!CHALLENGE_STATUSES.includes(c.status)) errors.push(`${w} 알 수 없는 status "${c.status}"`);
            if (c.status === "solved" && c.remaining)
                errors.push(`${w} 남은 문제가 있으면 status 를 "partial" 로 적어야 함`);
            if (c.status !== "solved" && !c.remaining && !c.result)
                errors.push(`${w} 미해결/부분 해결이면 remaining 또는 result 로 현재 상태를 적어야 함`);
        });

        p.achievements?.forEach((a, i) => {
            const w = `${at} achievements[${i}]`;
            if (!ACHIEVEMENT_TYPES.includes(a.type)) errors.push(`${w} 알 수 없는 type "${a.type}"`);
            if (!a.title?.trim()) errors.push(`${w} title 없음`);
            if (a.date && !DATE_RE.test(a.date)) errors.push(`${w} date 형식 오류`);
            if (a.url) checkUrl(w, a.url);
        });

        // **강조** 표시가 짝이 맞는지
        const walk = (v: unknown, where: string): void => {
            if (typeof v === "string") {
                if ((v.match(/\*\*/g) ?? []).length % 2 === 1) errors.push(`${at} ${where}: 강조 표시(**)의 짝이 맞지 않음`);
            } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`));
            else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => walk(x, where ? `${where}.${k}` : k));
        };
        walk(p, "");

        const serialized = JSON.stringify(p);
        for (const re of SECRET_PATTERNS) {
            if (re.test(serialized)) errors.push(`${at} 공개하면 안 되는 값으로 보이는 문자열이 있음 (${re})`);
        }
    }
    return errors;
}
