# 마인크래프트에서 만나는 제주바다

> 한국해양과학기술원 제주연구소 교육용 Minecraft 맵의 확장 기능 개발 (외주 개발·유지보수)

한국해양과학기술원 제주연구소의 '찾아가는 해양과학교실'에서 쓰는 Minecraft Bedrock 교육 콘텐츠. 조간대 생물 채집, 생물 도감, 배양 실험 미니게임을 Script API로 개발하고 기존 기능을 유지보수했다.

- 페이지: https://human.minyee2913.net/projects/kiost-jeju
- 카테고리: 마인크래프트 개발
- 개발 기간: 2024.07 ~ 2025
- 개발 상태: 개발 완료
- 플랫폼: MCBE ADDON
- 장르: 교육, 외주
- 사용 언어: JavaScript
- 프레임워크 / 라이브러리: Minecraft Script API (@minecraft/server), @minecraft/server-ui, Blockbench (커스텀 엔티티)
- 주요 기술: dynamicProperty 저장, 비동기 처리, 커스텀 엔티티 UI

## 프로젝트 소개

한국해양과학기술원 제주연구소가 학생들을 찾아가 진행하는 '상상이 현실이 되는 찾아가는 해양과학교실'에서 쓰는 마인크래프트 콘텐츠다. 네이버 카페 '우리들의 마인크래프트 공간'을 운영하는 (주)우마공크리에이티브와 계약해 참여했다.

KIOST가 교육 페이지에서 제주바다 맵과 워크북·관찰 가이드북을 공개 배포하고, 채집·배양·추출·양식배양·관찰 퀘스트로 해양과학 실험을 체험하게 한다. 그중 **QUEST 4 양식배양 실험**(수조에 알맞은 설정값 찾기)과 **QUEST 5 조간대 관찰 탐구**(조간대 생물 채집·관찰)가 아래 작업에 해당한다.

조간대 맵을 추가하는 계획에 맞춰 **조간대 콘텐츠 전반**(생물 추가·배치·채집, 도감, 배양 실험)을 맡았고, 기존 기능의 유지보수와 개선도 함께 했다. 연구소에서 구역별 생물 수와 종류, 점수 계산 방법, 기획안을 받아 협의하며 진행했다.

## 개발 연혁

- 2024-07: 제주연구소 홍보 교육기부 콘텐츠 제2차 개발 용역 (~2024-12)
- 2025-02: 온라인 교육 홍보 콘텐츠 유지보수 용역 시작

## 핵심 구현 기능

### 조간대 생물 채집

블록을 캐서 얻는 채집과 채집통으로 찾는 탐사 채집 두 가지.

**동작 방식**

- 채집할 수 있는 블록 근처에 가면 효과음과 좌클릭 아이콘으로 알려 준다. 플레이어 주변 블록을 검사하되, 아이콘이 너무 많이 뜨지 않게 확률로 표시한다.
- 캐낸 블록은 주기적으로 복구하고, 그 위치의 청크가 로드되지 않았으면 다음 복구 때 다시 시도한다.
- 연구소 자료대로 좌표 구역을 나누고, 구역 안의 무작위 좌표에 정해진 수만큼 생물을 소환한다.
- 멀리 있는 생물 엔티티는 잠시 없애 엔티티가 너무 많아져 느려지는 것을 막는다.

### 조간대 생물 도감

**동작 방식**

- 현황실 전광판과 PC 화면에서 도감을 본다. 처음 얻은 생물은 '???'로 보이고, 현미경으로 관찰해야 도감에 등록된다.
- 생물마다 크기·수심·서식 위치·식성 같은 상세 정보를 보여 주고, 기록은 dynamicProperty에 저장한다.
- Bedrock Edition에는 월드 안에 글과 그림을 그대로 띄우는 기능이 없어서, 별도 엔티티로 전광판을 만들고 주기적으로 갱신했다.

**사용 기술**: dynamicProperty, @minecraft/server-ui

### 배양 실험 미니게임

**동작 방식**

- 클로렐라·미역·성게·돌돔 수조의 온도와 광주기를 정하면, 설정에 따라 손실이 생겨 생물 수가 줄어든다. 회차마다 슬러지를 걷어 내야 한다.
- 끝나면 회차별 점수와 살아남은 개체 수가 적힌 결과지가 나온다. 점수는 연구소가 준 계산 방법대로 구현했다.
- 연구소의 처음 기획은 정답을 입력하는 퀴즈였는데, 더 게임답게 바꾸자고 제안해 협의 끝에 지금 형태가 되었다.

## 링크

- [KIOST 공식 페이지: 마인크래프트에서 만나는 제주바다](https://www.kiost.ac.kr/edu/sub05_05.do)
- [제주바다 맵·워크북 다운로드 (KIOST)](https://www.kiost.ac.kr/edu/sub05_05.do)

## 미디어

- 이미지: https://human.minyee2913.net/img/games/kiost-jeju/map.jpg (마인크래프트로 옮긴 제주 바다 맵)
- 이미지: https://human.minyee2913.net/img/games/kiost-jeju/collect.jpg (조간대 생물 채집: 채집할 수 있는 곳에 좌클릭 아이콘이 뜬다)
- 이미지: https://human.minyee2913.net/img/games/kiost-jeju/board.jpg (현황실 전광판 도감 (처음 얻은 생물은 ???))
- 이미지: https://human.minyee2913.net/img/games/kiost-jeju/dex.jpg (PC 화면의 생물 도감)
- 이미지: https://human.minyee2913.net/img/games/kiost-jeju/microscope.jpg (현미경으로 관찰해 도감에 등록)
- 이미지: https://human.minyee2913.net/img/games/kiost-jeju/dex-detail.jpg (생물 상세 정보 (크기·수심·서식 위치·식성))
- 이미지: https://human.minyee2913.net/img/games/kiost-jeju/aquarium.jpg (배양 실험 수조)
- 이미지: https://human.minyee2913.net/img/games/kiost-jeju/tank.jpg (수조 컨트롤러: 클로렐라·미역·성게·돌돔)
- 이미지: https://human.minyee2913.net/img/games/kiost-jeju/tank-ui.jpg (수조 온도와 광주기 설정)
- 이미지: https://human.minyee2913.net/img/games/kiost-jeju/result.jpg (실험 결과지: 회차별 점수와 생존 개체 수)
