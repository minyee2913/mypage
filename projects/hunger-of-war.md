# Hunger of War

> 마을이 곧 플레이어가 되어 식량을 빼앗는 멀티플레이 생존 대전 (4인 팀)

3차 세계대전 뒤 식량 보급이 끊긴 마을들이 서로의 식량을 빼앗아 자기 마을 주민을 살리는 PC 멀티플레이 생존 대전 게임.

- 페이지: https://human.minyee2913.net/projects/hunger-of-war
- 카테고리: 게임 개발
- 개발 기간: 2024
- 개발 상태: 개발 완료
- 플랫폼: PC
- 장르: 대전, 멀티플레이, 생존
- 팀 구성: 4인 팀 (개발 3인, 아트 1인)
- 담당 역할: 통신 구축, UI 디자인, 플레이어, 전투 시스템
- 기여도: 40%
- 게임 엔진: Unity
- 사용 언어: C#
- 프레임워크 / 라이브러리: Photon PUN
- 주요 기술: Photon 방 관리, OnPhotonSerializeView 상태 동기화, 상태 머신 NPC·동물

## 프로젝트 소개

3차 세계대전이 끝난 뒤 식량 보급이 끊긴 세계가 배경이다. **마을 자체가 하나의 플레이어**가 되어, 다른 플레이어에게서 식량을 빼앗아 자기 마을 주민을 살려야 한다.

개발 3명·아트 1명 팀에서 **통신 구축, UI 디자인, 플레이어, 전투 시스템**을 맡았다 (기여도 40%).

## 게임 플레이

- 게스트로 로그인하면 레벨이 표시되는 로비로 들어가고, 멀티플레이 방에 모인다 (방 화면에 '마을 2/8'처럼 표시).
- 마을 주민 한 명을 골라 마을 밖으로 나가 식량을 구한다.
- 주민이 죽으면 관이 되고, RIP 화면에 귀환 카운트다운이 뜬다.

## 설계 / 패턴

- PlayerSession: 플레이어 접속 단위
- GameManager: Photon 방 입장·생성 관리
- Damageable(추상) → NpcBase(추상)·AnimalBase(추상, 상태 머신) → 개별 NPC·동물
- Inventory · FieldItem · ItemBase: 아이템 획득과 사용

## 핵심 구현 기능

### Photon 멀티플레이

**동작 방식**

- PhotonNetwork로 방을 만들고 들어가며, 마스터 서버 연결과 방 입장 후 플레이어 세션 오브젝트를 네트워크로 생성한다.
- OnPhotonSerializeView로 위치·상태 값을 주기적으로 주고받아 동기화한다.

**사용 기술**: PUN

## 미디어

- 이미지: https://human.minyee2913.net/img/games/hunger-of-war/village.jpg (마을 전경)
- 이미지: https://human.minyee2913.net/img/games/hunger-of-war/villagers.jpg (외출할 주민 고르기)
- 이미지: https://human.minyee2913.net/img/games/hunger-of-war/field.jpg (마을 밖 필드)
- 이미지: https://human.minyee2913.net/img/games/hunger-of-war/lobby.jpg (로비 (게스트 로그인))
- 이미지: https://human.minyee2913.net/img/games/hunger-of-war/room.jpg (멀티플레이 방 (마을 2/8))
- 이미지: https://human.minyee2913.net/img/games/hunger-of-war/rip.jpg (주민이 죽으면 나오는 RIP 화면)
- 이미지: https://human.minyee2913.net/img/games/hunger-of-war/structure.jpg (클래스 구조도)
