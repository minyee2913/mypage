# UnityUtils

> 게임마다 반복되는 체력·스탯·카메라 연출을 모아 둔 Unity 공용 라이브러리

Unity 개발을 간소화하려고 만든 C# 공용 모듈 모음. 체력·스탯·버프·카메라 연출·사운드·데미지 표시 등을 IGNOTUS, 생존 전략! 등 여러 게임에서 함께 쓴다.

- 페이지: https://human.minyee2913.net/projects/unity-utils
- 카테고리: 프로그램 개발
- 개발 기간: 2025.03 ~ 현재
- 개발 상태: 개발 중
- 플랫폼: Unity 라이브러리
- 게임 엔진: Unity
- 사용 언어: C#
- 프레임워크 / 라이브러리: Cinemachine 3 (필수 패키지)
- 주요 기술: 이벤트 기반 데미지 파이프라인, 버프 기반 스탯 계산, 코루틴 카메라 연출, 제네릭 싱글톤

## 프로젝트 소개

Unity 개발을 간소화하려고 여러 게임에서 반복해서 쓰는 체력, 스탯, 카메라 연출, 쿨타임 같은 기능을 한 저장소로 모았다.

이 사이트의 **IGNOTUS, 생존 전략!, Albedo, 하늘오름, 내가 찻잔이라니!**가 UnityUtils를 쓴다.

## 핵심 구현 기능

### HealthObject: 취소·수정할 수 있는 데미지 이벤트

피격·가해·처치·회복을 이벤트로 열어 두고, 최종 피해가 정해지기 전에 끼어들 수 있게 했다.

**동작 방식**

- OnDamage·OnGiveDamage·OnKill·OnHeal·OnDamageFinal 같은 이벤트를 Start/Awake에서 등록한다.
- 피해를 주고받는 단계의 이벤트에서는 피해량을 바꾸거나 피해 자체를 취소할 수 있다.
- Final 계열 이벤트는 모든 계산이 끝난 최종 피해를 받기만 한다.

### StatController: 기초값은 고정, 변화는 버프로만

**동작 방식**

- 처음 정한 기초값은 바뀌지 않고, 이후의 모든 수치 변화는 버프로만 일어난다. 그래서 버프를 지우면 언제나 원래 값으로 돌아간다.
- 버프는 기초값에 더하기, 퍼센트 증가처럼 계산 방식을 고를 수 있다.
- 스탯은 문자열 키로 구분해서, 키만 새로 주면 스탯 종류를 얼마든지 늘릴 수 있다.

### CamEffector: 어디서나 부르는 카메라 연출

**동작 방식**

- CamEffector.Current로 지금 화면을 찍는 카메라의 연출 컴포넌트를 바로 가져온다.
- 화면 흔들기(Shake), 확대(CloseUp), 원래대로(CloseOut)를 코루틴으로 구현했다. Cinemachine 3을 기반으로 한다.

**사용 기술**: Cinemachine, Coroutine

### 그 밖의 모듈

**동작 방식**

- Cooldown(쿨타임), RangeController(범위 안 오브젝트 감지), Projectile2D, SoundManager, UIBasePanel(UI 패널 추상 클래스)
- IndicatorManager(데미지 숫자 같은 텍스트 오브젝트 생성), Singleton(제네릭 추상 클래스), Kits(편의 함수)
- 저장소에는 그라디언트 이미지·텍스트, 로딩 화면 전환, 레이어 설정, 회전 오브젝트 스크립트도 들어 있다.

## 링크

- [GitHub](https://github.com/minyee2913/unityUtils)

## 미디어

- 이미지: https://human.minyee2913.net/img/games/unity-utils/health.jpg (HealthObject 인스펙터)
- 이미지: https://human.minyee2913.net/img/games/unity-utils/health-events.jpg (HealthObject 이벤트 등록 예시)
- 이미지: https://human.minyee2913.net/img/games/unity-utils/stat.jpg (StatController 인스펙터 (키별 스탯 정의))
- 이미지: https://human.minyee2913.net/img/games/unity-utils/stat-buff.jpg (스탯 버프 추가와 계산 예시)
