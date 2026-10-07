# UI and Layout

## Mobile First

모든 UI Component는 모바일 환경을 기본으로 고려한다.

- 작은 화면을 기본으로 작성한다.
- breakpoint가 커질수록 확장한다.
- Desktop 고정 크기를 먼저 만든 뒤 모바일에서 억지로 축소하지 않는다.
- 부모 영역의 화면 크기를 임의로 추측하지 않는다.
- 콘텐츠 길이가 달라져도 가능한 한 레이아웃이 깨지지 않게 한다.

## 크기 단위

레이아웃과 typography는 rem/em 기반 체계를 따른다.

Tailwind를 사용할 때는 임의 값을 직접 쓰기보다 기본 spacing/typography scale을 우선한다.

권장:

```tsx
<div className="p-4 gap-3" />
```

지양:

```tsx
<div className="p-[17px] gap-[13px]" />
```

임의 px 기반 width, height, margin, padding, font-size를 사용하지 않는다.

예외:

- 1px border
- separator
- 실제 픽셀 정밀도가 필요한 작은 시각 요소

고정 width/height보다 콘텐츠 기반 크기, `w-full`, max-width, min-height를 우선한다.

## Flex / Grid

일반 배치는 Flexbox 또는 CSS Grid를 우선한다.

```tsx
<div className="flex flex-col gap-4 md:flex-row">
```

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
```

absolute 좌표로 화면을 맞추는 방식은 특별한 UI 이유가 있을 때만 사용한다.

## Component가 디자인을 책임진다

Component는 자신의 내부 디자인을 스스로 관리한다.

예:

- Button의 padding/radius/size
- Input의 height/border/focus
- Card의 background/border/internal padding

부모에서 긴 `className`을 전달해 자식의 내부 디자인을 계속 덮어쓰지 않는다.

다른 디자인이 반복적으로 필요하면 className override보다 명시적인 variant/size prop을 만든다.

className 사용 자체를 금지하지는 않는다.
Component 내부 디자인과 Layout 배치에 필요한 최소 class만 사용한다.

## Layout이 배치를 책임진다

Page에서 반복되는 배치 패턴은 Layout Component로 분리한다.

예:

- Container
- Stack
- Grid
- Section
- PageLayout
- FullScreenLayout
- CenterLayout

Layout은 `children`을 받아 배치한다.

Layout이 담당하는 것:

- 화면/영역 크기
- flex/grid
- 정렬
- gap
- 외부 padding
- responsive structure

Layout이 자식 Component의 내부 색상, 폰트, 버튼 크기 같은 디자인을 수정하지 않는다.

## Full Screen 기본

Application Root Layout은 fullscreen을 기본으로 한다.

권장 Root:

```tsx
<div className="w-screen min-h-screen">
  {children}
</div>
```

일반 Component는 viewport를 직접 점유하지 않는다.
일반 Component는 부모 영역에 적응하며 필요하면 `w-full`을 사용한다.

AG Grid 같은 넓은 데이터 UI는 전체 페이지를 깨뜨리지 않고 해당 데이터 영역 안에서만 horizontal scroll을 허용할 수 있다.


## Data Grid 규격

업무 Feature와 Page는 AG Grid를 직접 사용하지 않는다.

- `ag-grid-react`, `ag-grid-community` import는 공통 Data Grid 내부 구현에서만 허용한다.
- Feature는 프로젝트가 정의한 `shared/ui/data-grid` 공개 API만 사용한다.
- 공개 Grid props/type에 `ColDef`, `GridApi`, `GridOptions`, AG Grid event type 같은 벤더 타입을 노출하지 않는다.
- `gridOptions`, `agGridProps` 같은 raw passthrough escape hatch를 만들지 않는다.
- 현재 화면에서 실제로 필요한 기능만 프로젝트 Grid 규격에 추가한다.
- 미래 사용 가능성을 이유로 sorting, filtering, selection, pagination, export, editing 같은 기능을 미리 노출하지 않는다.
- 벤더 기능이 필요해지면 먼저 프로젝트 Grid 계약으로 의미를 정의한 뒤 내부 adapter에서 AG Grid 기능으로 변환한다.
- 내부 Grid 라이브러리를 교체해도 Feature/Page의 사용 코드는 유지될 수 있어야 한다.
