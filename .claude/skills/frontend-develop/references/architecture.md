# Architecture

## 기본 구조

업무 기능 단위 Feature 구조를 유지한다.

```text
src/
├── features/
├── pages/
├── widgets/
├── shared/
└── app/
```

Feature는 Page, Modal, Widget 같은 화면 형태가 아니라 업무 기능을 기준으로 나눈다.

```text
features/
└── common-code/
    ├── api/
    ├── hooks/
    ├── components/
    ├── schemas/
    └── types/
```

같은 업무 기능을 Page, Modal, Widget에서 재사용한다.
화면 형태가 다르다는 이유로 Feature를 새로 만들지 않는다.

## Feature Ownership

Feature는 자기 도메인의 데이터와 동작만 소유한다.

- navigation은 메뉴 데이터만 소유한다.
- user는 사용자 데이터만 소유한다.
- auth는 인증 결과와 인증 흐름만 소유한다.
- UI에서 함께 사용된다는 이유로 다른 Feature의 response/type을 한 Feature에 합치지 않는다.
- 여러 Feature의 데이터가 한 화면에 필요하면 Layout, Page 또는 상위 조합 Hook에서 각각의 Feature를 조합한다.
- 서버가 권한에 맞는 메뉴를 이미 내려준다면 navigation response에 별도 user/permission 데이터를 섞지 않는다.

## 역할

### Page

조립 역할만 한다.

- Layout을 배치한다.
- Feature Hook을 호출한다.
- 필요한 데이터를 UI Component에 전달한다.
- 새로운 업무 로직을 직접 구현하지 않는다.
- API를 직접 호출하지 않는다.

### Component

자기 자신의 UI와 디자인만 담당한다.

- 업무 로직을 넣지 않는다.
- API를 호출하지 않는다.
- React Query를 직접 호출하지 않는다.
- 부모가 긴 className으로 내부 디자인을 덮어쓰는 구조를 만들지 않는다.
- 반복되는 디자인 차이는 명시적인 variant/prop으로 표현한다.

### Hook

동작과 상태를 담당한다.

- UI event 흐름
- 폼 처리
- 업무 상태
- Feature 조합 로직
- React Query 사용

UI Component가 업무 동작을 직접 가지지 않도록 한다.

### API

Feature의 서버 상태 정의를 담당한다.

- query key
- queryOptions
- mutationOptions
- 서버 요청에 필요한 API 계약

구체 규칙은 api-react-query.md를 따른다.

### Layout

콘텐츠의 배치를 담당한다.

- width / max-width
- min-height / height가 정말 필요한 경우의 height
- padding / gap
- flex / grid
- alignment
- responsive structure

Layout은 `children`을 받아 재사용한다.

예:

```tsx
<Container>
  <UserList />
</Container>
```

반복되는 Container, Stack, Grid, Section, PageLayout, FullScreenLayout은 Layout Component로 분리할 수 있다.

단, 한 번만 사용되는 단순 배치를 억지로 별도 Layout Component로 만들지 않는다.

### Route Layout

공통 화면 골격이 다른 Route는 Layout 경계로 분리한다.

- 인증 화면은 AuthLayout처럼 Header / Sidebar가 없는 Layout을 사용한다.
- 업무 화면은 MainLayout처럼 Header / Sidebar가 있는 Layout을 사용한다.
- Page에서 pathname 조건으로 Header / Sidebar를 숨기거나 보이지 않는다.
- Header / Sidebar는 업무 Layout에 고정하고 Page는 업무 콘텐츠만 조립한다.

## 공통화 기준

- 특정 Feature에서만 사용하는 코드는 해당 Feature 내부에 둔다.
- 여러 Feature에서 실제로 반복 사용되는 코드만 shared로 이동한다.
- 미래에 재사용될 수 있다는 이유만으로 shared에 만들지 않는다.
- 현재 요청 범위를 넘어 다른 Feature까지 정리하지 않는다.
