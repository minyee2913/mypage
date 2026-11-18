import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import {
    ACHIEVEMENT_LABEL,
    CHALLENGE_STATUS_LABEL,
    STATUS_LABEL,
    assetPath,
    extractYouTubeId,
    formatPeriod,
    formatReleaseTarget,
    formatTeam,
    linkLabel,
    mediaAlt,
} from "../content";
import type { Feature, MediaItem, Project, ProjectLink, TechnicalChallenge } from "../content";
import { Rich, Term } from "./rich";

/** 프로젝트 상세 정보 섹션들. 데이터가 없는 섹션은 탭을 만들지 않는다. */

const has = <T,>(a: T[] | undefined): a is T[] => !!a && a.length > 0;

function Tags({ items }: { items: string[] }) {
    return (
        <ul className="pj-tags">
            {items.map((t) => (
                <li key={t}>
                    <Term term={t} />
                </li>
            ))}
        </ul>
    );
}

function Links({ links }: { links: ProjectLink[] }) {
    return (
        <ul className="pj-links">
            {links.map((l) => (
                <li key={l.url + (l.label ?? "")}>
                    <a href={l.url} target="_blank" rel="noreferrer">
                        [{linkLabel(l)}]
                    </a>
                </li>
            ))}
        </ul>
    );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="pj-row">
            <dt>{label}</dt>
            <dd>{children}</dd>
        </div>
    );
}

function Bullets({ items }: { items: string[] }) {
    return (
        <ul className="pj-bullets">
            {items.map((t, i) => (
                <li key={i}>
                    <Rich text={t} />
                </li>
            ))}
        </ul>
    );
}

function InlineMedia({ project, media }: { project: Project; media: MediaItem[] }) {
    return (
        <div className="pj-inline-media">
            {media.map((m, i) => {
                if (m.type === "image") {
                    return (
                        <figure key={i}>
                            <img
                                src={assetPath(m.src)}
                                alt={mediaAlt(project, m, i)}
                                loading="lazy"
                                className={m.fit === "contain" ? "contain" : undefined}
                            />
                            {m.caption && <figcaption>{m.caption}</figcaption>}
                        </figure>
                    );
                }
                const href = m.type === "youtube" ? `https://youtu.be/${extractYouTubeId(m.src)}` : assetPath(m.src);
                return (
                    <p key={i}>
                        <a href={href} target="_blank" rel="noreferrer">
                            [영상] {m.caption ?? project.title}
                        </a>
                    </p>
                );
            })}
        </div>
    );
}

function FeatureBody({ project, f }: { project: Project; f: Feature }) {
    return (
        <>
            <h3 className="pj-item-title">{f.name}</h3>
            {f.summary && <p className="pj-item-summary"><Rich text={f.summary} /></p>}
            <dl className="pj-dl">
                {f.purpose && <Row label="구현 목적"><Rich text={f.purpose} /></Row>}
                {has(f.how) && (
                    <Row label="동작 방식">
                        <Bullets items={f.how} />
                    </Row>
                )}
                {has(f.architecture) && (
                    <Row label="구조">
                        <Bullets items={f.architecture} />
                    </Row>
                )}
                {has(f.technologies) && (
                    <Row label="사용 기술">
                        <Tags items={f.technologies} />
                    </Row>
                )}
                {has(f.considerations) && (
                    <Row label="고려 사항">
                        <Bullets items={f.considerations} />
                    </Row>
                )}
            </dl>
            {f.code && (
                <figure className="pj-code">
                    <pre>
                        <code className={`language-${f.code.language}`}>{f.code.code}</code>
                    </pre>
                    {f.code.caption && <figcaption>{f.code.caption}</figcaption>}
                </figure>
            )}
            {has(f.media) && <InlineMedia project={project} media={f.media} />}
            {has(f.links) && <Links links={f.links} />}
        </>
    );
}

function ChallengeBody({ c }: { c: TechnicalChallenge }) {
    return (
        <>
            <h3 className="pj-item-title">
                {c.title} <span className={`pj-badge pj-badge-${c.status}`}>{CHALLENGE_STATUS_LABEL[c.status]}</span>
            </h3>
            <dl className="pj-dl">
                <Row label="문제 상황"><Rich text={c.problem} /></Row>
                {c.cause && <Row label="원인 분석"><Rich text={c.cause} /></Row>}
                {has(c.process) && (
                    <Row label="해결 과정">
                        <ol className="pj-steps">
                            {c.process.map((s, i) => (
                                <li key={i}>
                                    <Rich text={s} />
                                </li>
                            ))}
                        </ol>
                    </Row>
                )}
                {has(c.approach) && (
                    <Row label="적용 기술">
                        <Tags items={c.approach} />
                    </Row>
                )}
                {c.result && <Row label="결과"><Rich text={c.result} /></Row>}
                {c.remaining && <Row label="남은 문제"><Rich text={c.remaining} /></Row>}
            </dl>
            {has(c.metrics) && (
                <table className="pj-metrics">
                    <thead>
                        <tr>
                            <th scope="col">항목</th>
                            <th scope="col">개선 전</th>
                            <th scope="col">개선 후</th>
                        </tr>
                    </thead>
                    <tbody>
                        {c.metrics.map((m) => (
                            <tr key={m.label}>
                                <th scope="row">{m.label}</th>
                                <td>{m.before}</td>
                                <td>{m.after}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );
}

interface Tab {
    id: string;
    label: ReactNode;
    title?: string;
    /** 패널 맨 위에 붙는 제목 (섹션 h2 등) */
    heading?: ReactNode;
    content: ReactNode;
}

function readHash(): string {
    if (typeof window === "undefined") return "";
    try {
        return decodeURIComponent(window.location.hash.slice(1));
    } catch {
        return "";
    }
}

/** el 을 감싸는 스크롤 영역 (넓은 화면은 오른쪽 열, 좁은 화면은 전체 영역) */
function scrollParent(el: HTMLElement): HTMLElement | null {
    for (let n = el.parentElement; n; n = n.parentElement) {
        const o = getComputedStyle(n).overflowY;
        if ((o === "auto" || o === "scroll") && n.scrollHeight > n.clientHeight) return n;
    }
    return null;
}

/** 탭을 바꿨을 때 이미 아래로 내려가 있으면 탭 묶음의 처음부터 보이게 올린다 */
function revealTop(el: HTMLElement | null) {
    if (!el) return;
    const sc = scrollParent(el);
    if (!sc) return;
    const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
    if (sc.scrollTop > top) sc.scrollTop = top;
}

/**
 * 버튼으로 패널을 전환하는 탭 묶음. 섹션(INFO/ABOUT/...)과 기능·문제 해결 항목 선택에 같이 쓴다.
 * 모든 패널 내용은 HTML 에 그대로 들어 있고 선택되지 않은 패널에만 hidden 을 붙이므로,
 * JS 를 실행하지 않는 크롤러/AI 에이전트도 전체 내용을 읽을 수 있다. (사용자/봇 모두 같은 HTML)
 */
function TabGroup({
    idPrefix,
    tabs,
    ariaLabel,
    variant,
    syncHash = false,
    row = false,
}: {
    idPrefix: string;
    tabs: Tab[];
    ariaLabel: string;
    variant: "main" | "sub";
    syncHash?: boolean;
    /** sub 변형에서 항목 버튼을 세로 목록 대신 가로 한 줄로 */
    row?: boolean;
}) {
    const ids = tabs.map((t) => t.id).join(",");
    const [active, setActive] = useState(() => {
        const h = syncHash ? readHash() : "";
        return tabs.some((t) => t.id === h) ? h : tabs[0]?.id;
    });
    const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const rootRef = useRef<HTMLDivElement>(null);

    // 주소창에서 #features 처럼 해시만 바꿔도 해당 탭으로 이동
    useEffect(() => {
        if (!syncHash) return;
        const valid = ids.split(",");
        const onHash = () => {
            const h = readHash();
            if (valid.includes(h)) setActive(h);
        };
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, [ids, syncHash]);

    if (tabs.length === 0) return null;

    const select = (id: string, focus = false) => {
        setActive(id);
        revealTop(rootRef.current);
        // 공유/새로고침 시 같은 탭이 열리도록 해시를 남긴다 (라우터 state 는 그대로 유지)
        if (syncHash) window.history.replaceState(window.history.state, "", `#${id}`);
        if (focus) btnRefs.current[id]?.focus();
    };

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const idx = tabs.findIndex((t) => t.id === active);
        const fwd = variant === "sub" ? ["ArrowRight", "ArrowDown"] : ["ArrowRight"];
        const back = variant === "sub" ? ["ArrowLeft", "ArrowUp"] : ["ArrowLeft"];
        let next = -1;
        if (fwd.includes(e.key)) next = (idx + 1) % tabs.length;
        else if (back.includes(e.key)) next = (idx - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = tabs.length - 1;
        if (next < 0) return;
        e.preventDefault();
        e.stopPropagation();
        select(tabs[next].id, true);
    };

    const base = variant === "main" ? "pj-tab" : "pj-subtab";
    return (
        <div className={variant === "main" ? "pj-tabgroup" : `pj-subgroup${row ? " row" : ""}`} ref={rootRef}>
            <div className={variant === "main" ? "pj-tabs" : "pj-subtabs"} role="tablist" aria-label={ariaLabel} onKeyDown={onKeyDown}>
                {tabs.map((t) => {
                    const on = t.id === active;
                    return (
                        <button
                            key={t.id}
                            ref={(el) => {
                                btnRefs.current[t.id] = el;
                            }}
                            type="button"
                            role="tab"
                            id={`${idPrefix}-tab-${t.id}`}
                            aria-selected={on}
                            aria-controls={`${idPrefix}-panel-${t.id}`}
                            tabIndex={on ? 0 : -1}
                            className={`${base} pointer${on ? " active" : ""}`}
                            title={t.title}
                            onClick={() => select(t.id)}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>
            {tabs.map((t) => (
                <section
                    key={t.id}
                    id={`${idPrefix}-panel-${t.id}`}
                    role="tabpanel"
                    aria-labelledby={`${idPrefix}-tab-${t.id}`}
                    className={variant === "main" ? "pj-section" : "pj-subpanel"}
                    hidden={t.id !== active}
                >
                    {t.heading}
                    {t.content}
                </section>
            ))}
        </div>
    );
}

function SectionHeading({ label, title }: { label: string; title: string }) {
    return (
        <h2 className="pj-h2">
            <span className="pj-h2-prompt" aria-hidden="true">
                &gt;
            </span>{" "}
            {label} <span className="pj-h2-sub">{title}</span>
        </h2>
    );
}

/** 기능 / 문제 해결 목록: 항목 이름 버튼을 눌러 하나씩 본다 */
function ItemTabs<T>({
    idPrefix,
    ariaLabel,
    items,
    name,
    render,
    mark,
    row = false,
}: {
    idPrefix: string;
    ariaLabel: string;
    items: T[];
    name: (it: T) => string;
    render: (it: T) => ReactNode;
    mark?: (it: T) => string | undefined;
    row?: boolean;
}) {
    const tabs: Tab[] = items.map((it, i) => ({
        id: String(i + 1),
        title: name(it),
        label: (
            <>
                {!row && <span className="pj-subtab-no">{String(i + 1).padStart(2, "0")}</span>}
                <span className="pj-subtab-name">{name(it)}</span>
                {mark?.(it) && <span className={`pj-subtab-dot pj-dot-${mark(it)}`} aria-hidden="true" />}
            </>
        ),
        content: render(it),
    }));
    return <TabGroup idPrefix={idPrefix} tabs={tabs} ariaLabel={ariaLabel} variant="sub" row={row} />;
}

/** ABOUT 탭: 소개 / 주요 특징 / 게임 플레이 / 개발 연혁. 두 개 이상이면 버튼으로 나눠 본다 */
function AboutParts({ project: p }: { project: Project }) {
    const parts: { name: string; node: ReactNode }[] = [];
    if (has(p.overview))
        parts.push({
            name: "소개",
            node: p.overview.map((o, i) => (
                <p key={i} className="pj-p">
                    <Rich text={o} />
                </p>
            )),
        });
    if (has(p.highlights)) parts.push({ name: "주요 특징", node: <Bullets items={p.highlights} /> });
    if (has(p.gameplay)) parts.push({ name: "게임 플레이", node: <Bullets items={p.gameplay} /> });
    if (has(p.history))
        parts.push({
            name: "개발 연혁",
            node: (
                <ol className={p.history.length > 16 ? "pj-history is-long" : "pj-history"}>
                    {p.history.map((h) => (
                        <li key={h.date + h.text}>
                            <time dateTime={h.date}>{h.date.replace("-", ".")}</time>
                            <span><Rich text={h.text} /></span>
                        </li>
                    ))}
                </ol>
            ),
        });
    if (parts.length === 1) return <>{parts[0].node}</>;
    return (
        <ItemTabs
            idPrefix="pj-about"
            ariaLabel="프로젝트 소개 항목"
            items={parts}
            row
            name={(x) => x.name}
            render={(x) => (
                <>
                    <h3 className="pj-h3 pj-part-title">{x.name}</h3>
                    {x.node}
                </>
            )}
        />
    );
}

export default function ProjectSections({ project: p }: { project: Project }) {
    const period = formatPeriod(p);
    const team = formatTeam(p);
    const info: [string, ReactNode][] = [];
    if (period) info.push(["개발 기간", period]);
    if (p.status) info.push(["개발 상태", STATUS_LABEL[p.status]]);
    const release = formatReleaseTarget(p);
    if (release) info.push(["출시 일정", release]);
    if (p.platform) info.push(["플랫폼", p.platform]);
    if (has(p.genres)) info.push(["장르", p.genres.join(", ")]);
    if (team) info.push(["팀 구성", team]);
    if (has(p.roles)) info.push(["담당 역할", p.roles.join(", ")]);
    if (p.contribution) info.push(["기여도", p.contribution]);
    if (p.engine) info.push(["게임 엔진", p.engine]);
    if (has(p.languages)) info.push(["사용 언어", p.languages.join(", ")]);

    const techs = [...(p.frameworks ?? []), ...(p.technologies ?? [])];
    const tabs: Tab[] = [];

    if (info.length > 0 || p.description) {
        tabs.push({
            id: "info",
            label: "INFO",
            title: "기본 정보",
            content: (
                <>
                {p.description && <p className="pj-info-lead"><Rich text={p.description} /></p>}
                {info.length > 0 && (
                <dl className="pj-info">
                    {info.map(([k, v]) => (
                        <Row key={k} label={k}>
                            {v}
                        </Row>
                    ))}
                </dl>
                )}
                </>
            ),
        });
    }

    if (has(p.overview) || has(p.gameplay) || has(p.highlights) || has(p.history)) {
        tabs.push({
            id: "about",
            label: "ABOUT",
            title: "프로젝트 소개",
            content: <AboutParts project={p} />,
        });
    }

    if (techs.length > 0 || has(p.architecture)) {
        tabs.push({
            id: "tech",
            label: "TECH",
            title: "기술 스택",
            content: (
                <>
                    {techs.length > 0 && <Tags items={techs} />}
                    {has(p.architecture) && (
                        <>
                            <h3 className="pj-h3">설계 / 패턴</h3>
                            <Bullets items={p.architecture} />
                        </>
                    )}
                </>
            ),
        });
    }

    if (has(p.features)) {
        tabs.push({
            id: "features",
            label: "FEATURES",
            title: "핵심 구현 기능",
            content: (
                <ItemTabs
                    idPrefix="pj-feat"
                    ariaLabel="핵심 구현 기능 목록"
                    items={p.features}
                    name={(f) => f.name}
                    render={(f) => <FeatureBody project={p} f={f} />}
                />
            ),
        });
    }

    if (has(p.technicalChallenges)) {
        tabs.push({
            id: "troubleshooting",
            label: "TROUBLESHOOTING",
            title: "기술적 문제 해결",
            content: (
                <ItemTabs
                    idPrefix="pj-trouble"
                    ariaLabel="기술적 문제 해결 목록"
                    items={p.technicalChallenges}
                    name={(c) => c.title}
                    mark={(c) => c.status}
                    render={(c) => <ChallengeBody c={c} />}
                />
            ),
        });
    }

    if (has(p.achievements) || has(p.externalLinks)) {
        tabs.push({
            id: "result",
            label: "RESULT",
            title: "결과 및 링크",
            content: (
                <>
                    {has(p.achievements) && (
                        <ul className="pj-achievements">
                            {p.achievements.map((a) => (
                                <li key={a.title}>
                                    <span className="pj-badge">{ACHIEVEMENT_LABEL[a.type]}</span>{" "}
                                    {a.url ? (
                                        <a href={a.url} target="_blank" rel="noreferrer">
                                            {a.title}
                                        </a>
                                    ) : (
                                        a.title
                                    )}
                                    {a.date && <span className="pj-dim"> ({a.date})</span>}
                                    {a.description && <span className="pj-dim"> {a.description}</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                    {has(p.externalLinks) && <Links links={p.externalLinks} />}
                </>
            ),
        });
    }

    const withHeadings = tabs.map((t) => ({
        ...t,
        heading: <SectionHeading label={String(t.label)} title={t.title ?? ""} />,
    }));

    return (
        <div className="pj-sections">
            <TabGroup idPrefix="pj" tabs={withHeadings} ariaLabel="프로젝트 상세 정보" variant="main" syncHash />
        </div>
    );
}
