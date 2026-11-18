import type { Project } from "../types";

// 출처: 프로젝트 폴더(비공개, git 기록 없음)의 코드·README·ProjectSettings·빌드 결과·캡처 이미지.
// 개발 기간은 파일 수정 시각으로 추정했다. 1인 개발·AI 활용은 작성자 확인.
export const goawayKnight: Project = {
    id: "goaway-knight",
    category: "unity",
    accent: "#c86bd8",
    intro: "magic",
    reveal: "cards",
    title: "제발 꺼져 용사야!",
    tagline: "RAISE YOUR LEGION. DEFEND YOUR CITADEL.",
    subtitle: "마왕이 되어 카드로 몬스터를 소환해 용사를 막는 세로형 모바일 역(逆) 타워 디펜스",
    description:
        "마왕이 되어 카드 덱으로 몬스터를 소환하고, 마을을 점령해 보급선을 넓히며 끝없이 강해지는 용사로부터 마왕성을 지키는 모바일 역 타워 디펜스 게임.",
    overview: [
        "용사가 고향에서 출발해 마을 세 곳을 지나 마왕성으로 쳐들어오고, 플레이어는 마왕이 되어 몬스터 카드로 그 길을 막는다. 전투는 자동으로 진행되고 플레이어는 **어떤 카드를 언제, 어디에 쓸지**만 고른다.",
        "용사는 쓰러뜨려도 더 강해져서 다시 살아나기 때문에 승리 조건이 없고, 마왕성이 버틴 시간과 성과로 점수를 겨룬다. 한국어와 영어를 지원하며, Android 빌드를 기준으로 만들었다.",
        "**1인 개발**로 약 나흘 만에 Android 빌드까지 만들었고, Unity MCP로 에디터와 연결한 **AI 코딩 에이전트를 적극 활용**했다.",
    ],
    gameplay: [
        "슬라임 6장으로 시작하는 덱에서 4장을 손에 들고, 카드를 누르면 마나를 써서 가장 앞쪽 거점에 몬스터를 소환한다. 마나는 초당 1씩 차고, 몬스터가 죽으면 비용을 돌려받는다.",
        "용사 레벨이 오를수록 해골, 해골 검사, 유령 카드가 차례로 열린다. 카드는 끌어서 버릴 수 있다.",
        "마을을 점령하면 소환 거점이 되지만, **마왕성까지 이어진 마을만** 보급선으로 쓸 수 있다.",
        "영혼을 모으면 강화 3개 중 하나를 고른다. 용사는 베기·처형·돌진·방어·흡혈·광폭화·성검 같은 스킬과 장비로 점점 강해진다.",
        "점수는 생존 시간, 용사 처치, 마을 점령, 강화 획득으로 쌓이고 최고 기록 5개와 최근 기록 5개를 저장한다.",
    ],
    genres: ["역 타워 디펜스", "카드", "전략"],
    status: "prototype",
    startDate: "2026-09",
    platform: "Mobile (Android)",
    teamSize: 1,
    engine: "Unity 6",
    languages: ["C#"],
    frameworks: ["Input System", "ScriptableObject 데이터"],
    technologies: ["AI 코딩 에이전트 활용 개발 (Unity MCP)", "자동 전투 시뮬레이션", "보급선(연결된 거점) 판정", "JSON 이어하기 저장", "한국어/영어 현지화", "Android 진동(JNI)", "에디터 자동 검사·빌드 도구"],
    features: [
        {
            name: "카드 소환과 보급선 규칙",
            summary: "마나로 몬스터 카드를 쓰고, 마왕성과 이어진 점령 마을에서만 소환할 수 있게 한 핵심 규칙.",
            how: [
                "덱에서 4장을 손패로 유지하고, 카드를 쓰면 마나를 차감해 가장 앞쪽의 연결된 거점에 몬스터를 소환한다.",
                "점령한 마을 중 **마왕성까지 끊기지 않고 이어진 마을만** 보급선으로 인정해, 마을을 어디까지 지킬지가 전략이 되게 했다.",
                "몬스터가 죽으면 소환 비용을 돌려받아 공격적인 소환을 부담 없이 시도할 수 있다.",
            ],
            technologies: ["ScriptableObject (카드·몬스터 데이터)"],
            media: [{ type: "image", src: "/img/games/goaway-knight/card-draw.jpg", caption: "카드를 뽑아 몬스터를 소환하는 화면", fit: "contain" }],
        },
        {
            name: "성장하는 용사와 강화 선택",
            summary: "쓰러뜨릴수록 강해지는 용사와, 영혼을 모아 고르는 강화로 끝없는 생존 구조를 만든다.",
            how: [
                "용사는 레벨에 따라 스킬과 장비를 얻고, 쓰러지면 더 강해진 상태로 부활한다.",
                "영혼을 모으면 약 37종의 강화 효과 중 3개가 제시되고 하나를 고른다.",
                "마왕성 근처에서는 4초마다 포격이 떨어져 마지막 방어선 역할을 한다.",
            ],
        },
        {
            name: "데이터 기반 구성과 에디터 도구",
            summary: "카드·몬스터·마을·강화·용사 스킬과 장비를 ScriptableObject 데이터로 분리하고, 검사·빌드를 에디터 도구로 자동화했다.",
            how: [
                "게임 설정, 카드, 몬스터, 강화, 마을, 용사 장비와 스킬을 각각 데이터 에셋으로 두어 코드 수정 없이 밸런스를 바꿀 수 있다.",
                "덱·마나·보급선·부활·번역 키를 한 번에 검사하는 에디터 메뉴를 만들었다.",
                "장면과 데이터를 코드로 생성하는 도구와, 그래픽 없이 Android 빌드를 만드는 빌드 스크립트를 두었다.",
            ],
            technologies: ["Custom Editor", "Headless Build"],
        },
        {
            name: "모바일 대응",
            summary: "세로 화면, 터치 조작, 짧은 진동 피드백, 자동 저장으로 모바일 플레이에 맞췄다.",
            how: [
                "세로 고정 화면에 카드 손패를 아래에 두고, 전투 장면은 카메라 확대·히트스톱·흔들림으로 타격감을 준다.",
                "Android 진동 API를 JNI로 직접 호출해 14~46ms의 짧은 진동을 상황별로 낸다.",
                "진행 상황을 JSON으로 자동 저장해 앱을 다시 열어도 이어서 할 수 있다.",
                "241개 문구를 한국어·영어로 현지화하고, 설정에서 언어를 바꿀 수 있다.",
            ],
            technologies: ["JNI", "JSON 저장", "현지화"],
        },
    ],
    media: [
        { type: "image", src: "/img/games/goaway-knight/title.jpg", caption: "타이틀 화면", fit: "contain" },
        { type: "image", src: "/img/games/goaway-knight/gameplay.jpg", caption: "플레이 화면: 용사가 마을을 지나 마왕성으로 진격한다", fit: "contain" },
        { type: "image", src: "/img/games/goaway-knight/card-draw.jpg", caption: "카드로 몬스터를 소환하는 화면", fit: "contain" },
        { type: "image", src: "/img/games/goaway-knight/result.jpg", caption: "마왕성 함락 후 점수 결과 화면", fit: "contain" },
        { type: "image", src: "/img/games/goaway-knight/gameplay-en.jpg", caption: "영어 설정 플레이 화면", fit: "contain" },
    ],
    displayOrder: 3,
};
