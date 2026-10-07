# Frontend

React + Vite 기반 내부 업무 프로그램 프론트엔드.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Zustand
- Tailwind CSS
- shadcn/ui
- AG Grid
- Apache ECharts

## Feature 기반 구조

기능 단위로 코드를 구성한다.

```text
src/
├── features/
│   ├── user/
│   ├── common-code/
│   ├── item/
│   └── inventory/
│
├── pages/
├── widgets/
├── shared/
└── app/
```

Feature는 **화면 단위가 아니라 업무 기능 단위**로 구분한다.

예:

```text
features/
└── common-code/
    ├── api/
    ├── hooks/
    ├── components/
    ├── schemas/
    └── types/
```

`common-code` 기능은 필요에 따라 여러 형태에서 재사용할 수 있다.

```text
common-code feature
     │
     ├── Page
     ├── Modal
     └── Widget
```

따라서 다음처럼 화면 형태로 Feature를 나누지 않는다.

```text
X common-code-page
X common-code-modal
```

대신:

```text
O common-code
```

하나의 Feature 내부 기능을 여러 UI에서 사용한다.

## Feature 역할

### `api/`

API 호출 함수.

### `hooks/`

TanStack Query 등 Feature 전용 Hook.

### `components/`

해당 Feature에서 사용하는 UI.

### `schemas/`

Zod 등 입력값 검증 스키마.

### `types/`

Feature 전용 타입.

## 기본 원칙

- 업무 기능 기준으로 Feature를 만든다.
- Page / Modal / Widget은 Feature가 아니라 표현 방식으로 본다.
- 특정 Feature에서만 사용하는 코드는 해당 Feature 내부에 둔다.
- 여러 Feature에서 공통으로 사용하는 코드는 `shared`로 분리한다.
- Feature끼리 직접 강하게 의존하지 않도록 한다.
- API 호출과 서버 상태 처리는 Feature 내부에서 관리한다.
