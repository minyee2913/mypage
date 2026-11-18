# 2913SimpleDB

> 데코레이터로 테이블을 정의하는 BDSX용 SQLite 패키지 (npm 공개)

클래스 필드에 데코레이터를 붙이면 SQLite 테이블과 쿼리가 만들어지는 TypeScript 데이터베이스 패키지. 마인크래프트 서버 프레임워크 BDSX에서 쓰려고 만들어 npm에 공개했다.

- 페이지: https://human.minyee2913.net/projects/2913-simple-db
- 카테고리: 프로그램 개발
- 개발 기간: 2023.09
- 개발 상태: 개발 완료
- 플랫폼: npm 패키지 (@bdsx/2913simpledb)
- 사용 언어: TypeScript
- 프레임워크 / 라이브러리: sqlite-sync, BDSX
- 주요 기술: 데코레이터, SQLite, 스키마 자동 반영

## 프로젝트 소개

마인크래프트 Bedrock 서버 프레임워크 BDSX(Node.js·ChakraCore)에서 쓰려고 만든 패키지라 sqlite-sync를 기반으로 했다. 쿼리를 손으로 쓰다 빠뜨릴 걱정 없이 데이터를 다루는 것이 목표다.

## 핵심 구현 기능

### 데코레이터로 테이블 정의

**동작 방식**

- @Database.field(TEXT / INTEGER / NUMERIC / REAL / BOOLEAN)를 클래스 필드에 붙이고, PRIMARY\_KEY·NOTNULL·AUTOINCREMENT·UNIQUE 옵션을 준다.
- 클래스 필드를 읽어 쿼리를 만든 뒤 SQLite에 보내서, 쿼리를 손으로 쓰지 않아도 된다.

### 필드 변경 즉시 반영과 JSON 저장

**동작 방식**

- 필드 구성이 바뀌면 테이블을 다시 만들고 값을 다시 넣어 바로 반영한다.
- 객체 값은 JSON\_TEXT 타입으로 저장하고, 읽을 때 다시 객체로 돌려준다.
- insert / get / update / hasData / delete / values와 파일에서 일괄 입력하는 insertFromFile을 제공하고, 서버가 닫힐 때 DB를 자동으로 닫는다.

## 링크

- [GitHub](https://github.com/minyee2913/2913simpleDB)
- [npm](https://www.npmjs.com/package/@bdsx/2913simpledb)

## 미디어

- 이미지: https://human.minyee2913.net/img/games/2913-simple-db/table.jpg (데코레이터로 테이블을 정의하는 예시)
