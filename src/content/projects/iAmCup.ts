import type { Project } from "../types";

// 출처: 게임잼 팀 저장소(비공개)의 코드·씬·에셋과 git 커밋 기록 (2026-04-30 ~ 2026-05-02).
// 담당 범위는 커밋 기록으로 확인한 것만 적는다. 팀 인원(4명)과 게임잼 1등은 작성자 확인. 인게임 스크린샷 3장은 작성자 제공.
export const iAmCup: Project = {
    id: "i-am-cup",
    category: "unity",
    accent: "#d9a35b",
    intro: "steam",
    reveal: "drain",
    title: "내가 찻잔이라니!",
    subtitle: "찻잔이 되어 카페 주문을 처리하는 2.5D 액션 게임 (2026 하제 게임잼 1등)",
    description:
        "어느 날 찻잔이 되어 버린 주인공이 3D 카페 안을 뛰어다니며 재료를 모아 음료를 완성하고, 시간 안에 손님의 주문을 처리하는 2.5D 액션 게임.",
    logo: "/img/games/i-am-cup/logo.png",
    hero: "/img/games/i-am-cup/cafe-inside.jpg",
    cover: "/img/games/i-am-cup/title.jpg",
    overview: [
        "2026 하제 게임잼에서 4인 팀으로 사흘 동안 만들어 **1등**을 한 게임이다. 2D 스프라이트 찻잔이 3D 카페 공간을 평면처럼 이동하고, 회전 지점에서 이동 평면을 90도씩 돌려 카페 구석구석을 오간다.",
        "팀에서 **게임플레이 프로그래밍 전반**을 맡아 플레이어, 주문·제조 루프, 상호작용, 보스전, 연출을 구현했다.",
    ],
    gameplay: [
        "손님이 들어와 무작위 메뉴를 주문하면 제한 시간이 시작된다. 제한 시간은 120초에서 주문마다 10초씩 줄어 최소 30초까지 짧아진다.",
        "찻잔이 재료와 기계 단계를 순서대로 모으면 음료가 완성된다. 레시피는 에스프레소, 라테, 에이드, 스무디, 차 등 16종이다.",
        "카운터의 벨을 울려 음료를 내면, 맞으면 손님이 마시고 틀리면 찻잔을 던진다. 시간이 다 되면 손님이 카운터를 내리쳐 피해를 입는다.",
        "높은 곳에서 떨어지면 높이만큼 피해를 입고, 개수대에서 씻으면 회복하지만 모은 재료가 사라진다. 로프와 로켓으로 이동할 수도 있다.",
        "부엌칼을 들고 빈손으로 벨을 울리면 손님과의 보스전이 시작된다. 손님은 조준 공격과 찻잔 던지기를 쓰고, 몸에 생기는 약점을 부숴야 한다.",
    ],
    genres: ["액션", "2.5D", "게임잼"],
    status: "completed",
    startDate: "2026-04",
    endDate: "2026-05",
    platform: "PC",
    teamSize: 4,
    teamComposition: "커밋 기록 기준 분담: 게임플레이 프로그래밍 / UI·데이터·스토리 / 맵 제작 / 초기 프로토타입",
    roles: ["게임플레이 프로그래밍 전반", "보스전", "연출", "공용 유틸리티"],
    contribution: "커밋 64개 중 37개",
    engine: "Unity 6 (URP)",
    languages: ["C#"],
    frameworks: ["Cinemachine", "Input System", "DOTween", "UnityUtils (직접 만든 라이브러리)"],
    technologies: ["2.5D 평면 이동과 평면 회전", "ScriptableObject 레시피 데이터", "LineRenderer 절차적 로프", "보스 패턴 상태 머신"],
    features: [
        {
            name: "주문·제조 루프",
            summary: "손님 주문, 제한 시간, 재료 수집, 음료 판정, 제출 연출로 이어지는 게임의 기본 흐름.",
            how: [
                "재료·기계·주문을 ScriptableObject로 정의하고, 찻잔이 모은 순서가 레시피와 맞으면 음료로 바꾼다.",
                "주문마다 제한 시간이 10초씩 줄어 점점 바빠지도록 했다.",
                "정답이면 손님이 찻잔을 들어 마시고, 오답이면 찻잔을 던지는 장면을 DOTween으로 연출했다.",
                "상황에 따라 번호가 붙은 상호작용 안내를 동적으로 띄워, 숫자 키로 고르게 했다.",
            ],
            technologies: ["ScriptableObject", "DOTween"],
            media: [{ type: "image", src: "/img/games/i-am-cup/order.jpg", caption: "주문 화면: 주문 번호와 메뉴, 남은 시간, 레시피 버튼" }],
        },
        {
            name: "2.5D 이동과 카메라",
            summary: "3D 공간 안에서 2D 찻잔이 평면 이동하고, 회전 지점에서 이동 평면을 돌린다.",
            how: [
                "찻잔은 자신의 오른쪽 축을 따라 좌우로 움직이고, 회전 지점이나 비누 버프로 이동 평면을 90도 회전한다.",
                "점프, 대시, 낙하 높이에 비례한 피해를 구현했다.",
                "Cinemachine 카메라가 레이캐스트로 벽을 피해 찻잔을 따라간다.",
            ],
            technologies: ["Cinemachine", "Raycast"],
        },
        {
            name: "절차적 로프",
            summary: "마우스로 조준해 쏘는 로프를 여러 가닥의 LineRenderer로 그렸다.",
            how: [
                "로프를 여러 가닥으로 나눠 나선형으로 꼬고 Perlin 노이즈로 흔들어 살아 있는 느낌을 냈다.",
                "마우스 광선을 플레이어의 이동 평면에 투영해 2.5D 공간에서도 정확히 조준한다.",
            ],
            technologies: ["LineRenderer", "Perlin Noise"],
        },
        {
            name: "손님 보스전",
            summary: "쿨다운 기반 패턴과 예고 공격, 약점 파괴로 진행되는 보스전.",
            how: [
                "손님이 쿨다운에 따라 조준 공격과 찻잔 던지기를 고르고, 공격 전에 예고 표시를 띄운다.",
                "손님 몸에 약점이 생기고, 약점을 부술 때마다 체력 100 중 10씩 깎인다.",
                "피격을 이벤트로 알리고 상황에 따라 취소할 수 있는 체력 컴포넌트(직접 만든 공용 라이브러리)를 썼다.",
            ],
            media: [{ type: "image", src: "/img/games/i-am-cup/boss.jpg", caption: "손님 보스전: 식칼을 들고 손님의 공격 예고 범위를 피하는 화면" }],
        },
    ],
    achievements: [{ type: "award", title: "2026 하제 게임잼 1등" }],
    externalLinks: [{ type: "itch", url: "https://minyee2913.itch.io/i-am-cup", label: "itch.io 페이지 (브라우저에서 플레이)" }],
    media: [
        { type: "image", src: "/img/games/i-am-cup/title.jpg", caption: "타이틀 화면" },
        { type: "image", src: "/img/games/i-am-cup/order.jpg", caption: "주문 화면: 찻잔이 된 주인공과 손님의 주문" },
        { type: "image", src: "/img/games/i-am-cup/boss.jpg", caption: "손님 보스전" },
        { type: "image", src: "/img/games/i-am-cup/cafe-front.jpg", caption: "스토리 컷신 아트: 카페 외관" },
        { type: "image", src: "/img/games/i-am-cup/counter.jpg", caption: "스토리 컷신 아트: 카운터" },
        { type: "image", src: "/img/games/i-am-cup/cafe-inside.jpg", caption: "스토리 컷신 아트: 카페 내부" },
    ],
    displayOrder: 5,
};
