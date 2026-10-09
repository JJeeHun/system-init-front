# Runtime Config

## 기본 원칙

애플리케이션 코드에서 env 값을 직접 사용하지 않는다.

금지:

- Component에서 `import.meta.env` 사용
- Hook에서 `import.meta.env` 사용
- API에서 `import.meta.env` 사용
- Page/Layout에서 `import.meta.env` 사용
- shared 일반 유틸에서 `import.meta.env` 사용
- `process.env` 직접 사용
- env 문자열을 사용하는 위치마다 개별 파싱

런타임 env 접근은 `src/shared/config/config.ts` 한 곳에서만 허용한다.

## Config Boundary

구조:

```text
.env / Vite runtime env
        ↓
src/shared/config/config.ts
        ↓
typed config
        ↓
Feature / Hook / API / Component
```

애플리케이션의 다른 코드는 env 원본이 아니라 `config`만 import한다.

예:

```ts
import { config } from "@/shared/config/config"

const appBaseUrl = config.app.baseUrl
```

## 타입

env 값은 config에서 고정된 타입으로 변환한 뒤 외부에 노출한다.

권장:

```ts
export type AppEnvironment =
  | "development"
  | "test"
  | "staging"
  | "production"
```

boolean, number, enum 성격의 값을 문자열 상태로 애플리케이션에 전달하지 않는다.

예:

```ts
// 금지
if (import.meta.env.VITE_ENABLE_MOCK === "true") {
}

// 권장
if (config.feature.enableMock) {
}
```

필요한 경우 config 내부에서 validation / normalization을 수행한다.

## 설정 위치

- Runtime 설정: `src/shared/config/config.ts`
- 새로운 env를 추가하면 config 타입과 값을 함께 정의한다.
- Feature별로 별도의 env wrapper를 만들지 않는다.
- 같은 env 값을 여러 파일에서 다시 변환하지 않는다.
- env 값을 사용하기 위해 전역 state를 만들지 않는다.

빌드 도구 자체의 설정 파일은 runtime application config와 별개다.
단, `src/` 아래 애플리케이션 코드는 반드시 위 규칙을 따른다.

## 영구 환경 설정과 임시 개발 도구

- Vite 환경 모드 판별은 `src/shared/config/config.ts`에서만 수행한다. 화면은 `config.app.environment`와 `config.app.isProduction`을 사용한다.
- 운영 모드에서는 환경 표시를 숨기고 비운영 모드에서만 명칭을 표시한다.
- 현행 GitHub Pages는 시험용 배포로서 빌드 워크플로에서 `npm run build -- --mode test`를 사용한다. `vite build`의 빌드 최적화 여부와 환경 모드 `MODE`는 다르다.
- Mock에만 적용되는 인위적 지연 등 제거 가능한 임시 설정은 `src/shared/dev-tools/settings.ts`로 집중한다. 모든 Mock API는 `src/shared/dev-tools/mock-delay.ts`의 `waitForMockDelay()`만 호출한다.
- 모든 Mock API의 기본 지연 시간은 `devSettings.mockDelayMs` 하나로 제어한다. 개발 중 값을 변경하면 다음 API 요청부터 적용하고, 이미 배포된 정적 번들은 재빌드·재배포가 필요하다.
- 운영 모드에서는 인위적인 Mock 지연을 0ms로 취급한다. 실제 HTTP 구현에서 Mock 지연 함수를 사용하지 않는다.
