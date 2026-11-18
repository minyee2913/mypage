/**
 * 포트폴리오 프로젝트 데이터 스키마.
 *
 * 화면(React), 프리렌더 HTML, SEO 메타/JSON-LD, sitemap.xml, llms.txt,
 * projects.json, projects/<slug>.md 가 전부 이 데이터에서 생성된다.
 * 필수 필드는 id / category / title 뿐이고 나머지는 모두 선택이다.
 * 비어 있는 필드는 화면에서도 섹션 자체가 숨겨진다.
 */

export type CategoryId = "unity" | "minecraft";

export interface Category {
    id: CategoryId;
    /** 화면 표시용 이름 (기존 카테고리 툴팁) */
    name: string;
    /** 카테고리 아이콘 (public 기준 경로) */
    icon: string;
}

/**
 * released        스토어 등에 공개 출시됨
 * in-development  개발 진행 중
 * completed       개발 종료(대회/해커톤 출품 등 완료된 빌드)
 * paused          중단/보류
 * prototype       프로토타입
 */
export type ProjectStatus = "released" | "in-development" | "completed" | "paused" | "prototype";

export type LinkType =
    | "playstore"
    | "steam"
    | "itch"
    | "discord"
    | "github"
    | "youtube"
    | "playlist"
    | "docs"
    | "download"
    | "website"
    | "other";

export interface ProjectLink {
    type: LinkType;
    url: string;
    /** 없으면 type 기본 라벨 사용 */
    label?: string;
}

export interface MediaItem {
    type: "image" | "youtube" | "video";
    /** image/video: public 기준 경로 또는 절대 URL, youtube: 영상 URL */
    src: string;
    /** 이미지 하단에 보이는 설명 */
    caption?: string;
    /** 대체 텍스트 (없으면 caption → "<title> 스크린샷 n") */
    alt?: string;
    /** 세로 스크린샷처럼 잘리면 안 되는 이미지는 "contain" */
    fit?: "cover" | "contain";
}

export interface CodeSample {
    language: string;
    code: string;
    /** 코드 출처나 단순화 여부를 반드시 적는다 */
    caption?: string;
}

/** 개발자가 직접 구현한 기능 */
export interface Feature {
    name: string;
    /** 한 줄 요약 */
    summary?: string;
    /** 구현 목적 */
    purpose?: string;
    /** 동작 방식 */
    how?: string[];
    /** 사용 기술 */
    technologies?: string[];
    /** 핵심 로직 또는 아키텍처 설명 */
    architecture?: string[];
    code?: CodeSample;
    /** 구현 과정에서 고려한 사항 */
    considerations?: string[];
    links?: ProjectLink[];
    media?: MediaItem[];
}

export interface Metric {
    label: string;
    before: string;
    after: string;
}

/**
 * solved   해결
 * partial  부분 해결 (remaining 에 남은 문제를 적는다)
 * unsolved 미해결 — 해결된 것처럼 쓰지 않는다
 */
export type ChallengeStatus = "solved" | "partial" | "unsolved";

/** 개발 중 실제로 겪은 기술적 문제 */
export interface TechnicalChallenge {
    title: string;
    status: ChallengeStatus;
    /** 문제 상황 */
    problem: string;
    /** 원인 분석 */
    cause?: string;
    /** 해결 과정 */
    process?: string[];
    /** 적용한 기술 또는 접근 방식 */
    approach?: string[];
    /** 최종 결과 */
    result?: string;
    /** 남은 문제 */
    remaining?: string;
    /** 개선 전후 수치 (실측값만) */
    metrics?: Metric[];
}

export type AchievementType = "release" | "award" | "selection" | "event" | "other";

export interface Achievement {
    type: AchievementType;
    title: string;
    /** YYYY 또는 YYYY-MM 또는 YYYY-MM-DD */
    date?: string;
    url?: string;
    description?: string;
}

/** 개발 연혁 한 줄 (date: YYYY 또는 YYYY-MM) */
/** 상세 페이지를 열 때의 모션 그래픽 종류 */
/** 상세 페이지에 처음 들어갈 때 화면을 덮었다 걷어내는 연출 */
export type RevealStyle =
    | "burn"
    | "slash"
    | "cards"
    | "warp"
    | "drain"
    | "light"
    | "blocks"
    | "pixels"
    | "toss"
    | "clock"
    | "shatter"
    | "scan"
    | "portal"
    | "ripple"
    | "dash"
    | "beat"
    | "purify";

export type IntroStyle = "embers" | "slash" | "magic" | "stars" | "steam" | "motes" | "blocks" | "dust" | "notes" | "wind" | "smog" | "speed";

export interface HistoryItem {
    date: string;
    text: string;
}

export interface Project {
    /** 고정 ID — releases.json 키 등에 쓰이므로 바꾸지 않는다 */
    id: string;
    /** URL slug (/projects/<slug>). 없으면 id 사용 */
    slug?: string;
    /** 이름을 바꾸기 전의 slug. /projects/<옛 slug> 는 새 주소로 이동한다 */
    aliases?: string[];
    category: CategoryId;
    /** 게임이면 VideoGame, 그 외 SoftwareApplication 으로 구조화 데이터 생성 (기본 game) */
    kind?: "game" | "software";

    title: string;
    /** 공식 캐치프레이즈 (스토어 페이지 등 공식 문구가 있을 때만) */
    tagline?: string;
    /** 공식 "주요 특징" 목록 (스토어 페이지 등에 적힌 것만) */
    highlights?: string[];
    /** 상세 페이지 상단 배경(키아트). 없으면 첫 번째 스크린샷 → YouTube 썸네일 순으로 사용 */
    hero?: string;
    /** 게임 로고 이미지 (배경이 투명한 PNG). 있으면 상세 페이지 제목 자리에 표시 */
    logo?: string;
    /** 목록 카드/공유 이미지로 쓸 대표 이미지 (스토어 헤더 등). 없으면 첫 번째 스크린샷 */
    cover?: string;
    /** 페이지 강조색 (#rrggbb). 없으면 기본색 */
    accent?: string;
    /** 페이지를 열 때 모션 그래픽. 없으면 마인크래프트는 blocks, 그 외는 dust */
    intro?: IntroStyle;
    /** 페이지가 처음 드러나는 연출. 없으면 마인크래프트는 blocks, 그 외는 pixels */
    reveal?: RevealStyle;
    /** 한 줄 소개 */
    subtitle?: string;
    /** 짧은 요약 (목록, 메타 description 에 사용) */
    description?: string;
    /** 상세 설명 문단 */
    overview?: string[];
    /** 게임 플레이 방식 */
    gameplay?: string[];
    genres?: string[];

    status?: ProjectStatus;
    /** YYYY 또는 YYYY-MM */
    startDate?: string;
    /** 출시 예정 시기 (아직 출시 전일 때). YYYY, YYYY-H1 / YYYY-H2, YYYY-MM */
    releaseTarget?: string;
    endDate?: string;

    /** 화면 표시용 플랫폼 (예: "Mobile (Android)") */
    platform?: string;
    teamSize?: number;
    /** 팀 구성 설명 (예: "개발 3인, 아트 1인") */
    teamComposition?: string;
    /** 본인 담당 역할 */
    roles?: string[];
    /** 본인 기여도 (포트폴리오에 적힌 값만) */
    contribution?: string;

    engine?: string;
    languages?: string[];
    frameworks?: string[];
    technologies?: string[];
    /** 설계 패턴 / 구조 */
    architecture?: string[];

    /** 개발 연혁 (오래된 것부터) */
    history?: HistoryItem[];
    features?: Feature[];
    technicalChallenges?: TechnicalChallenge[];
    achievements?: Achievement[];
    media?: MediaItem[];
    externalLinks?: ProjectLink[];

    /** 메인 페이지 추천 카드에 노출 */
    featured?: boolean;
    /** 낮을수록 먼저. 없으면 배열 순서 */
    displayOrder?: number;
}
