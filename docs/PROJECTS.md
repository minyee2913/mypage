# 프로젝트 데이터 관리

사이트에 보이는 프로젝트 정보는 전부 `src/content/` 한 곳에서 관리한다.
데이터를 고치고 `npm run build` 하면 아래 결과물이 같은 데이터로 함께 다시 만들어진다.

| 결과물 | 경로 |
| --- | --- |
| 화면 (React) | `/`, `/projects/`, `/projects/<slug>` |
| 정적 HTML (JS 없이 읽힘) | `build/index.html`, `build/projects/<slug>.html` … |
| 메타데이터 / JSON-LD | 각 HTML `<head>` |
| 기계용 자료 | `/projects.json`, `/projects/<slug>.md`, `/llms.txt`, `/sitemap.xml` |
| 다운로드 페이지 / releases.json 대상 저장소 | `getGithubRepo()` 로 github·download 링크에서 추출 |

## 파일 구성

```
src/content/
  types.ts            데이터 스키마 (필드 설명 주석 포함)
  site.ts             개발자 소개, 소셜 링크, 사이트 URL
  index.ts            카테고리, 프로젝트 등록 순서, 조회 헬퍼
  validate.ts         빌드 시 데이터 검사
  export.ts           Markdown / JSON / llms.txt / sitemap 생성
  projects/
    ignotus.ts  baldo.ts  luminous.ts   대표 프로젝트 (프로젝트당 파일 하나)
    unity.ts  minecraft.ts               나머지 프로젝트
```

## 새 프로젝트 추가

1. `public/img/games/<폴더>/` 에 스크린샷을 넣는다.
2. `src/content/projects/<이름>.ts` 를 만든다. 필수 필드는 `id`, `category`, `title` 뿐이다.

   ```ts
   import type { Project } from "../types";

   export const myGame: Project = {
       id: "my-game",                // 바꾸지 않는 고유 ID (releases.json 키)
       slug: "my-game",              // URL: /projects/my-game (생략하면 id)
       category: "unity",            // "unity" | "minecraft"
       title: "My Game",
       subtitle: "한 줄 소개",
       description: "목록·검색 결과에 쓰이는 짧은 요약",
       status: "in-development",     // released | in-development | completed | paused | prototype
       startDate: "2026-03",
       releaseTarget: "2027-H1",     // 출시 전일 때만. YYYY | YYYY-H1 | YYYY-H2 | YYYY-MM
       // 상세 페이지 상단(게임 공식 사이트 느낌) — 모두 선택 항목
       tagline: "공식 캐치프레이즈",     // 스토어 등 공식 문구가 있을 때만
       highlights: ["공식 주요 특징"],    // ABOUT 탭에 '주요 특징'으로 표시
       hero: "/img/games/my-game/keyart.jpg", // 배경 키아트. 없으면 첫 스크린샷(세로 이미지는 흐리게)
       logo: "/img/games/my-game/logo.png",   // 투명 PNG 로고. 있으면 제목 대신 표시
       cover: "/img/games/my-game/header.jpg",// 목록 카드 썸네일
       accent: "#e8343f",            // 버튼·탭 강조색. 없으면 기본 금색
       intro: "embers",              // 배경 입자: embers slash magic stars steam motes blocks dust notes wind smog speed
       reveal: "burn",               // 진입 연출: burn slash cards warp drain light blocks pixels
                                     //   toss clock shatter scan portal ripple dash beat purify
       platform: "PC",
       teamSize: 3,
       teamComposition: "개발 2인, 아트 1인",
       roles: ["전투 시스템"],
       engine: "Unity",
       languages: ["C#"],
       features: [
           {
               name: "기능 이름",
               purpose: "왜 만들었는지",
               how: ["동작 방식 1", "동작 방식 2"],
               technologies: ["사용 기술"],
               considerations: ["고려한 점"],
               code: { language: "csharp", code: "...", caption: "코드 출처" },
           },
       ],
       technicalChallenges: [
           {
               title: "문제 제목",
               status: "partial",        // solved | partial | unsolved
               problem: "문제 상황",
               cause: "원인 분석",
               process: ["해결 과정"],
               result: "현재 결과",
               remaining: "남은 문제",
               metrics: [{ label: "프레임 타임", before: "33ms", after: "16ms" }],
           },
       ],
       media: [
           { type: "youtube", src: "https://youtu.be/XXXXXXXXXXX", caption: "플레이 영상" },
           { type: "image", src: "/img/games/my-game/1.png", caption: "설명" },
           // 세로 스크린샷은 fit: "contain"
       ],
       externalLinks: [{ type: "github", url: "https://github.com/..." }],
       featured: false,              // true 면 메인 추천 카드에 노출 (이미지 필요)
   };
   ```

3. `src/content/index.ts` 의 `ALL_PROJECTS` 배열에 추가한다. 카테고리 안에서는 이 순서대로 보이며 `displayOrder` 가 있으면 그 값이 우선한다.
4. `npm run build` → `npm run serve` → 다른 터미널에서 `npm run verify` 로 확인한다.

빌드 중 `validateProjects()` 가 다음을 검사하고, 문제가 있으면 빌드를 멈춘다.

- id / slug 중복과 형식, 카테고리, 날짜 형식(YYYY, YYYY-MM, YYYY-MM-DD)
- 링크가 https 인지, YouTube ID 를 읽을 수 있는지, 로컬 이미지 파일이 실제로 있는지
- 기술 문제 기록: `solved` 인데 `remaining` 이 있거나, 미해결인데 현재 상태가 없는 경우
- 토큰·개인키·로컬 경로처럼 공개하면 안 되는 문자열

## 작성 원칙

- 확인된 사실만 적는다. 추측한 역할, 수치, 수상 실적은 넣지 않는다.
- 해결하지 못한 문제는 `status: "unsolved"` 나 `"partial"` 로 적고 `remaining` 에 남은 문제를 쓴다.
- `metrics` 에는 실제로 측정한 값만 넣는다.
- 비공개 저장소 주소, 내부 경로, 키 값은 넣지 않는다. 이 데이터는 그대로 `/projects.json` 으로 공개된다.

## 빌드와 배포

```
npm run build      # react-scripts build + scripts/prerender.mjs
npm run serve      # build/ 를 GitHub Pages 규칙으로 서빙 (http://localhost:5055)
npm run verify     # JS 없이 HTTP 로만 검사 (기본 http://localhost:5055)
npm run deploy     # build → gh-pages 브랜치로 배포
npm run verify:prod  # 배포 후 실제 사이트 검사
```

GitHub Pages 동작 방식에 맞춘 파일 배치:

- `/projects/<slug>` → `projects/<slug>.html` (200)
- `/projects/` → `projects/index.html`, `/projects` 는 `/projects/` 로 301
- 없는 경로 → `404.html` (상태 코드 404)
- 이전 주소 `/project?sec=..&pj=..` → `project.html` (noindex, 브라우저에서 새 주소로 이동)

배포 설정은 바꿀 것이 없다. `CNAME`(human.minyee2913.net)과 gh-pages 브랜치 배포를 그대로 쓴다.
`.github/workflows/update-releases.yml` 은 `public/releases.json` 만 갱신하므로, 사이트에 반영하려면 다시 배포해야 한다.

## 설명 문장 꾸미기

- `**강조할 부분**` 처럼 감싸면 상세 페이지에서 강조색 형광펜으로 보이고, Markdown(`/projects/<slug>.md`)에서는 굵은 글씨가 된다. 메타 설명·llms.txt 에서는 표시가 빠진다. 문단마다 한두 군데만 쓰는 것을 권장한다. 짝이 맞지 않으면 빌드 검사에서 걸린다.
- 기술 용어 풀이는 `src/content/glossary.ts` 에 있다. 여기 등록된 용어가 설명에 나오면 점선 밑줄과 툴팁이 자동으로 붙는다(문장마다 첫 등장만).
- `history: [{ date: "2025-03", text: "..." }]` 로 개발 연혁을 넣으면 ABOUT 탭에 연혁으로 표시된다.

