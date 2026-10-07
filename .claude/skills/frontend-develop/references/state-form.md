# State and Form

## State 최소화

`useState`를 기본 선택으로 사용하지 않는다.

state를 만들기 전에 반드시 확인한다.

> 이 값이 변경되었을 때 화면이 다시 렌더링되어야 하는가?

아니라면 state를 사용하지 않는다.

## 값의 위치

- 화면 렌더링에 실제로 영향을 주는 로컬 값: state
- 폼 입력값: React Hook Form
- 렌더링과 무관하지만 생명주기 동안 유지해야 하는 값: useRef
- 서버 데이터: React Query
- 기존 값으로 계산 가능한 값: 별도 state 없이 계산

금지:

- 서버 응답을 다시 local state에 복사
- 계산 가능한 값을 state에 저장
- submit 순간에만 필요한 폼 값을 state로 관리
- React Hook Form 값과 useState를 중복 관리
- 단순 임시 값을 이유 없이 state로 관리

## React Hook Form

폼은 기본적으로 React Hook Form을 사용한다.

일반 input은 `register` 기반 비제어 방식을 우선한다.

```tsx
const { register } = useForm()

<input {...register("name")} />
```

값이 이벤트 시점에만 필요하면 `getValues`를 사용한다.

```tsx
const handleSave = () => {
  const name = getValues("name")
}
```

화면이 특정 폼 값의 변경에 실제로 반응해야 할 때만 `useWatch` 또는 `watch`를 사용한다.

```tsx
const type = useWatch({
  control,
  name: "type",
})

return type === "COMPANY" ? <CompanyFields /> : <PersonalFields />
```

단순 submit/API parameter 용도로 값을 읽기 위해 watch하지 않는다.

`Controller` / `useController`는 해당 UI가 controlled value/onChange를 요구할 때만 사용한다.
기본 input에 습관적으로 Controller를 사용하지 않는다.

## useRef

리렌더가 필요 없는 값을 유지할 때 사용한다.

예:

- DOM reference
- timer id
- 이전 값 보관
- 렌더링과 무관한 mutable 값

ref 값을 UI 렌더 결과의 source of truth로 사용하지 않는다.

## Boolean 상태와 useToggle

Modal, Drawer, on/off 등 동일한 boolean 동작은 공통 `useToggle` 사용을 우선한다.

권장 인터페이스:

```ts
type UseToggleReturn = {
  value: boolean
  on: () => void
  off: () => void
  toggle: () => void
  set: (value: boolean) => void
}
```

Modal이라는 이유만으로 별도의 open/close Hook을 반복 생성하지 않는다.
업무 의미가 추가되는 경우에만 Feature Hook에서 useToggle을 조합한다.

예:

```ts
const modal = useToggle()

return {
  open: modal.value,
  onOpen: modal.on,
  onClose: modal.off,
}
```
