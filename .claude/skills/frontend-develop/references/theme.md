# Theme and Typography

## UI 개발 전 확인

UI를 수정하기 전에 현재 작업에 필요한 범위에서 다음 공통 설정을 먼저 확인한다.

1. global/theme CSS
2. CSS variables
3. Tailwind theme 설정
4. shadcn components 설정
5. typography/font 설정

이미 정의된 semantic token을 우선 사용한다.
공통 설정 확인을 이유로 프로젝트 전체를 탐색하지 않는다.

## Color

Component에서 실제 컬러 값을 직접 결정하지 않는다.

금지:

- HEX
- rgb()
- rgba()
- hsl()/hsla() 직접 값
- oklch() 직접 값
- inline style의 임의 color
- Tailwind palette의 임의 색상 선택
- `bg-blue-500`, `text-red-600`처럼 theme semantic token을 우회하는 색상

Component에서는 semantic token만 사용한다.

예:

```text
bg-background
text-foreground
bg-primary
text-primary-foreground
bg-secondary
text-secondary-foreground
text-muted-foreground
border-border
bg-destructive
text-destructive-foreground
```

실제 색상 값은 theme/settings에서 변경 가능해야 한다.

## Light / Dark / Custom Theme

기본 theme은 light와 dark를 지원하되 Component는 두 theme에 직접 종속되지 않는다.

색상 표현을 위해 다음과 같이 Component에서 직접 분기하지 않는다.

```tsx
<div className="bg-white text-black dark:bg-black dark:text-white">
```

대신 semantic token을 사용한다.

```tsx
<div className="bg-background text-foreground">
```

이렇게 해야 light/dark 외 custom theme을 추가해도 Component를 수정하지 않는다.

특수 asset처럼 semantic color로 해결할 수 없는 명확한 이유가 있을 때만 theme별 분기를 허용한다.

## Font

기본 폰트는 전역에서 하나만 정의한다.

Component는 기본 폰트를 다시 지정하지 않는다.

금지:

- Component별 font-family
- 화면별 기본 font 변경
- 임의 Google Font 추가
- 임의 font token 생성
- CSS 여러 파일에 font 설정 분산

특별한 이유로 다른 폰트가 필요한 경우에도 먼저 공통 설정에 의미 있는 token으로 정의하고 Component는 그 token만 사용한다.

대표적인 예외는 code/terminal처럼 monospace가 의미를 가지는 경우다.

## 설정 위치

Theme와 typography 설정은 가능한 한 한 곳에서 관리한다.

권장:

- CSS 기반이면 하나의 global/theme CSS 파일
- JS/TS 기반이면 하나의 theme/settings 파일

실제 색상/폰트 값을 여러 Component 파일에 분산하지 않는다.

필요한 semantic token이 없더라도 현재 개발 범위를 벗어나 전역 theme을 임의로 확장하지 않는다.
기존 token으로 표현 가능한지 먼저 확인하고, 전역 token 추가가 현재 명시된 요구 범위에 포함될 때만 추가한다.
