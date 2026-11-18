import type { Project } from "../types";

// 출처: 기존 사이트 데이터, 포트폴리오 PDF(131~135p), GitHub 저장소 언어 정보.

export const valorant: Project = {
    id: "valorant",
    category: "minecraft",
    title: "Valorant Addon",
    description: "마인크래프트에서 발로란트의 캐릭터와 총기 시스템을 구현한 마인크래프트 BE 애드온 프로젝트.",
    startDate: "2023",
    platform: "MCBE ADDON",
    languages: ["mcfunction"],
    media: [{ type: "youtube", src: "https://youtu.be/27_Dz3ObTzc", caption: "플레이 영상" }],
    externalLinks: [
        { type: "github", url: "https://github.com/minyee2913/valorant-addon" },
        { type: "youtube", url: "https://youtu.be/27_Dz3ObTzc" },
    ],
};

export const videoParticle: Project = {
    id: "video-particle",
    accent: "#7fd1ff",
    intro: "motes",
    reveal: "pixels",
    category: "minecraft",
    kind: "software",
    title: "Video Particle",
    description: "영상 파일 데이터를 추출해서 마인크래프트 내 파티클로 영상을 그대로 구현하고 재생하는 외부 프로그램.",
    startDate: "2023",
    platform: "STANDALONE PROGRAM",
    // 공개 저장소 package.json 기준
    languages: ["TypeScript"],
    frameworks: ["Node.js", "fluent-ffmpeg (영상 프레임 추출)", "Jimp (이미지 픽셀 읽기)"],
    externalLinks: [{ type: "github", url: "https://github.com/minyee2913/videoParticle" }],
};

export const blockBeat: Project = {
    id: "blockbeat",
    accent: "#5ad1ff",
    intro: "notes",
    reveal: "beat",
    category: "minecraft",
    title: "Block Beat",
    description: "키 입력이 아닌 마우스로 에임을 돌려 노트를 치는 마인크래프트 BE 맵 기반 리듬게임.",
    genres: ["리듬"],
    startDate: "2023",
    platform: "MCBE MAP",
    media: [{ type: "youtube", src: "https://youtu.be/ndHBnaODyos", caption: "플레이 영상" }],
    externalLinks: [{ type: "youtube", url: "https://youtu.be/ndHBnaODyos?si=-V5IA7Lzn82Enl7G" }],
};
