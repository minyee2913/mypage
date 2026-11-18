# mcCmd

> 마인크래프트 명령어 문법으로 코딩하는 스크립트 언어 (C++ 인터프리터)

마인크래프트 명령어처럼 생긴 문법으로 코딩해 보고 싶어서 만든 스크립트 언어. C++로 토큰 분해부터 스코프와 함수 호출까지 인터프리터를 직접 구현했다.

- 페이지: https://human.minyee2913.net/projects/mccmd
- 카테고리: 프로그램 개발
- 개발 기간: 2023.09 ~ 2023.10
- 개발 상태: 개발 완료
- 플랫폼: 인터프리터 (콘솔)
- 사용 언어: C++
- 주요 기술: 토큰 분해, 스코프 체인, 인터프리터, VS Code 확장

## 프로젝트 소개

마인크래프트 명령어로 코딩을 해 보고 싶다는 생각에서 시작한 언어다. 같은 저장소 그룹에 문법 문서와 VS Code 확장도 있다.

## 핵심 구현 기능

### 문법

**동작 방식**

- @는 변수·함수 정의, /는 명령·함수 호출, #...!#는 코드 블록이다.
- 전역 변수와 지역 변수를 모두 지원한다.

*포트폴리오 114쪽의 문법 예시를 옮겨 적었다.*

```mccmd
@ data[type=string];

@ /input #
    @ data1[type=string];
    /say "지역 변수를 입력하세요: ";
    /replaceitem @data1;
    /say "전역 변수를 입력하세요: ";
    /replaceitem @data;
!#;

@ /output #
    /input;
    /say "전역변수 @data*";
    /say "지역변수 @data1*";
!#;

/output;
```

### 토큰 분해와 명령 구조

**동작 방식**

- 코드 파일 전체를 문자열로 읽고 한 글자씩 검사한다. ;를 만나면 직전 위치부터 지금까지를 잘라 한 줄로 저장하는 식으로 코드를 줄 단위로 나눈다.
- 나눈 줄은 Command 구조체에 담기고, 이때 정의(define)인지 호출(callFunction)인지가 정해진다.
- 매개변수·문자열·코드 블록은 띄어쓰기를 기준으로 한 번 더 나눈다 (ChildToken).

### 스코프와 함수

**동작 방식**

- 전역·지역 스코프가 함수와 변수를 저장하고 찾는다. 실행은 전역 스코프에서 시작한다.
- 함수는 자기 지역 스코프를 가진다. 블록 안의 코드는 토큰 상태로 보관해 두었다가 호출될 때 실행한다.
- 함수나 코드 블록이 만든 스코프는 그것을 정의한 스코프를 부모로 삼아, 바깥 변수를 차례로 찾아 올라간다.

## 링크

- [mcCmd-plus (C++ 인터프리터)](https://github.com/mcCmd-language/mcCmd-plus)
- [문법 문서](https://github.com/mcCmd-language/mcCmd-docs/tree/main/docs)
- [VS Code 확장](https://github.com/mcCmd-language/mcCmd-vsCode-extension)

## 미디어

- 이미지: https://human.minyee2913.net/img/games/mccmd/logo.jpg (mcCmd 로고)
- 이미지: https://human.minyee2913.net/img/games/mccmd/syntax.jpg (문법 예시: 변수 정의(@), 명령 호출(/), 코드 블록(#…!#))
- 이미지: https://human.minyee2913.net/img/games/mccmd/tokenize.jpg (코드를 한 글자씩 검사해 ; 단위로 나누는 부분)
- 이미지: https://human.minyee2913.net/img/games/mccmd/command.jpg (나눈 코드를 Command 구조체에 담고 종류(정의·호출)를 정한다)
- 이미지: https://human.minyee2913.net/img/games/mccmd/childtoken.jpg (매개변수·문자열·코드 블록을 다시 나누는 ChildToken)
- 이미지: https://human.minyee2913.net/img/games/mccmd/implement.jpg (Command 정보로 실제 기능을 수행하는 Implementing)
- 이미지: https://human.minyee2913.net/img/games/mccmd/scope.jpg (전역·지역 스코프에서 함수와 변수를 저장하고 찾는다)
- 이미지: https://human.minyee2913.net/img/games/mccmd/function.jpg (함수는 지역 스코프를 갖고, 정의한 스코프를 부모로 삼는다)
