---
name: frontend-develop
description: 개발자가 명시적으로 요청한 프론트엔드 작업 범위만 최소 변경으로 구현한다. 광범위 탐색, 선제 리팩터링, 요청하지 않은 작업 확장을 금지한다.
argument-hint: "[개발 요청]"
disable-model-invocation: true
---

# Frontend Develop

개발 요청:

$ARGUMENTS

## 절대 규칙

이 스킬은 개발자가 명시적으로 지시한 작업 범위만 수행한다. 관련이 있거나 구현에 필요해 보인다는 이유로 요청을 확대하지 않는다.

- 개발자가 지정한 기능, Feature, 화면, 파일 범위를 벗어나지 않는다.
- 요청하지 않은 기능을 추가하지 않는다.
- 예: 대시보드 구현 요청은 로그인 기능 구현 요청이 아니다. 인증이 필요해 보여도 별도 지시가 없다면 로그인 기능을 추가하지 않는다.
- `(main)`, `(auth)` 같은 라우트 그룹이나 기존 폴더 구조는 구현 위치를 판단하기 위한 근거이지, 해당 그룹의 다른 기능까지 구현하라는 지시가 아니다.
- 구현 위치, 작업 범위 또는 범위 밖의 필수 변경 여부가 모호하면 임의로 결정하거나 확장하지 말고 개발자에게 확인한다.
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

## JSX 가독성 및 컴포넌트 구성

- 부모 컴포넌트의 JSX에서는 패널, 모달, 목록 등 화면의 큰 구성을 한눈에 읽을 수 있도록 한다.
- 오류 → 로딩 → 빈 목록 → 데이터처럼 여러 상태를 중첩 삼항 연산자로 길게 연결하지 않는다. 분기가 길어지면 역할이 분명한 컴포넌트로 나누고 Early Return으로 순서대로 처리한다. 단순한 조건부 렌더링까지 일률적으로 분리하지 않는다.
- 모달, 폼, 목록 등 긴 JSX가 부모의 구조를 가릴 때에는 **먼저 같은 파일의 비공개 컴포넌트**로 분리한다. 실제 재사용이나 독립 관리가 필요할 때만 별도 파일로 이동한다.
- 파일 내부 컴포넌트는 부모 함수 바깥에 선언한다. 단순 가독성 개선만을 위해 파일, export, shared 컴포넌트를 늘리지 않는다.
- 부모는 표시 조건에 따라 긴 JSX를 직접 펼치기보다 `<Modal show={!!form.mode} form={form} />`처럼 의도가 드러나는 조합을 사용할 수 있다. 이때 자식은 `show`가 거짓이면 `null`을 반환한다.
- `show`처럼 이미 `mode` 등에서 계산 가능한 값은 별도 state로 관리하지 않는다. 표시 여부와 등록·수정 모드는 중복 상태를 만들지 않고 기존 값에서 파생한다.
- 기존 공통 컴포넌트가 로딩·빈 상태 등을 이미 처리한다면, 형태를 맞추기 위해 불필요한 래퍼 컴포넌트를 추가하지 않는다.
- 영역 제목과 액션은 해당 영역의 컴포넌트가 소유한다. 예를 들어 `Panel.Header`는 패널 제목·설명·헤더 액션, `Dialog`는 모달 제목, `DefaultForm.Actions`는 폼 액션을 담당한다. 단일 폼에 모달 제목과 중복되는 섹션 제목을 추가하지 않고, 실제 여러 폼 섹션이 있을 때만 폼 내부 제목을 둔다.

## 조회·캐시 책임

- Mock API도 실제 백엔드 API를 연결할 때의 책임과 응답 단위를 고려한다. 그룹 목록과 선택한 그룹의 상세 목록처럼 독립적인 조회는 화면 편의를 위해 전체 데이터를 묶어 가져오지 않는다.
- 각 조회는 고유한 Query Key와 로딩·오류 상태를 유지하고, CRUD 후에는 영향받은 목록의 캐시만 갱신한다. 변경이 없는 다른 조회까지 포괄적으로 무효화하지 않는다.
- 관리용 CRUD 조회와 여러 화면에서 사용하는 읽기 전용 공통 데이터 조회는 목적과 캐시 정책을 구분한다. 다만 요청하지 않은 전역 조회 기능이나 별도 캐시 계층을 미리 구현하지 않는다.

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
- 비즈니스·API 오류는 정의된 공통 오류 타입으로 전파하고, 전역 처리 계층이 있으면 UI 표시 정책을 그곳에 위임한다. 페이지·Feature Hook에 공통 Alert/Toast 처리를 중복 구현하지 않는다.

## Reference 선택

현재 작업에 필요한 문서만 읽는다. 관련 없는 reference는 읽지 않는다.

- 구조, 역할 분리, Page/Feature/Layout 책임: [architecture.md](references/architecture.md)
- state, React Hook Form, useRef, useToggle: [state-form.md](references/state-form.md)
- API, React Query, 캐시 기본값: [api-react-query.md](references/api-react-query.md)
- UI, 모바일, flex/grid, 크기와 Layout: [ui-layout.md](references/ui-layout.md)
- 컬러, 폰트, light/dark/custom theme: [theme.md](references/theme.md)
- env/config 사용 규칙: [config.md](references/config.md)
- 테스트 설계, 실행, 실패 분석, 기존 테스트 변경 승인: [testing.md](references/testing.md)
- 비즈니스 예외, AppError 타입, 전역 오류 처리와 지역 복구 경계: [error-handling.md](references/error-handling.md)

UI 작업이면 구현 전에 `theme.md`와 `ui-layout.md`를 확인한다.
상태/폼 작업이면 `state-form.md`를 확인한다.
서버 통신 작업이면 `api-react-query.md`를 확인한다.
구조를 추가하거나 이동하는 작업이면 `architecture.md`를 확인한다.
env 또는 환경 설정 값을 사용하는 작업이면 `config.md`를 확인한다.
테스트를 작성·실행·수정·삭제하거나 테스트 실패를 판단하는 작업이면 `testing.md`를 확인한다.
API·Feature Hook의 오류를 정의하거나 처리하거나 전역 메시지 정책을 다루는 작업이면 `error-handling.md`를 확인한다.

## 작업 방식

1. 개발 요청에서 작업 경계를 먼저 확정한다.
2. 필요한 reference만 읽는다.
3. 현재 구현에 필요한 최소 코드만 확인한다.
4. 역할 경계를 지켜 구현한다.
5. 변경한 범위에 필요한 검증만 수행한다. 기존 테스트 변경·삭제·비활성화는 개발자 사전 승인 없이는 수행하지 않는다.
6. unrelated 오류나 개선점은 임의로 수정하지 않는다.

요구사항이 기존 규칙과 충돌하면 개발자의 현재 명시적 요구를 우선한다.
