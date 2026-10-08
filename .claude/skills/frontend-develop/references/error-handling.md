# Error Handling — 비즈니스 예외와 전역 오류 표시

## 1. 기본 원칙

- **오류 의미의 정의·전파와 UI 표현을 분리한다.** Feature API/Hook은 오류를 식별·발생·전파하며, 전역 오류 처리기가 존재하면 공통 오류의 표시 정책을 일괄 결정한다.
- 공통으로 처리할 수 있는 오류를 각 Page/Feature에 `try/catch` + Alert/Toast로 중복 구현하지 않는다.
- 전역 오류 처리는 **예외적인 실패**에만 적용한다. 삭제 확인(Confirm), 정상적인 안내, 성공 피드백은 Exception을 제어 흐름 대신 쓰지 않는다.
- Toast/Alert Dialog/화면 이동/로깅 등 **표현과 조치 방식은 오류 타입의 책임이 아니다.** 전역 Handler의 정책으로 관리한다.
- 전역 Handler, 공통 메시지 Host, 오류 타입이 아직 없다면 존재한다고 가정하지 않는다. 현재 승인된 작업 범위 밖의 기반 구조를 임의로 구현하지 않고 필요한 설계·영향을 보고한다.

## 2. 표준 오류 타입

- 업무상 의도적으로 발생시키는 오류는 기본 `new Error()`를 무분별하게 사용하기보다, **`Error`를 상속한 공통 `AppError`** 타입으로 표준화하는 방향을 우선한다.
- `AppError`의 최소 계약은 **안정적인 `code`(기계적으로 식별 가능한 오류 코드), `message`(진단 정보), `cause`(원인 오류 보존)**이다. 필요가 확인된 경우에만 오류 분류(kind), HTTP 상태(status), 안전한 부가 정보(context)를 추가한다.
- `code`는 문구와 독립적인 식별자여야 한다. 글로벌 정책에서 `message` 문자열 비교나 임의 문자열 파싱으로 오류를 분류하지 않는다.
- `Error`의 기본 Stack과 `cause`를 유지하고, 원인 오류를 버리거나 모든 오류를 동일한 코드로 변환하지 않는다.
- HTTP 응답/외부 라이브러리 오류는 **API/공통 경계에서 정규화**한다. Feature Hook에서 발견한 업무 규칙 위반은 승인된 명세에 따라 `AppError`로 발생시키거나 기존 오류를 그대로 전파한다.
- 예외 값을 받을 때는 `unknown`으로 취급하고 타입을 판별한다. `AppError`가 아닌 일반 `Error`, 네트워크 장애 및 알 수 없는 값도 안전한 기본 정책을 갖춘다. 모든 오류를 강제로 `AppError`로 감싸지는 않는다.
- 업무 오류의 종류가 실제로 늘고 서로 다른 필드·처리가 필요할 때만 `BusinessError extends AppError` 등의 하위 타입을 도입한다. 미래 가능성만으로 복잡한 상속 계층을 만들지 않는다.
- 원본 서버 메시지, Stack, 민감한 `context`를 사용자에게 그대로 노출하지 않는다. 안전한 사용자 안내 문구는 전역 정책이 `code`를 기준으로 선택한다.

## 3. 책임 경계

| 위치 | 책임 |
| --- | --- |
| API/transport | HTTP·서버 오류를 표준 오류로 정규화하고 원인을 보존 |
| Feature Hook/업무 로직 | 비즈니스 규칙 검사, 오류 발생·전파, 해당 업무의 복구·후속 처리가 필요한 경우에만 지역 처리 |
| 전역 오류 처리기 | 코드별 분류, 인증·권한 정책, 로그, 중복 알림 억제, 사용자 안내 수단 결정 |
| 전역 UI Presenter | 전역 처리기의 결정에 따라 Toast/Alert Dialog 등 공통 UI만 표시 |
| React Error Boundary | 렌더링 과정에서 발생한 오류를 포착하여 대체 화면 표시 |

- 페이지는 공통 예외의 UI를 직접 렌더링하지 않는다. UI Component는 오류 발생·API 호출·전역 상태 처리를 소유하지 않는다.
- **필드 입력 검증, 화면 내 복구, 사용자가 즉시 수정할 수 있는 오류**처럼 화면 문맥이 필요한 경우는 지역적으로 처리할 수 있다. 전역 알림과 중복 표시되지 않도록 처리 경계를 명시한다.
- 지역에서 처리한 오류와 전역에서 처리할 오류를 구분하기 위한 명시적 정책을 사용한다. `catch` 후 단순 무시하거나, Alert를 띄우기 위해 실패를 성공으로 바꾸지 않는다.

## 4. React 환경에서의 수집 지점

- React Query 기반 조회/변경은 **`QueryCache.onError` / `MutationCache.onError`** 같은 전역 경계를 후보로 사용한다. 동일한 실패가 여러 관찰자나 지역 `onError` 경로에서 중복 안내되지 않도록 설계한다.
- 백그라운드 재조회 실패, 사용자 직접 실행한 요청 실패, 인증 만료는 표시 정책이 다를 수 있다. 모든 재조회 실패에서 모달을 띄우지 않는다.
- React Query 바깥의 이벤트 핸들러·비동기 작업은 **자동으로 Error Boundary에 잡히지 않는다.** 비동기 경계에서 명시적으로 중앙 오류 처리기에 전달하는 경로가 필요하다.
- React Error Boundary는 렌더링 오류의 대체 UI 용도로 유지하고 API/비즈니스 오류 전역 처리를 대신하도록 오용하지 않는다.
- 오류가 상위로 전파될 때 `throw`만 했다고 모든 비동기 실패가 자동으로 전역 수집된다고 가정하지 않는다.

## 5. 전역 UI 표시 규칙

- 발생한 오류를 사용자에게 안내할지, 어떤 문구와 방식(Toast, Alert Dialog, 로그인 전환 등)으로 처리할지는 전역 정책에서 결정한다. `AppError` 생성 위치에서 UI 종류를 강제하지 않는다.
- 짧은 시간 내 동일 오류가 반복되거나 여러 요청이 동시에 실패할 때 중복 팝업·알림을 제한한다.
- 동시 표시·큐잉·차단 등 메시지 정책은 전역 메시지 관리 계층에서 별도로 정의한다. 예외 처리 규칙이 일반 Confirm/Dialog의 호출 방식까지 강제하지 않는다.

## 6. 검증 및 변경 범위

- 테스트는 **승인된 오류 계약**을 기준으로 코드 식별, 원인 보존, 정규화, 지역/전역 처리 분리, 중복 알림 방지, 정상 확인 흐름 보호를 필요한 범위에서 검증한다.
- 기존 테스트 변경·삭제·비활성화는 `testing.md`의 **개발자 사전 승인 규칙**을 따른다.
- 이 문서는 **아키텍처 기준**이며 실제 `AppError`, 전역 Handler, Error Boundary, UI Presenter가 구현됐음을 뜻하지 않는다. 관련 코드 도입은 사용자의 구체적인 개발 지시 범위 내에서만 한다.

## 참고 문서

- TanStack Query QueryCacheConfig: https://tanstack.com/query/latest/docs/framework/react/reference/interfaces/QueryCacheConfig
- TanStack Query MutationCacheConfig: https://tanstack.com/query/latest/docs/framework/react/reference/interfaces/MutationCacheConfig
- React Error Boundary: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
