import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import Modal from "react-modal";
import { CopyToClipboard } from "react-copy-to-clipboard";
import "./style.css";
import "./details.css";
import "./page.css";

import {
    CATEGORIES,
    DEFAULT_ACCENT,
    PROJECTS_PATH,
    SITE,
    STATUS_LABEL,
    assetPath,
    extractYouTubeId,
    formatPeriod,
    formatReleaseTarget,
    getCategory,
    getCoverImage,
    getHeroImage,
    getImages,
    getIntroStyle,
    getRevealStyle,
    getLink,
    getLinks,
    getProjectByAlias,
    getProjectBySlug,
    getProjectsByCategory,
    projectPath,
    projectSummary,
} from "../content";
import type { CategoryId, Project } from "../content";
import MediaSlider from "./MediaSlider";
import ProjectSections from "./sections";
import { TooltipLayer } from "./tooltip";
import IntroFx from "./introFx";
import RevealFx from "./revealFx";
import Error404 from "../404";

interface ReleaseAsset {
    id: number;
    name: string;
    size: number;
    browser_download_url: string;
}

interface Release {
    tag_name: string;
    published_at: string;
    assets: ReleaseAsset[];
    html_url: string;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* 공통 상단 바 (기존 카테고리 바)                                         */
/* ------------------------------------------------------------------ */

function CategoryBar({ active, listActive }: { active?: CategoryId; listActive?: boolean }) {
    return (
        <nav className="category pj-topbar" aria-label="프로젝트 카테고리">
            <Link to="/" className="back-home-btn pointer">
                {"<"} Main
            </Link>
            {CATEGORIES.map((c) => {
                const first = getProjectsByCategory(c.id)[0];
                return (
                    <Link
                        key={c.id}
                        to={first ? projectPath(first) : PROJECTS_PATH}
                        className="category-item pointer"
                        id={"category-" + c.id}
                        aria-label={c.name}
                        aria-current={active === c.id ? "page" : undefined}
                    >
                        <img src={c.icon} alt="" />
                        <span className="pj-topbar-label">{c.name}</span>
                        {active === c.id && <div className="category-selected" />}
                    </Link>
                );
            })}
            <Link to={PROJECTS_PATH} className="list-btn pointer" aria-current={listActive ? "page" : undefined}>
                List
            </Link>
        </nav>
    );
}

/* ------------------------------------------------------------------ */
/* /projects/ 목록                                                       */
/* ------------------------------------------------------------------ */

export function ProjectsIndex() {
    return (
        <>
            <CategoryBar listActive />
            <div style={{ textAlign: "center" }}>
                <main className="project_sec">
                    <div className="project-scroll pj-list-scroll">
                        <header className="pj-header">
                            <h1 className="title">PROJECTS</h1>
                            <p className="platform">
                                {SITE.name} · {SITE.author.jobTitle}
                            </p>
                        </header>
                        {CATEGORIES.map((c) => (
                            <section key={c.id} className="pj-list-section" aria-labelledby={`cat-${c.id}`}>
                                <h2 className="pj-h2" id={`cat-${c.id}`}>
                                    <img src={c.icon} alt="" className="pj-list-icon" /> {c.name}
                                </h2>
                                <ul className="pj-list">
                                    {getProjectsByCategory(c.id).map((p) => (
                                        <li key={p.id}>
                                            <ProjectCard project={p} />
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}

function ProjectCard({ project: p }: { project: Project }) {
    const ytId = (p.media ?? []).filter((m) => m.type === "youtube").map((m) => extractYouTubeId(m.src)).find(Boolean);
    // 스크린샷이 없으면 YouTube 영상 썸네일 사용
    const cover = getCoverImage(p) ?? (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : undefined);
    const contain = getImages(p)[0]?.fit === "contain";
    const meta = [p.platform, formatPeriod(p), p.status ? STATUS_LABEL[p.status] : undefined].filter(Boolean).join(" · ");
    return (
        <article className="pj-card">
            <Link to={projectPath(p)} className="pj-card-link">
                <div className={`pj-card-thumb${cover ? "" : " empty"}`}>
                    {cover ? (
                        <img src={cover} alt="" loading="lazy" className={contain ? "contain" : undefined} />
                    ) : (
                        <span aria-hidden="true">NO IMAGE</span>
                    )}
                </div>
                <div className="pj-card-body">
                    <h3 className="pj-card-title">{p.title}</h3>
                    {meta && <p className="pj-card-meta">{meta}</p>}
                    <p className="pj-card-desc">{projectSummary(p)}</p>
                </div>
            </Link>
        </article>
    );
}

/* ------------------------------------------------------------------ */
/* /projects/:slug 상세 — 게임 공식 사이트처럼: 키아트 배경 + 타이틀/CTA + 상세 탭  */
/* ------------------------------------------------------------------ */

interface Cta {
    href: string;
    label: string;
    icon?: string;
    primary?: boolean;
}

function buildCtas(pj: Project, hideDownload: boolean): Cta[] {
    const released = pj.status === "released";
    const ctas: Cta[] = [];
    const steam = getLink(pj, "steam");
    const itch = getLink(pj, "itch");
    const playstore = getLink(pj, "playstore");
    const download = getLink(pj, "download");
    const discord = getLink(pj, "discord");
    const youtube = getLink(pj, "youtube");
    const docs = getLink(pj, "docs");
    const github = getLink(pj, "github");
    if (itch) ctas.push({ href: itch, label: "itch.io에서 플레이", icon: "/img/itch.png" });
    if (steam) ctas.push({ href: steam, label: released ? "Steam" : "Steam 위시리스트", icon: "/img/steam.png" });
    if (playstore) ctas.push({ href: playstore, label: "Google Play", icon: "/img/playstore.png" });
    if (download && !hideDownload) ctas.push({ href: download, label: "다운로드", icon: "/img/download.png" });
    if (youtube) {
        // 링크 라벨에 '트레일러'가 있으면 트레일러, 아니면 플레이 영상으로 짧게 표시
        const label = getLinks(pj, "youtube")[0]?.label ?? "";
        ctas.push({ href: youtube, label: label.includes("트레일러") ? "트레일러" : label.includes("소개") ? "소개 영상" : "플레이 영상", icon: "/img/youtube.png" });
    }
    if (discord) ctas.push({ href: discord, label: "Discord", icon: "/img/discord.png" });
    if (docs) ctas.push({ href: docs, label: "기획 문서", icon: "/img/docs.png" });
    if (github) ctas.push({ href: github, label: "GitHub", icon: "/img/github.png" });
    if (ctas[0]) ctas[0].primary = true;
    return ctas;
}

function ProjectDetail({ pj, onImageClick }: { pj: Project; onImageClick: (src: string, alt: string) => void }) {
    const [release, setRelease] = useState<Release | null>(null);
    const github = getLink(pj, "github");

    useEffect(() => {
        if (!github) {
            setRelease(null);
            return;
        }
        fetch("/releases.json")
            .then((r) => (r.ok ? r.json() : {}))
            .then((map: Record<string, Release>) => setRelease(map[pj.id] ?? null))
            .catch(() => setRelease(null));
    }, [pj.id, github]);

    const siblings = getProjectsByCategory(pj.category);
    const pos = siblings.indexOf(pj);
    const prev = pos > 0 ? siblings[pos - 1] : undefined;
    const next = pos + 1 < siblings.length ? siblings[pos + 1] : undefined;

    const hasReleaseAssets = !!release && release.assets.length > 0;
    const ctas = buildCtas(pj, hasReleaseAssets);
    const hero = getHeroImage(pj);
    // 세로 스크린샷·저해상도 썸네일은 잘라 쓰면 어색하므로 흐리게 깔아 분위기만 낸다
    const heroBlur = !pj.hero && (getImages(pj)[0]?.fit === "contain" || !getImages(pj)[0]);
    const release_ = formatReleaseTarget(pj);
    const badges = [pj.status ? STATUS_LABEL[pj.status] : undefined, release_, pj.platform].filter(Boolean) as string[];
    const style = { "--pj-accent": pj.accent ?? DEFAULT_ACCENT } as CSSProperties;

    return (
        <article className="pj-page" style={style} data-intro={getIntroStyle(pj)}>
            {hero && (
                <div className={`pj-hero-bg${heroBlur ? " blur" : ""}`} aria-hidden="true">
                    <img src={hero} alt="" />
                </div>
            )}

            <IntroFx style={getIntroStyle(pj)} accent={pj.accent ?? DEFAULT_ACCENT} />
            <RevealFx style={getRevealStyle(pj)} accent={pj.accent ?? DEFAULT_ACCENT} />

            <div className="pj-page-grid">
                <div className="pj-col-main">
                    <header className="pj-hero">
                        <h1 className={`pj-title${pj.logo ? " has-logo" : ""}`}>
                            {pj.logo ? (
                                <>
                                    <img className="pj-logo" src={assetPath(pj.logo)} alt="" />
                                    <span className="sr-only">{pj.title}</span>
                                </>
                            ) : (
                                pj.title
                            )}
                        </h1>
                        {pj.tagline && <p className="pj-tagline">{pj.tagline}</p>}
                        {pj.subtitle && <p className="pj-subtitle">{pj.subtitle}</p>}
                        <div className="pj-badges-row">
                            {badges.length > 0 && (
                                <ul className="pj-badges" aria-label="프로젝트 상태">
                                    {badges.map((b, i) => (
                                        <li key={b} className={i === 0 ? "strong" : undefined}>
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <CopyToClipboard text={SITE.url + projectPath(pj)} onCopy={() => alert("클립보드에 복사되었습니다.")}>
                                <button type="button" className="pj-share pointer" aria-label="이 페이지 링크 복사" title="링크 복사">
                                    <img src="/img/import.png" alt="" />
                                </button>
                            </CopyToClipboard>
                        </div>

                        <div className="pj-cta">
                            {ctas.map((c) => (
                                <a
                                    key={c.href + c.label}
                                    href={c.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`pj-cta-btn${c.primary ? " primary" : ""}`}
                                >
                                    {c.icon && <img src={c.icon} alt="" />}
                                    {c.label}
                                </a>
                            ))}
                        </div>

                        {hasReleaseAssets && (
                            <div className="pj-release">
                                <p className="pj-release-meta">
                                    {release!.tag_name} · {formatDate(release!.published_at)}
                                </p>
                                <div className="pj-release-assets">
                                    {release!.assets.map((asset) => (
                                        <a key={asset.id} href={asset.browser_download_url} className="pj-asset-btn" target="_blank" rel="noreferrer">
                                            <span className="pj-asset-name">{asset.name}</span>
                                            <span className="pj-asset-size">{formatBytes(asset.size)}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </header>

                    {(pj.media?.length ?? 0) > 0 && (
                        <div className="pj-gallery">
                            <MediaSlider key={pj.id} project={pj} media={pj.media ?? []} onImageClick={onImageClick} />
                        </div>
                    )}

                    <nav className="project-arrows" aria-label="같은 카테고리의 다른 프로젝트">
                        {prev && (
                            <Link to={projectPath(prev)} className="pj-nav-link" aria-label={`이전 프로젝트: ${prev.title}`} title={prev.title}>
                                <img src="/img/up_arrow.png" className="pj-nav-arrow pointer" alt="" />
                            </Link>
                        )}
                        {next && (
                            <Link to={projectPath(next)} className="pj-nav-link" aria-label={`다음 프로젝트: ${next.title}`} title={next.title}>
                                <img src="/img/down_arrow.png" className="pj-nav-arrow pointer" alt="" />
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="pj-col-detail">
                    <div className="pj-panel">
                        <ProjectSections project={pj} />
                    </div>
                </div>
            </div>
        </article>
    );
}

export function ProjectPage() {
    const { slug } = useParams();
    const [modal, setModal] = useState<{ src: string; alt: string } | null>(null);
    const project = getProjectBySlug(slug);

    if (!project) {
        // 이름을 바꾼 프로젝트의 예전 주소는 새 주소로 보낸다
        const renamed = getProjectByAlias(slug);
        return renamed ? <Navigate replace to={projectPath(renamed)} /> : <Error404 />;
    }

    return (
        <div className="pj-route" style={{ "--pj-accent": project.accent ?? DEFAULT_ACCENT } as CSSProperties}>
            <CategoryBar active={project.category} />
            <TooltipLayer />
            <ProjectDetail key={project.id} pj={project} onImageClick={(src, alt) => setModal({ src, alt })} />
            <Modal
                isOpen={!!modal}
                onRequestClose={() => setModal(null)}
                contentLabel={modal?.alt ?? "이미지 확대"}
                style={{
                    overlay: { zIndex: 9, backgroundColor: "rgba(0, 0, 0, 0.75)" },
                    content: {
                        width: "86vw",
                        height: "48vw",
                        maxHeight: "80vh",
                        margin: "auto",
                        zIndex: 10,
                        backgroundImage: modal ? `url(${modal.src})` : undefined,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundColor: "#0d0d0d",
                    },
                }}
            />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* 이전 주소 /project?sec=unity&pj=ignotus (또는 pj=0) → /projects/<slug>  */
/* ------------------------------------------------------------------ */

export function LegacyProjectRedirect() {
    const [query] = useSearchParams();
    const sec = query.get("sec") ?? "unity";
    const pj = query.get("pj");
    const inSection = getCategory(sec) ? getProjectsByCategory(sec) : [];

    let target: Project | undefined;
    if (pj !== null && pj !== "" && !isNaN(Number(pj))) {
        target = inSection[Math.max(0, Math.min(Number(pj), inSection.length - 1))];
    } else if (pj) {
        target = getProjectBySlug(pj);
    } else {
        target = inSection[0];
    }
    return <Navigate replace to={target ? projectPath(target) : PROJECTS_PATH} />;
}
