import { useEffect, useState } from "react";
import type React from "react";
import { assetPath, extractYouTubeId, mediaAlt } from "../content";
import type { MediaItem, Project } from "../content";

/**
 * 기존 이미지·영상 캐러셀.
 * 레이아웃은 기존과 같은 비율(슬라이드 60%, 좌우 미리보기 20%, 간격 2%)을 퍼센트로 계산해
 * JS 실행 전(프리렌더 HTML)에도 같은 모양으로 보인다.
 */
export default function MediaSlider({
    project,
    media,
    onImageClick,
}: {
    project: Project;
    media: MediaItem[];
    onImageClick: (src: string, alt: string) => void;
}) {
    const slides = media.filter((m) => m.type !== "youtube" || extractYouTubeId(m.src));
    const [idx, setIdx] = useState(0);
    // 재생을 누른 YouTube 슬라이드만 실제 플레이어(iframe)를 불러온다
    const [playing, setPlaying] = useState<number | null>(null);
    // 직접 올린 영상 파일(video)이 재생 중인지
    const [videoPlaying, setVideoPlaying] = useState(false);
    const total = slides.length;

    useEffect(() => {
        // 영상을 보고 있는 동안에는 자동으로 넘기지 않는다
        if (total <= 1 || playing !== null || videoPlaying) return;
        const t = setTimeout(() => setIdx((i) => (i + 1) % total), 5000);
        return () => clearTimeout(t);
    }, [idx, total, playing, videoPlaying]);

    if (total === 0) return null;

    // 모든 미디어가 세로 스크린샷이면 휴대폰 화면형 갤러리(세로 카드 여러 장)로 보여 준다
    const portrait = slides.every((m) => m.type === "image" && m.fit === "contain");

    const go = (dir: 1 | -1) => {
        setPlaying(null);
        setVideoPlaying(false);
        setIdx((i) => (i + dir + total) % total);
    };
    const current = slides[idx];
    let imageNo = 0;

    return (
        <figure className="slider-figure">
            <div
                className={`slider-wrap${portrait ? " portrait" : ""}`}
                aria-roledescription="carousel"
                aria-label={`${project.title} 미디어`}
            >
                <div className="slider-track" style={{ "--idx": idx } as React.CSSProperties}>
                    {slides.map((slide, i) => {
                        const active = i === idx;
                        const cls = `slider-slide${active ? " active" : ""}`;
                        if (slide.type === "youtube") {
                            const id = extractYouTubeId(slide.src)!;
                            const title = slide.caption ? `${project.title}: ${slide.caption}` : `${project.title} 영상`;
                            return (
                                <div key={i} className={cls} aria-hidden={!active}>
                                    {playing === i ? (
                                        <iframe
                                            className="slider-iframe"
                                            src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`}
                                            allow="autoplay; encrypted-media; picture-in-picture"
                                            allowFullScreen
                                            title={title}
                                        />
                                    ) : (
                                        // 처음에는 썸네일만 보여 주고, 누르면 플레이어를 불러온다 (YouTube 스크립트를 미리 받지 않음)
                                        <a
                                            className="slider-yt"
                                            href={`https://youtu.be/${id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            tabIndex={active ? 0 : -1}
                                            aria-label={`영상 재생: ${title}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIdx(i);
                                                setPlaying(i);
                                            }}
                                        >
                                            <img
                                                src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                                                alt=""
                                                loading={i === 0 ? "eager" : "lazy"}
                                                draggable={false}
                                            />
                                            <span className="slider-yt-play" aria-hidden="true" />
                                        </a>
                                    )}
                                </div>
                            );
                        }
                        if (slide.type === "video") {
                            return (
                                <div key={i} className={cls} aria-hidden={!active}>
                                    <video
                                        className="slider-iframe"
                                        src={assetPath(slide.src)}
                                        controls
                                        preload="metadata"
                                        onPlay={() => setVideoPlaying(true)}
                                        onPause={() => setVideoPlaying(false)}
                                        onEnded={() => setVideoPlaying(false)}
                                    />
                                </div>
                            );
                        }
                        const alt = mediaAlt(project, slide, imageNo++);
                        const src = assetPath(slide.src);
                        // 가로 슬라이드 안의 세로 이미지: 빈 여백을 같은 이미지를 흐리게 깐 배경으로 채운다
                        const backdrop = !portrait && slide.fit === "contain";
                        return (
                            <div
                                key={i}
                                className={`${cls}${backdrop ? " has-backdrop" : ""}`}
                                aria-hidden={!active}
                                style={backdrop ? ({ "--slide-bg": `url("${src}")` } as React.CSSProperties) : undefined}
                            >
                                <img
                                    src={src}
                                    className={`slider-img${slide.fit === "contain" ? " contain" : ""}`}
                                    onClick={() => {
                                        // 옆 카드를 누르면 먼저 그 카드로 이동하고, 가운데 카드를 누르면 크게 본다
                                        if (portrait && !active) setIdx(i);
                                        else onImageClick(src, alt);
                                    }}
                                    draggable={false}
                                    loading={i === 0 ? "eager" : "lazy"}
                                    alt={alt}
                                />
                            </div>
                        );
                    })}
                </div>

                {total > 1 && (
                    <>
                        <button type="button" className="slider-nav-btn slider-nav-prev" onClick={() => go(-1)} aria-label="이전 미디어">
                            &#8249;
                        </button>
                        <button type="button" className="slider-nav-btn slider-nav-next" onClick={() => go(1)} aria-label="다음 미디어">
                            &#8250;
                        </button>
                        <div className="slider-dots">
                            {slides.map((_, i) => (
                                <button
                                    type="button"
                                    key={i}
                                    className={`slider-dot${i === idx ? " active" : ""}`}
                                    onClick={() => {
                                        setPlaying(null);
                                        setVideoPlaying(false);
                                        setIdx(i);
                                    }}
                                    aria-label={`${i + 1}번째 미디어`}
                                    aria-current={i === idx}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
            {current?.caption && <figcaption className="slider-caption">{current.caption}</figcaption>}
        </figure>
    );
}
