# 고아의 공장

> 캐릭터가 직접 뛰어다니며 포장·출고를 해내는 아케이드 공장 게임 (1인 개발)

부도 직전의 부모님 공장을 물려받은 주인공이 되어, 박스를 주문하고 컨베이어로 오는 물품을 포장해 출고하는 아케이드 게임. 다른 공장 게임과 달리 모든 일을 캐릭터가 직접 움직여서 한다.

- 페이지: https://human.minyee2913.net/projects/orphans-factory
- 카테고리: 게임 개발
- 개발 기간: 2025
- 개발 상태: 개발 완료
- 플랫폼: PC
- 장르: 아케이드
- 팀 구성: 1인 개발
- 게임 엔진: Unity
- 사용 언어: C#
- 주요 기술: Blend Tree 4방향 이동, 경로 기반 컨베이어, Gizmos 경로 시각화

## 프로젝트 소개

다른 공장 게임처럼 자동화 설비를 짓는 대신, **플레이어가 캐릭터를 직접 움직여 모든 일을 해야 하는** 아케이드 게임이다. 부도 직전의 부모님 공장을 물려받은 주인공이 공장을 살려 낸다는 이야기다.

## 게임 플레이

- 화면 오른쪽 위에 이번에 생산할 물품(PLAN 1~3)이 나온다.
- 초기 자금으로 박스를 주문하고, 박스를 연 뒤 왼쪽 컨베이어로 들어온 물품을 담아 닫고 오른쪽 컨베이어로 내보낸다.
- 잘못 포장하면 클레임이 늘어난다. 화면에는 남은 업무 시간, 생산량(예: 0/60), 클레임 수가 표시된다.

## 설계 / 패턴

- Singleton: 매니저 클래스
- State: 게임 진행 상태
- Observer: 플레이어 주변 오브젝트를 실시간으로 추적

## 핵심 구현 기능

### 4방향 이동 애니메이션

**동작 방식**

- 위·아래·왼쪽·오른쪽 걷기 모션을 Blend Tree(2D Simple Directional)로 묶어 이동 방향 값만으로 전환한다.

**사용 기술**: Blend Tree

### 조립식 컨베이어

**동작 방식**

- 컨베이어를 방향·모양별 파츠로 나누고, 파츠마다 시작점·끝점·중간 지점 좌표를 저장했다.
- 물품은 그 좌표를 차례로 따라 이동하고, 다음 파츠로 넘어가며 이어진다.
- Gizmos로 이동 경로를 에디터 화면에 그려 파츠를 배치할 때 바로 확인한다.

## 링크

- [GitHub](https://github.com/minyee2913/orphans_factory)

## 미디어

- 이미지: https://human.minyee2913.net/img/games/orphans-factory/1.jpg (공장 바닥: 컨베이어와 박스)
- 이미지: https://human.minyee2913.net/img/games/orphans-factory/2.jpg (박스를 주문하고 포장하는 장면)
- 이미지: https://human.minyee2913.net/img/games/orphans-factory/3.jpg (포장한 박스를 출고 컨베이어로)
- 이미지: https://human.minyee2913.net/img/games/orphans-factory/plan.jpg (계획 목표 PLAN 1~3)
- 이미지: https://human.minyee2913.net/img/games/orphans-factory/worklog.jpg (업무 기록: 남은 시간·생산량·클레임)
- 이미지: https://human.minyee2913.net/img/games/orphans-factory/conveyor.jpg (방향·모양별 컨베이어 파츠)
- 이미지: https://human.minyee2913.net/img/games/orphans-factory/path.jpg (Gizmos로 그린 컨베이어 이동 경로)
- 이미지: https://human.minyee2913.net/img/games/orphans-factory/blendtree.jpg (4방향 이동 Blend Tree)
