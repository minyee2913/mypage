import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PrCategory } from "./dataStructure";
import "./style.css";
import { Link, useSearchParams } from "react-router-dom";
import Modal from "react-modal";
import { CopyToClipboard } from "react-copy-to-clipboard";

import "./data";

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

    // 컨테이너 너비를 픽셀로 측정 (퍼센트 기준 모호성 제거)
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

    // 좌우 20% peek, 슬라이드 60%, 슬라이드 간 2% gap
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

function Project() {
    const [projectItem, SetProjectItem] = useState<JSX.Element>();
    const [categoryItem, SetCategoryItem] = useState<JSX.Element[]>([]);
    const [modalImg, setImg] = useState("");
    const [isModal, SetModal] = useState(false);

    let category = "unity";
    let pjCode = 0;

    const [query, setQuery] = useSearchParams();
    const section = query.get("sec");
    const project = query.get("pj");

    if (section) category = section;

    const pn = Number(project);
    if (!isNaN(pn)) {
        pjCode = pn;
    } else {
        const sect = PrCategory.data.find(v => v.id === category);
        if (sect) {
            const f = sect.projects.find(v => v.id === project);
            if (f) pjCode = sect.projects.indexOf(f);
        }
    }

    if (project === null) {
        query.set("pj", pjCode.toString());
        setQuery(query);
    }

    const SetSection = (sec: string) => {
        query.set("sec", sec);
        setQuery(query);
    };

    const OpenModal = () => SetModal(true);
    const CloseModal = () => SetModal(false);

    const Update = () => {
        SetSection(category);

        const itms = PrCategory.data.map(v =>
            <div
                className="category-item pointer hovertext"
                data-hover={v.name}
                id={"category-" + v.id}
                key={"category-" + v.id}
                onClick={() => { category = v.id; Update(); }}
            >
                <img src={v.img} alt={v.name} />
                {category === v.id ? <div className="category-selected" /> : null}
            </div>
        );

        const sect = PrCategory.data.find(v => v.id === category);
        if (sect) {
            const currentProject = sect.projects[pjCode];
            const projectImages = currentProject.img.filter(Boolean);
            const shareSection = section ?? category;

            const navigate = (dir: 1 | -1) => {
                pjCode += dir;
                query.set("pj", pjCode.toString());
                setQuery(query);
                SetProjectItem(<></>);
                setTimeout(Update, 200);
            };

            SetProjectItem(
                <div className="project_sec">
                    <div className="project-scroll">
                        <div className="pj-header">
                            <p className="title">{currentProject.name}</p>
                            <p className="platform">{currentProject.platform}</p>
                            <CopyToClipboard
                                text={`https://human.minyee2913.net/project?pj=${currentProject.id}&sec=${shareSection}`}
                                onCopy={() => alert("클립보드에 복사되었습니다.")}
                            >
                                <div className="share_btn hovertext pointer" data-hover="공유">
                                    <img src="img/import.png" alt="share" />
                                </div>
                            </CopyToClipboard>
                        </div>

                        <MediaSlider
                            key={`${category}-${pjCode}`}
                            images={projectImages}
                            youtubeUrl={currentProject.youtube}
                            onImageClick={src => { setImg(src); OpenModal(); }}
                        />

                        <div className="buttons">
                            {currentProject.docs && <a href={currentProject.docs} target="_blank" rel="noreferrer" className="btn hovertext pointer" data-hover="기획 / 문서"><img src="img/docs.png" alt="docs" /></a>}
                            {currentProject.youtube && <a href={currentProject.youtube} target="_blank" rel="noreferrer" className="btn hovertext pointer" data-hover="플레이 영상"><img src="img/youtube.png" alt="youtube" /></a>}
                            {currentProject.playstore && <a href={currentProject.playstore} target="_blank" rel="noreferrer" className="btn hovertext pointer" data-hover="스토어"><img src="img/playstore.png" alt="playstore" /></a>}
                            {currentProject.github && <a href={currentProject.github} target="_blank" rel="noreferrer" className="btn hovertext pointer" data-hover="GitHub"><img src="img/github.png" alt="github" /></a>}
                            {currentProject.download && <a href={currentProject.download} target="_blank" rel="noreferrer" className="btn hovertext pointer" data-hover="다운로드"><img src="img/download.png" alt="download" /></a>}
                        </div>

                        <p className="descrip">{currentProject.description}</p>
                    </div>

                    <div className="project-arrows">
                        {pjCode > 0 && (
                            <img src="img/up_arrow.png" className="pj-nav-arrow pointer" alt="prev" onClick={() => navigate(-1)} />
                        )}
                        {pjCode + 1 < sect.projects.length && (
                            <img src="img/down_arrow.png" className="pj-nav-arrow pointer" alt="next" onClick={() => navigate(1)} />
                        )}
                    </div>
                </div>
            );
        } else {
            SetProjectItem(<></>);
        }

        SetCategoryItem(itms);
    };

    useEffect(() => { Update(); }, []);

    return (
        <>
            <div className="category">
                <Link to="/" className="back-home-btn pointer">{'<'} Main</Link>
                {categoryItem}
            </div>
            <div style={{ textAlign: "center" }}>
                {projectItem}
            </div>
            <Modal isOpen={isModal} onRequestClose={CloseModal} style={{
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
