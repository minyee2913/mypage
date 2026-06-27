import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PrCategory, Pj } from "./dataStructure";
import "./style.css";
import { Link, useSearchParams } from "react-router-dom";
import Modal from "react-modal";
import { CopyToClipboard } from "react-copy-to-clipboard";

import "./data";

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
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function extractYouTubeId(url: string): string | null {
    const m = url.match(/(?:youtu\.be\/|[?&]v=)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
}

type SlideItem =
    | { type: 'image'; src: string }
    | { type: 'youtube'; videoId: string };

function MediaSlider({
    images,
    youtubeUrl,
    onImageClick,
}: {
    images: string[];
    youtubeUrl?: string;
    onImageClick: (src: string) => void;
}) {
    const slides: SlideItem[] = [];
    const ytId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null;
    if (ytId) slides.push({ type: 'youtube' as const, videoId: ytId });
    slides.push(...images.map(src => ({ type: 'image' as const, src })));

    const [idx, setIdx] = useState(0);
    const [wrapW, setWrapW] = useState(0);
    const wrapRef = useRef<HTMLDivElement>(null);
    const total = slides.length;

    useLayoutEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const update = () => setWrapW(el.offsetWidth);
        update();
        const obs = new ResizeObserver(update);
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (total <= 1) return;
        const t = setTimeout(() => setIdx(i => (i + 1) % total), 5000);
        return () => clearTimeout(t);
    }, [idx, total]);

    if (total === 0) return null;

    const go = (dir: 1 | -1) => setIdx(i => (i + dir + total) % total);

    const peekPx  = wrapW * 0.20;
    const gapPx   = wrapW * 0.02;
    const slidePx = wrapW * 0.60;
    const stepPx  = slidePx + gapPx;
    const trackX  = wrapW > 0 ? peekPx - idx * stepPx : 0;

    return (
        <div ref={wrapRef} className="slider-wrap">
            <div
                className="slider-track"
                style={{ transform: `translateX(${trackX}px)` }}
            >
                {slides.map((slide, i) => (
                    <div
                        key={i}
                        className={`slider-slide${i === idx ? ' active' : ''}`}
                        style={wrapW > 0 ? { width: slidePx, marginRight: gapPx } : {}}
                    >
                        {slide.type === 'image' ? (
                            <img
                                src={slide.src}
                                className="slider-img"
                                onClick={() => onImageClick(slide.src)}
                                draggable={false}
                                alt=""
                            />
                        ) : (
                            <iframe
                                className="slider-iframe"
                                src={`https://www.youtube-nocookie.com/embed/${slide.videoId}?rel=0`}
                                allowFullScreen
                                title="YouTube"
                            />
                        )}
                    </div>
                ))}
            </div>

            {total > 1 && (
                <>
                    <button className="slider-nav-btn slider-nav-prev" onClick={() => go(-1)}>&#8249;</button>
                    <button className="slider-nav-btn slider-nav-next" onClick={() => go(1)}>&#8250;</button>
                    <div className="slider-dots">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                className={`slider-dot${i === idx ? ' active' : ''}`}
                                onClick={() => setIdx(i)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function ProjectDetail({
    pj,
    pjCode,
    sectLen,
    sectionId,
    navigate,
    onImageClick,
}: {
    pj: Pj;
    pjCode: number;
    sectLen: number;
    sectionId: string;
    navigate: (dir: 1 | -1) => void;
    onImageClick: (src: string) => void;
}) {
    const [release, setRelease] = useState<Release | null>(null);

    useEffect(() => {
        if (!pj.github) { setRelease(null); return; }
        fetch('/releases.json')
            .then(r => r.ok ? r.json() : {})
            .then((map: Record<string, Release>) => setRelease(map[pj.id] ?? null))
            .catch(() => setRelease(null));
    }, [pj.id, pj.github]);

    const projectImages = pj.img.filter(Boolean);
    const hasReleaseAssets = release && release.assets.length > 0;

    return (
        <div className="project_sec">
            <div className="project-scroll">
                <div className="pj-header">
                    <p className="title">{pj.name}</p>
                    <p className="platform">{pj.platform}</p>
                    <CopyToClipboard
                        text={`https://human.minyee2913.net/project?pj=${pj.id}&sec=${sectionId}`}
                        onCopy={() => alert("클립보드에 복사되었습니다.")}
                    >
                        <div className="share_btn hovertext pointer" data-hover="공유">
                            <img src="img/import.png" alt="share" />
                        </div>
                    </CopyToClipboard>
                </div>

                <MediaSlider
                    key={`${sectionId}-${pjCode}`}
                    images={projectImages}
                    youtubeUrl={pj.youtube}
                    onImageClick={onImageClick}
                />

                <div className="buttons">
                    {pj.docs && <a href={pj.docs} target="_blank" rel="noreferrer" className="btn hovertext pointer" data-hover="기획 / 문서"><img src="img/docs.png" alt="docs" /></a>}
                    {pj.youtube && <a href={pj.youtube} target="_blank" rel="noreferrer" className="btn hovertext pointer" data-hover="플레이 영상"><img src="img/youtube.png" alt="youtube" /></a>}
                    {pj.playstore && <a href={pj.playstore} target="_blank" rel="noreferrer" className="btn hovertext pointer" data-hover="스토어"><img src="img/playstore.png" alt="playstore" /></a>}
                    {pj.github && <a href={pj.github} target="_blank" rel="noreferrer" className="btn hovertext pointer" data-hover="GitHub"><img src="img/github.png" alt="github" /></a>}
                    {pj.download && !hasReleaseAssets && <a href={pj.download} target="_blank" rel="noreferrer" className="btn hovertext pointer" data-hover="다운로드"><img src="img/download.png" alt="download" /></a>}
                </div>

                {hasReleaseAssets && (
                    <div className="pj-release">
                        <p className="pj-release-meta">{release!.tag_name} · {formatDate(release!.published_at)}</p>
                        <div className="pj-release-assets">
                            {release!.assets.map(asset => (
                                <a
                                    key={asset.id}
                                    href={asset.browser_download_url}
                                    className="pj-asset-btn"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <span className="pj-asset-name">{asset.name}</span>
                                    <span className="pj-asset-size">{formatBytes(asset.size)}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <p className="descrip">{pj.description}</p>
            </div>

            <div className="project-arrows">
                {pjCode > 0 && (
                    <img src="img/up_arrow.png" className="pj-nav-arrow pointer" alt="prev" onClick={() => navigate(-1)} />
                )}
                {pjCode + 1 < sectLen && (
                    <img src="img/down_arrow.png" className="pj-nav-arrow pointer" alt="next" onClick={() => navigate(1)} />
                )}
            </div>
        </div>
    );
}

function Project() {
    const [query, setQuery] = useSearchParams();
    const [modalImg, setImg] = useState("");
    const [isModal, setModal] = useState(false);

    const sectionId = query.get("sec") ?? "unity";
    const projectParam = query.get("pj");

    const sect = PrCategory.data.find(v => v.id === sectionId);
    let pjCode = 0;
    if (sect) {
        const pn = Number(projectParam);
        if (!isNaN(pn) && projectParam !== null) {
            pjCode = Math.max(0, Math.min(pn, sect.projects.length - 1));
        } else if (projectParam) {
            const f = sect.projects.find(v => v.id === projectParam);
            if (f) pjCode = sect.projects.indexOf(f);
        }
    }

    const navigate = (dir: 1 | -1) => {
        setQuery(prev => {
            const next = new URLSearchParams(prev);
            next.set("pj", (pjCode + dir).toString());
            return next;
        });
    };

    const setSection = (sec: string) => {
        setQuery(prev => {
            const next = new URLSearchParams(prev);
            next.set("sec", sec);
            next.delete("pj");
            return next;
        });
    };

    const currentProject = sect?.projects[pjCode];

    return (
        <>
            <div className="category">
                <Link to="/" className="back-home-btn pointer">{'<'} Main</Link>
                {PrCategory.data.map(v => (
                    <div
                        key={v.id}
                        className="category-item pointer hovertext"
                        data-hover={v.name}
                        id={"category-" + v.id}
                        onClick={() => setSection(v.id)}
                    >
                        <img src={v.img} alt={v.name} />
                        {sectionId === v.id && <div className="category-selected" />}
                    </div>
                ))}
            </div>
            <div style={{ textAlign: "center" }}>
                {currentProject && sect && (
                    <ProjectDetail
                        key={`${sectionId}-${pjCode}`}
                        pj={currentProject}
                        pjCode={pjCode}
                        sectLen={sect.projects.length}
                        sectionId={sectionId}
                        navigate={navigate}
                        onImageClick={src => { setImg(src); setModal(true); }}
                    />
                )}
            </div>
            <Modal isOpen={isModal} onRequestClose={() => setModal(false)} style={{
                overlay: { zIndex: 9, backgroundColor: "rgba(0, 0, 0, 0.5)" },
                content: {
                    width: "80vw",
                    height: "40vw",
                    margin: "auto",
                    zIndex: 10,
                    backgroundImage: `url(${modalImg})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundColor: "#0d0d0d",
                }
            }} />
        </>
    );
}

export default Project;
