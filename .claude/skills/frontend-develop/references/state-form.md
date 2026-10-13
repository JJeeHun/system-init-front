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

## React Hook Form + Zod Validation

- 업무 폼은 `useForm({ resolver: zodResolver(schema) })`로 연결한다. `register`는 필드 바인딩을 담당하고 업무 Validation은 Feature 소유 Zod Schema에만 정의한다.
- Schema는 기본적으로 정적 `z.object()`를 export한다. 오류 메시지는 번역된 문자열 대신 `TranslationKey`로 검증된 i18n Key를 사용하며, 정적 Key에는 `satisfies TranslationKey`를 적용한다.
- 폼 타입은 `z.infer<typeof schema>`를 우선 사용하되, Schema의 입력과 변환 후 출력이 다른 경우 `z.input<typeof schema>`, `z.output<typeof schema>` 및 `useForm` 제네릭을 구분해 맞춘다.
- 필수 문자열은 공백만 입력해도 통과하지 않게 검증한다. 조건부 검증은 `refine`/`superRefine` 등을 이용한다.
- `register()`의 `required`, `min`, `max`, `pattern`, `validate`와 Zod 검증을 혼용하지 않는다. `valueAsNumber`처럼 값을 변환하는 옵션은 허용하되 Schema 입력 타입과 일치해야 한다.
- 폼 검증 오류는 `formState.errors`에서 읽고, 오류 Key는 표시 경계에서 `t()`로 번역한다. `t(null | undefined)`는 `""`을 반환한다. Field의 `required` 속성은 UI 필수 표시일 뿐 Validation을 대체하지 않는다.
- 기존 오류 상태에서 언어를 바꿔도 번역된 메시지가 즉시 갱신되도록 표시 시점에 번역한다. API/서버 오류는 별도 공통 오류 처리 정책을 따른다.
- 검증 시 필수 누락·공백만 입력·형식·범위·조건부 규칙, 제출 차단과 정상 저장, 한국어·영어 오류 메시지, Key 오타의 정적 검출을 확인한다.

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
