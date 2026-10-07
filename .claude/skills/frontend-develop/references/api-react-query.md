# API and React Query

## 기본 원칙

서버 상태는 React Query를 통해 관리한다.

금지:

- Component에서 직접 API 호출
- Page에서 직접 API 호출
- Component/Page에서 `useQuery` / `useMutation` 정의
- Hook 안에서 임의 queryKey 작성
- Hook 안에서 직접 `fetch` 사용
- Component/Page/Hook에서 raw HTTP 호출
- 동일한 API의 query 정의를 여러 위치에 중복 작성

`fetch`를 직접 사용하지 않는다.

프로젝트에 이미 정의된 HTTP client가 있다면 API 계층에서만 사용한다.
HTTP client가 없는데 새로운 transport 구현이 필요하면 개발자가 명시적으로 요청하지 않는 한 임의로 새 방식을 도입하지 않는다.

## 권장 흐름

```text
UI Component
    ↓ props
Feature Hook
    ↓
useQuery / useMutation
    ↓
Feature api의 queryOptions / mutationOptions
    ↓
기존 공통 HTTP client
```

## API 정의

Feature의 `api/`에서 query key와 React Query 옵션을 정의한다.

예:

```ts
export const userQueries = {
  all: () => ["users"] as const,

  list: (params: UserListParams) =>
    queryOptions({
      queryKey: [...userQueries.all(), "list", params],
      queryFn: () => userApi.getUsers(params),
    }),

  detail: (id: number) =>
    queryOptions({
      queryKey: [...userQueries.all(), "detail", id],
      queryFn: () => userApi.getUser(id),
    }),
}
```

Feature Hook에서는 정의된 옵션을 호출한다.

```ts
export function useUser(id: number) {
  return useQuery(userQueries.detail(id))
}
```

UI는 Hook의 결과만 받는다.

## Query Key

- query key는 Feature api에서 중앙 관리한다.
- Component나 Hook에서 ad-hoc 배열을 만들지 않는다.
- invalidate/refetch도 중앙 query key factory를 사용한다.

## Mutation

mutation 정의 역시 Feature api에 둔다.
Hook은 정의된 mutationOptions를 사용하고 성공 이후 필요한 invalidate/refetch를 처리한다.

Mutation은 기본적으로 자동 retry하지 않는다.
중복 저장/삭제 가능성이 있는 동작을 임의로 재시도하지 않는다.

## 캐시 기본값

프로젝트에 이미 QueryClient 기본 설정이 있으면 그 설정을 우선한다.

새 기본 설정을 만드는 작업이 명시적으로 요청된 경우 권장값:

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
})
```

원칙:

- 일반 업무 데이터에 긴 staleTime을 기본 적용하지 않는다.
- `staleTime: Infinity`를 일반 기본값으로 사용하지 않는다.
- 거의 변하지 않는 공통코드 등은 해당 query에 한해 더 긴 staleTime을 둘 수 있다.
- 캐시 시간을 늘릴 때는 데이터 변경 빈도에 근거가 있어야 한다.
- React Query 데이터를 별도 local state로 복사하지 않는다.
