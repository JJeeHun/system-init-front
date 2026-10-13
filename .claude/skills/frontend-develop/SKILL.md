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

## Import 구성 및 의존성 경계 (필수)

- import는 코드 길이를 줄이기보다 **모듈의 소유 계층과 올바른 공통 UI 사용 여부를 쉽게 검토할 수 있도록** 구성한다.
- 기본 import 그룹 순서는 **외부 패키지(React 포함) → Feature(`@/features/*`) → 프로젝트 공통 UI(`@/shared/ui/*`) → 공통 기능·Layout(`@/shared/i18n`, `@/shared/layout/*`, `@/shared/hooks/*`, `@/shared/lib/*` 등) → UI Primitive(`@/shared/components/ui/*`)** 로 한다. 같은 계층에서는 Feature별로 묶고 경로를 기준으로 정렬한다.
- 그룹 사이에는 빈 줄 하나를 두며, 그룹 구분용 번호나 설명 주석은 추가하지 않는다. 동일 경로의 값·타입 import는 읽기 쉬운 경우 `type` 키워드로 합칠 수 있다.
- 공통 UI는 `@/shared/ui/button`, `@/shared/ui/tree`처럼 **컴포넌트별 공개 경로**에서 가져온다. `@/shared/ui` 루트 통합 Barrel Import를 새로 만들거나 사용하지 않는다.
- Feature/Page는 동일 목적의 프로젝트 공통 UI가 있다면 해당 공개 API를 우선 사용한다. `@/shared/components/ui/*`에서 직접 가져오는 코드는 대응하는 공통 UI가 없는지, Primitive 직접 사용이 실제로 필요한지 확인한다. 전체 Primitive import를 일률적으로 금지하지 않는다.
- import 정리는 **현재 요청으로 작성·수정하는 파일의 필요한 범위에만** 적용한다. import 정렬만을 위해 관련 없는 파일을 수정하거나 컴포넌트·공개 API·Lint 설정을 임의로 추가하지 않는다.

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

## 폼 Validation 표준 (필수)

- 모든 업무 폼의 입력 Validation은 **React Hook Form + Zod + `zodResolver`**를 표준으로 한다. React Hook Form은 폼 상태·필드 등록·Submit·검증 결과를, Feature 소유 Zod Schema는 필수·형식·길이·범위·조건부 검증을 담당한다.
- `register()`의 `required`, `min`, `max`, `pattern`, `validate` 등 업무 Validation과 Zod Validation을 혼용하지 않는다. `valueAsNumber` 등 입력 변환은 Schema의 입력·출력 타입과 맞춰 사용할 수 있다.
- Schema는 기본적으로 정적 `z.object()`로 정의하고 폼 타입은 Schema에서 추론한다. 입력 타입과 파싱 결과 타입이 다를 때는 `z.input`/`z.output`을 구분한다. 단순 번역 메시지 주입만을 위한 Schema Factory를 만들지 않는다.
- Zod 오류에는 번역된 문장이 아닌 **타입 검사된 i18n Key**를 지정하고, React Hook Form의 `formState.errors`에서 꺼내 표시할 때 번역한다. UI/Field는 실제 검증 규칙을 소유하지 않고 오류 표시만 담당한다.
- 서버의 권한·중복·데이터 무결성 검증은 클라이언트 입력 Validation과 구분하여 유지한다.
- 표준 전환을 요청받은 범위에서는 기존 폼까지 같은 패턴으로 통일해 혼재를 남기지 않는다. 별도 지시 없이 무관한 폼까지 수정하거나 작업 범위를 확대하지 않는다. 상세 기준은 [state-form.md](references/state-form.md)를 따른다.

## 컴포넌트 기능·Hook 소유권 (필수)

- **컴포넌트 고유의 상태와 동작은 해당 컴포넌트 또는 전용 Hook이 소유한다.** UI만 공통 컴포넌트로 빼고 선택·접기/펼치기·검색·필터링 등의 내부 기능을 상위 Page/Feature Hook마다 다시 구현하지 않는다.
- 상태·동작이 있는 공통 UI는 렌더링 컴포넌트와 필요한 전용 Hook을 하나의 기능 단위로 제공한다. 예: `src/shared/ui/tree/TreeView.tsx`, `src/shared/ui/tree/use-tree.ts`, `src/shared/ui/tree/index.ts`. 타입과 테스트는 필요한 경우 같은 디렉터리에 둔다.
- 전용 Hook은 컴포넌트 안에서 사용할 수도 있고, 상위 Feature Hook이 가져와 조합할 수도 있다. **호출 위치와 무관하게 기능의 구현·유지보수 책임은 해당 UI에 둔다.** 공개 API로 선택값·이벤트·상태를 연결하며 내부 동작을 복제하지 않는다.
- 상위 Page/Feature Hook은 해당 UI Hook을 호출하고 업무 데이터 및 결과를 연결하는 조합 책임을 맡는다. 트리의 펼침 상태, 검색 결과 계산, 선택 상태 관리처럼 UI 자체에 속하는 기능을 상위 업무 Hook에서 직접 구현하지 않는다.
- **도메인 로직은 Feature가 소유한다.** 메뉴·사용자 등의 API 요청, CRUD, 업무 검증, 도메인별 데이터 가공 및 저장은 공통 UI Hook으로 옮기지 않는다. UI Hook이 도메인별 규칙이 필요하면 검색 대상 필드나 변환된 노드 데이터 등을 공개 인터페이스로 전달받는다.
- 선택값처럼 UI 상태를 업무 화면과 공유해야 할 때는 Controlled props 또는 전용 Hook의 반환값으로 연동하고, 동일 값을 두 곳에서 중복 상태로 유지하지 않는다.
- 별도 상태나 복잡한 동작이 없는 단순 표현 컴포넌트에는 전용 Hook을 억지로 만들지 않는다. 향후 사용 가능성만을 이유로 미요청 기능이나 범용 추상화를 추가하지 않는다.
- UI 컴포넌트를 구현하거나 재사용하기 전에 **해당 UI의 상태·이벤트·필터링 기능이 어디에 소유되는지** 확인하고, UI 고유 로직이 상위 Hook에 새로 쌓이지 않도록 검증한다.

## Reference 선택

현재 작업에 필요한 문서만 읽는다. 관련 없는 reference는 읽지 않는다.

- 구조, 역할 분리, Page/Feature/Layout 책임: [architecture.md](references/architecture.md)
- state, React Hook Form, useRef, useToggle: [state-form.md](references/state-form.md)
- API, React Query, 캐시 기본값: [api-react-query.md](references/api-react-query.md)
- UI, 모바일, flex/grid, 크기와 Layout: [ui-layout.md](references/ui-layout.md)
- 컬러, 폰트, light/dark/custom theme: [theme.md](references/theme.md)
- env/config 사용 규칙: [config.md](references/config.md)
- 임시 Mock 응답 지연과 테스트 설정은 `src/shared/dev-tools`에만 정의한다. 각 Feature API에 지연 상수를 중복 작성하지 않고 공통 `waitForMockDelay()`만 사용한다. 기준값은 `settings.ts` 한 곳에서 변경한다.
- 실행 환경 판별과 비운영 표시 기능은 영구 설정이며 `shared/config`가 담당한다. GitHub Pages의 현행 시험 배포는 Vite `--mode test`를 명시한다. 운영 빌드에서는 Mock 지연이 실행되지 않아야 한다.
- 테스트 설계, 실행, 실패 분석, 기존 테스트 변경 승인: [testing.md](references/testing.md)
- 비즈니스 예외, AppError 타입, 전역 오류 처리와 지역 복구 경계: [error-handling.md](references/error-handling.md)

UI 작업이면 구현 전에 `theme.md`와 `ui-layout.md`를 확인한다.
상태/폼 작업이면 `state-form.md`를 확인한다.
서버 통신 작업이면 `api-react-query.md`를 확인한다.
구조를 추가하거나 이동하는 작업이면 `architecture.md`를 확인한다.
env 또는 환경 설정 값을 사용하는 작업이면 `config.md`를 확인한다.
테스트를 작성·실행·수정·삭제하거나 테스트 실패를 판단하는 작업이면 `testing.md`를 확인한다.
API·Feature Hook의 오류를 정의하거나 처리하거나 전역 메시지 정책을 다루는 작업이면 `error-handling.md`를 확인한다.

## i18n 개발 규칙 (필수)

- 범용 관리자 화면의 시스템 문구는 현재 내부 엔진인 `i18next` + `react-i18next`와 프론트 JSON 리소스로 관리한다. 다국어 관리용 DB·CRUD·조회 API를 현재 요청 없이 추가하지 않는다.
- **번역 사용 경계**: UI, Page, Feature Hook, shared 일반 코드는 `@/shared/i18n`의 프로젝트 API(`useAppTranslation`, `translate`, `getLanguage`, `changeLanguage`)만 사용한다. `i18next`/`react-i18next` 직접 import, `useTranslation` 직접 사용, `i18n.t`, `i18n.changeLanguage`, `i18n.resolvedLanguage` 직접 접근을 금지한다. 엔진 접근은 `src/shared/i18n` 내부 구현에서만 허용한다.
- React 컴포넌트/Hook은 `useAppTranslation()`에서 `t`, `language`, `changeLanguage`를 얻는다. React Hook을 쓸 수 없는 일반 함수·전역 메시지 처리에서는 `translate()`, `getLanguage()`, `changeLanguage()`를 사용한다.
- `src/shared/i18n/engine.ts`는 현재 i18next 초기화·JSON 리소스 등록·언어 저장을 담당하며, `src/shared/i18n/index.ts`는 소비자가 의존하는 공개 번역 인터페이스를 담당한다. 번역 소스가 JSON→DB 또는 혼합으로 변경되더라도 화면·Feature의 호출 계약을 유지한다. **현재 DB Provider/API/병합 구현을 미리 추가하지 않는다.**
- 기존 테스트 호환을 위한 `i18n`/`useTranslation` 재수출은 신규 코드에서 사용하지 않는다. 테스트 수정 승인을 받은 후 제거 여부를 별도로 결정한다.
- Namespace는 업무 기능(Feature) 소유권 기준으로 구분한다. 예: `common`, `auth`, `user`, `role`, `navigation`, `common-code`. 여러 Feature에서 의미까지 동일한 공통 문구만 `common`을 쓴다.
- Key는 원문이 아닌 의미 중심 영어 camelCase로 정의한다. `namespace:section.element` 형식과 2~4단계 깊이를 따른다. 예: `common:actions.save`, `auth:login.title`, `common-code:group.fields.code`.
- 한국어(`ko`)와 영어(`en`) 번역 리소스는 `src/shared/i18n/locales/{lang}/{namespace}.json`에 정의한다. 기본 언어와 누락 키 폴백은 한국어로 한다. 언어별 키 목록은 일치시킨다.
- 메뉴/페이지/폼 라벨/플레이스홀더/Validation/Toast/Dialog/로딩/오류/aria-label·title 등 사용자에게 보이는 **시스템 문구**는 번역 키를 사용한다. 동적 업무 데이터나 사용자 입력 텍스트는 번역하지 않는다.
- 공통 컴포넌트 내부 기본 문구는 `common`에서 번역한다. Feature 문구는 해당 Feature가 번역하여 props로 넘긴다. 정적 시스템 메뉴는 `labelKey`를 사용하고 서버/사용자 정의 표시명에는 번역 폴백을 유지한다.
- RHF/Zod 검증 메시지는 의미별 키와 보간값을 사용하고 언어 변경 중 이미 표시된 오류도 갱신한다. API/AppError는 오류 코드를 그대로 유지하고 UI/글로벌 오류 표시 경계에서 코드 → i18n 키로 변환한다.
- 번역 Key의 정적 타입은 한국어 번역 JSON을 기준으로 `@/shared/i18n/keys`의 `TranslationKey`에서 자동 추론한다. 정적 `t("key")` 호출과 Zod 오류 Key에 타입 검증을 적용하고, Schema 안에서는 `satisfies TranslationKey`를 사용한다. 런타임 `string`의 유효성은 컴파일 시 보장할 수 없으므로 화면 경계에서 검증한다.
- 프로젝트의 `t()`와 `translate()`는 `null` 또는 `undefined`를 받으면 `""`을 반환한다. 기존 오류 메시지의 언어 변경 반영은 표시 시점에 번역하여 처리한다.
- 동적 문장 결합을 지양하고 변수 보간·복수형 규칙을 이용한다. 날짜·숫자·통화는 Intl 기반 locale-aware formatting을 사용한다.
- 번역 키의 중복·누락·폴백, 한국어/영어 화면 반영 및 주요 메뉴/Validation 시나리오를 검증한다. 새 작업의 i18n 적용을 이유로 무관한 기존 화면까지 일괄 수정하지 않는다.
- 확정 정책과 상세 기준은 Notion `system-init-front / 범용 관리자 프론트엔드 베이스 — 기능 로드맵·구조·i18n·API 연동 원칙` 문서 6.1절을 참고한다.

## 작업 방식

개발 작업은 **요구사항 확인 → 필요한 코드 추적 → 구현 → 사용자 동작 검증 → 요청사항 대조 → 결과 보고** 순서로 수행하며, 어느 단계도 생략하지 않는다.

1. **요구사항 확인:** 개발자가 요청한 작업 경계와 완료 기준을 먼저 확인한다. 요청하지 않은 기능은 완료 기준에 추가하지 않는다.
2. **필요한 코드 추적:** 필요한 reference만 읽고, 요청 기능의 실제 연결 관계(UI → 이벤트 → Hook → API 등)를 구현 판단에 필요한 지점까지만 확인한다. 라우트·메뉴 등도 요청 기능에 필요한 경우에만 확인하며, 전체 탐색으로 확장하지 않는다.
3. **구현:** 확인한 범위에서 기존 공통 컴포넌트와 역할 경계를 지키며 최소한의 파일과 diff로 구현한다.
4. **사용자 동작 검증:** 코드 존재나 타입 검사 통과만으로 정상 동작을 단정하지 않는다. 요청 기능에 해당하는 화면 접근, 입력·클릭, 확인·취소, 성공·실패 후 결과를 가능한 방법으로 검증한다. 브라우저 검증 등 실행하지 못한 항목은 미검증으로 구분한다. 기존 테스트 변경·삭제·비활성화는 개발자 사전 승인 없이는 수행하지 않는다.
5. **요청사항 대조:** 최초 요청과 실제 변경 사항 및 검증 결과를 대조하여 누락된 연결·동작이 없는지 확인한다. 요청 범위 밖의 문제나 추가 작업은 임의로 수정하지 않고 별도로 알린다.
6. **결과 보고:** 변경 파일·범위, 수행한 검증과 미검증 항목, 작업 브랜치 및 Git 반영 상태를 구분해 보고한다. 커밋·Push·병합·배포를 혼동하거나 확인하지 않은 사항을 완료로 표현하지 않는다.

요구사항이 기존 규칙과 충돌하면 개발자의 현재 명시적 요구를 우선한다.
