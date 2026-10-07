---
name: frontend-develop
description: 개발자가 명시적으로 호출했을 때 지정된 프론트엔드 범위만 최소 변경으로 구현한다. 광범위 탐색, 선제 리팩터링, 요청하지 않은 작업 확장을 금지한다.
argument-hint: "[개발 요청]"
disable-model-invocation: true
---

# Frontend Develop

개발 요청:

$ARGUMENTS

## 절대 규칙

이 스킬은 개발자가 직접 호출한 요청만 수행한다.

- 개발자가 지정한 기능, Feature, 화면, 파일 범위를 벗어나지 않는다.
- 요청하지 않은 기능을 추가하지 않는다.
- 요청하지 않은 리팩터링, 파일 이동, 이름 변경, 공통화, dependency 추가를 하지 않는다.
- 관련 있어 보인다는 이유만으로 주변 코드를 탐색하거나 수정하지 않는다.
- 미래 확장성을 이유로 현재 요구에 없는 코드를 만들지 않는다.
- 기존 코드의 다른 문제를 발견해도 현재 요구와 직접 관련 없으면 수정하지 않는다.
- 구현과 검증에 필요한 최소 파일만 읽고 최소 diff로 끝낸다.
- commit, push, deploy는 개발자가 요청한 경우에만 수행한다.

## 탐색 제한

다음 순서로만 확인한다.

1. 개발자가 직접 지정한 파일 또는 Feature
2. 그 코드가 직접 import하는 파일
3. 같은 Feature 안에서 현재 요구 구현에 반드시 필요한 파일
4. 현재 코드가 직접 사용하는 shared 코드

필요한 정보를 확보하면 탐색을 멈춘다.

프로젝트 전체 검색은 기본적으로 하지 않는다.
대상 위치를 모를 때만 요청된 Feature명, 컴포넌트명, 함수명 등으로 검색 범위를 좁혀 찾는다.

## 공통 UI 우선순위

- UI를 구현하기 전에 `src/shared`에 동일 목적의 공통 컴포넌트가 있는지 먼저 확인한다.
- 공통 컴포넌트가 있으면 Feature/Page의 raw HTML UI 태그나 별도 스타일 구현보다 공통 컴포넌트를 우선 사용한다.
- 기존 공통 컴포넌트의 공개 props로 해결 가능한 경우 Feature 전용 UI 컴포넌트를 새로 만들지 않는다.
- 공통 컴포넌트로 해결할 수 없는 화면 고유 UI만 Feature 내부 컴포넌트로 구현한다.
- `button`, `input`, `textarea`, `select`, `checkbox` 및 프로젝트가 공통화한 heading/title 계열은 shared 컴포넌트가 존재하면 Feature/Page에서 raw HTML 태그를 직접 사용하지 않는다.
- `div`, `span`, `section`, `form` 등 구조와 semantic 표현을 위한 기본 HTML 태그는 허용한다.
- shared 컴포넌트의 공개 API를 우회하기 위해 Feature/Page에서 내부 스타일을 임의로 덮어쓰지 않는다.

## 역할 경계

- UI Component: 표현과 자기 자신의 디자인만 담당한다.
- Layout: 배치, 영역, 간격, 정렬, 반응형 구조를 담당한다.
- Hook: 상태, 동작, 폼 흐름, 업무 로직을 담당한다.
- API: 요청 함수와 React Query query/mutation 정의를 담당한다.
- Page: 위 역할들을 조립한다.
- 서버 상태는 React Query로 관리한다.
- 직접 `fetch`를 사용하지 않는다.
- 폼 값은 React Hook Form을 우선 사용한다.
- 화면 렌더링에 필요하지 않은 값을 무분별하게 state로 만들지 않는다.

## Reference 선택

현재 작업에 필요한 문서만 읽는다. 관련 없는 reference는 읽지 않는다.

- 구조, 역할 분리, Page/Feature/Layout 책임: [architecture.md](references/architecture.md)
- state, React Hook Form, useRef, useToggle: [state-form.md](references/state-form.md)
- API, React Query, 캐시 기본값: [api-react-query.md](references/api-react-query.md)
- UI, 모바일, flex/grid, 크기와 Layout: [ui-layout.md](references/ui-layout.md)
- 컬러, 폰트, light/dark/custom theme: [theme.md](references/theme.md)
- env/config 사용 규칙: [config.md](references/config.md)

UI 작업이면 구현 전에 `theme.md`와 `ui-layout.md`를 확인한다.
상태/폼 작업이면 `state-form.md`를 확인한다.
서버 통신 작업이면 `api-react-query.md`를 확인한다.
구조를 추가하거나 이동하는 작업이면 `architecture.md`를 확인한다.
env 또는 환경 설정 값을 사용하는 작업이면 `config.md`를 확인한다.

## 작업 방식

1. 개발 요청에서 작업 경계를 먼저 확정한다.
2. 필요한 reference만 읽는다.
3. 현재 구현에 필요한 최소 코드만 확인한다.
4. 역할 경계를 지켜 구현한다.
5. 변경한 범위에 필요한 검증만 수행한다.
6. unrelated 오류나 개선점은 임의로 수정하지 않는다.

요구사항이 기존 규칙과 충돌하면 개발자의 현재 명시적 요구를 우선한다.
