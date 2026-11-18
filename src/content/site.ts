/** 사이트 공통 정보. 개발자 소개 문구는 여기만 고치면 화면/메타/llms.txt 가 같이 바뀐다. */
export const SITE = {
    url: "https://human.minyee2913.net",
    name: "minyee2913",
    lang: "ko",
    locale: "ko_KR",
    title: "minyee2913 | Game Developer Portfolio",
    description:
        "Unity·C# 게임 클라이언트 개발자 minyee2913의 포트폴리오. " +
        "PC·모바일로 2027년 상반기 출시 예정인 IGNOTUS, Google Play에 출시한 발!도!!, 2020년부터 개발 중인 Minecraft Bedrock RPG 서버 Luminous Wanderlust(구 Luminous RPG) 등 프로젝트별 구현 기능과 기술 기록을 정리했습니다.",
    defaultImage: "/img/games/ignotus/steam-title.jpg",
    author: {
        name: "minyee2913",
        jobTitle: "Game Developer",
        /** 메인 페이지 영문 태그라인 (기존 문구) */
        tagline: "Building action systems, roguelike loops, and multiplayer gameplay.",
        /** 메인 페이지 터미널 패널과 메타데이터에 쓰는 한국어 소개 */
        about: "Unity·C# 기반 게임 클라이언트 개발자",
        /** 메인 페이지 터미널 skills --core (기존 문구) */
        skills: ["Unity", "C#", "Go", "TypeScript", "Multiplayer", "AI Systems"],
    },
    social: [
        { name: "GitHub", label: "깃허브", url: "https://github.com/minyee2913" },
        { name: "YouTube", label: "유튜브", url: "https://www.youtube.com/channel/UCZQUWTcP51kOFG0TWeHnr_g" },
        { name: "KakaoTalk Open Chat", label: "오픈채팅", url: "https://open.kakao.com/me/minyee2913" },
    ],
} as const;

export function absoluteUrl(path: string): string {
    if (/^https?:\/\//.test(path)) return path;
    return SITE.url + (path.startsWith("/") ? path : "/" + path);
}
