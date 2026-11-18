# Albedo

> 빛 효과와 로봇 동료로 싸우는 탈출 액션 게임 (선린톤 11th)

빛 효과로 스타일을 강조하고, 플레이어가 직접 스킬을 쓰지 않고 다른 주체에게 맡기는 방식으로 전투가 진행되는 탈출 액션 게임.

- 페이지: https://human.minyee2913.net/projects/albedo
- 카테고리: 게임 개발
- 개발 기간: 2025
- 플랫폼: PC
- 장르: 액션, 탈출
- 팀 구성: 4인 팀 (개발 3인, 아트 1인)
- 담당 역할: 팀장, 광원 효과, 플레이어, 상호작용, 로봇, 맵 시스템
- 기여도: 75%
- 게임 엔진: Unity
- 사용 언어: C#
- 프레임워크 / 라이브러리: UnityUtils (직접 만든 라이브러리)

## 프로젝트 소개

추락해 미지의 행성에 고립된 주인공이 괴물 사이에서 광물을 캐 본함에 에너지를 보내고, 그 지원으로 탈출선을 찾는 게임이다.

선린톤 11th에서 '담다'라는 주제에 맞춰 팀으로 제작했다.

## 게임 플레이

- 로봇이 플레이어를 따라다니고, 플레이어는 계속 오른쪽으로 나아가야 한다.
- 광물 근처에서 우클릭을 연타해 캐고, E로 들어 로봇에게 가져가 F로 로봇 에너지를 충전한다.
- 좌클릭으로 공격하고, 로봇과 상호작용하면 로봇 에너지를 써서 우주선에 스킬을 요청한다. 요청한 스킬은 주문 대기열에 담겼다가 발동된다.

## 설계 / 패턴

- Singleton: 매니저 클래스 관리
- Observer: 상황에 대응하는 이벤트 시스템
- Component: 플레이어 기능을 컴포넌트 단위로 분리

## 핵심 구현 기능

### 대각선 지면 이동 보정

기울어진 지면을 따라 자연스럽게 이동하도록 입력 벡터를 보정했다.

**구현 목적**: 단순한 좌우 이동이 아닌 입체적인 느낌을 주기 위해 지면을 약간 대각선으로 만들었고, 플레이어 이동 경로를 지면과 맞춰야 했다.

**동작 방식**

- 입력 축 값에 보정값을 더해 이동 방향을 지면 기울기에 맞춘다.
- 보정 수치는 직접 반복 테스트하며 맞췄다.

*포트폴리오에 실은 코드 캡처를 옮겨 적음*

```csharp
public void Move(Vector2 axis)
{
    if (stopMove > 0) return;

    moveDelta = axis;
    moveDelta.y += axis.x * 0.08f;
    moveDelta.x -= axis.y * 0.1f;

    transform.Translate(moveDelta.normalized * stat.GetResultValue("moveSpeed") * Time.deltaTime);
}
```

### 로봇을 통한 스킬 요청과 대기열

**동작 방식**

- 로봇 에너지를 소모해 우주선에 스킬을 요청하고, 요청된 스킬은 대기열에 담겼다가 순서대로 발동된다.

### UnityUtils 기반 공격 처리

**동작 방식**

- 직접 만든 UnityUtils의 HealthObject로 대상에게 데미지를 주는 방식으로 공격 코드를 간결하게 처리했다.

- [UnityUtils 저장소](https://github.com/minyee2913/unityUtils)

## 기술적 문제 해결

### 대각선 지면에서 무작위 좌표 구하기 [해결]

- 문제 상황: 지면이 대각선이라 x, y를 각각 무작위로 뽑으면 맵 밖의 좌표가 나온다.
- 원인 분석: 맵의 유효 범위가 축에 평행한 사각형이 아니라 기울어진 형태라서 x와 y의 범위가 서로 종속된다.
- 해결 과정:
  - 먼저 전체 맵 범위 안에서 무작위 X 좌표를 구한다.
  - 그 X 좌표를 넣어 해당 위치에서 맵 범위 안에 있는 무작위 Y 좌표를 구하는 함수를 만들었다.
- 적용한 기술 / 접근: 맵 X 범위 계산(GetXBoundsOfMaps), X 기준 맵 내부 좌표 계산(GetPosInMap)
- 결과: 기울어진 맵 안에서 무작위 위치를 얻을 수 있게 되었다.

## 개발 결과 및 성과

- [출품] 선린톤 11th 출품작 - 주제 '담다'에 맞춰 제작

## 링크

- [YouTube](https://youtu.be/eC4HczYUfWA)
- [GitHub](https://github.com/sunrinton2025/amazing_something)
- [다운로드](https://github.com/sunrinton2025/amazing_something/releases/download/dd/albedo.zip)

## 미디어

- 영상: https://youtu.be/eC4HczYUfWA (플레이 영상)
- 이미지: https://human.minyee2913.net/img/games/albedo/1.png
- 이미지: https://human.minyee2913.net/img/games/albedo/2.png
- 이미지: https://human.minyee2913.net/img/games/albedo/3.png
