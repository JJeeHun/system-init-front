import { useState, type ReactNode } from "react"
import { toast } from "sonner"
import { CheckCircle2Icon, CircleAlertIcon, InfoIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Badge } from "@/shared/components/ui/badge"
import { Checkbox } from "@/shared/components/ui/checkbox"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/components/ui/empty"
import { Input } from "@/shared/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Toaster } from "@/shared/components/ui/sonner"
import { Switch } from "@/shared/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Textarea } from "@/shared/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { DefaultForm } from "@/shared/layout/default-form"
import { FilterBar } from "@/shared/layout/filter-bar"
import { PageLayout } from "@/shared/layout/page"
import { Button } from "@/shared/ui/button"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { DataGrid, type DataGridColumn } from "@/shared/ui/data-grid"
import { DatePicker } from "@/shared/ui/date-picker"
import { Dialog } from "@/shared/ui/dialog"
import { ErrorState } from "@/shared/ui/error-state"
import { Field } from "@/shared/ui/field"
import { PageHeader } from "@/shared/ui/page-header"
import { Panel } from "@/shared/ui/panel"
import { SearchField } from "@/shared/ui/search-field"
import { Select } from "@/shared/ui/select"
import { Subtitle } from "@/shared/ui/subtitle"

type SampleUser = {
  id: string
  name: string
  department: string
  status: "사용" | "미사용"
}

const sampleUsers: SampleUser[] = [
  { id: "01", name: "김하늘", department: "운영", status: "사용" },
  { id: "02", name: "이서준", department: "개발", status: "사용" },
  { id: "03", name: "박지민", department: "기획", status: "미사용" },
  { id: "04", name: "최유진", department: "운영", status: "사용" },
]

const sampleColumns: DataGridColumn<SampleUser>[] = [
  { key: "name", header: "이름", size: "md" },
  { key: "department", header: "부서", size: "md" },
  { key: "status", header: "사용 여부", size: "sm", align: "center" },
]

function PreviewSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Panel>
      <Panel.Header title={title} description={description} />
      <Panel.Content>
        <div className="flex min-w-0 flex-col gap-4">{children}</div>
      </Panel.Content>
    </Panel>
  )
}

function ButtonPreview() {
  return (
    <PreviewSection title="Button · Badge" description="버튼 색상, 크기, 비활성화 및 상태 표시">
      <div className="flex flex-wrap items-center gap-2">
        <Button primary onClick={() => toast.success("기본 버튼 클릭")}>Primary</Button>
        <Button success onClick={() => toast.success("성공 버튼 클릭")}>Success</Button>
        <Button warning onClick={() => toast.warning("주의 버튼 클릭")}>Warning</Button>
        <Button error onClick={() => toast.error("오류 버튼 클릭")}>Error</Button>
        <Button info onClick={() => toast.info("정보 버튼 클릭")}>Info</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => toast("Small 버튼")}>Small</Button>
        <Button size="md" onClick={() => toast("Medium 버튼")}>Medium</Button>
        <Button size="lg" onClick={() => toast("Large 버튼")}>Large</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>기본</Badge>
        <Badge variant="secondary">보조</Badge>
        <Badge variant="outline">윤곽</Badge>
        <Badge variant="destructive">오류</Badge>
      </div>
      <p className="text-xs text-muted-foreground">버튼을 누르면 Toast 메시지가 표시됩니다.</p>
    </PreviewSection>
  )
}

function FormPreview() {
  const [status, setStatus] = useState("active")
  const [enabled, setEnabled] = useState(true)
  const [agreed, setAgreed] = useState(false)
  const [role, setRole] = useState("user")

  return (
    <PreviewSection title="Form · Field · Input" description="입력, 검증 오류, 선택 컨트롤과 폼 액션">
      <DefaultForm
        onSubmit={(event) => {
          event.preventDefault()
          toast.success("샘플 폼을 제출했습니다. 서버에는 저장하지 않습니다.")
        }}
      >
        <Field label="이름" htmlFor="preview-name" required>
          <Input id="preview-name" name="name" placeholder="이름을 입력하세요" required />
        </Field>
        <Field label="상태" htmlFor="preview-status">
          <Select
            id="preview-status"
            value={status}
            onValueChange={setStatus}
            options={[
              { value: "active", label: "사용" },
              { value: "inactive", label: "미사용" },
            ]}
          />
        </Field>
        <Field label="비밀번호 예시" htmlFor="preview-invalid" error="8자 이상 입력해야 합니다.">
          <Input id="preview-invalid" type="password" aria-invalid aria-describedby="preview-invalid-error" placeholder="오류 표시 예시" />
        </Field>
        <Field label="설명" htmlFor="preview-description">
          <Textarea id="preview-description" placeholder="설명을 입력하세요" />
        </Field>
        <Field label="사용 여부" htmlFor="preview-switch" orientation="horizontal">
          <Switch id="preview-switch" checked={enabled} onCheckedChange={setEnabled} />
        </Field>
        <Field label="동의 여부" htmlFor="preview-check" orientation="horizontal">
          <Checkbox id="preview-check" checked={agreed} onCheckedChange={(value) => setAgreed(value === true)} />
        </Field>
        <Field label="역할" htmlFor="preview-role-user">
          <RadioGroup value={role} onValueChange={setRole} className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="preview-role-user" value="user" />
              <label htmlFor="preview-role-user" className="text-sm">일반</label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="preview-role-admin" value="admin" />
              <label htmlFor="preview-role-admin" className="text-sm">관리자</label>
            </div>
          </RadioGroup>
        </Field>
        <DefaultForm.Actions>
          <Button type="reset" onClick={() => { setStatus("active"); setEnabled(true); setAgreed(false); setRole("user") }}>
            선택값 초기화
          </Button>
          <Button primary type="submit">샘플 제출</Button>
        </DefaultForm.Actions>
      </DefaultForm>
    </PreviewSection>
  )
}

function SearchPreview() {
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState("all")
  const [appliedKeyword, setAppliedKeyword] = useState("")
  const [appliedStatus, setAppliedStatus] = useState("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [gridMode, setGridMode] = useState<"data" | "loading" | "empty">("data")

  const rows = gridMode === "empty"
    ? []
    : sampleUsers.filter((user) =>
        (user.name.includes(appliedKeyword.trim()) || user.department.includes(appliedKeyword.trim()))
        && (appliedStatus === "all" || user.status === appliedStatus),
      )

  return (
    <PreviewSection title="FilterBar · SearchField · DataGrid" description="검색 조건 조합, 검색어 초기화, 목록 선택 및 로딩·빈 상태">
      <FilterBar>
        <div className="min-w-0 flex-1 sm:min-w-48">
          <SearchField value={keyword} onValueChange={setKeyword} aria-label="이름 또는 부서 검색" placeholder="이름 또는 부서" />
        </div>
        <div className="min-w-0 sm:w-36">
          <Select
            value={status}
            onValueChange={setStatus}
            aria-label="사용 상태 필터"
            options={[
              { value: "all", label: "전체 상태" },
              { value: "사용", label: "사용" },
              { value: "미사용", label: "미사용" },
            ]}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button primary onClick={() => { setAppliedKeyword(keyword); setAppliedStatus(status); setGridMode("data") }}>검색</Button>
          <Button onClick={() => { setKeyword(""); setStatus("all"); setAppliedKeyword(""); setAppliedStatus("all"); setSelectedId(null); setGridMode("data") }}>초기화</Button>
        </div>
      </FilterBar>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">검색 결과 {rows.length}건 · 선택 ID {selectedId ?? "없음"}</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setGridMode("data")}>데이터</Button>
          <Button size="sm" onClick={() => setGridMode("loading")}>로딩</Button>
          <Button size="sm" onClick={() => setGridMode("empty")}>빈 목록</Button>
        </div>
      </div>
      <DataGrid
        rowKey="id"
        rows={rows}
        columns={sampleColumns}
        loading={gridMode === "loading"}
        selectedRowKey={selectedId}
        onRowClick={(user) => setSelectedId(user.id)}
      />
    </PreviewSection>
  )
}

function DatePreview() {
  const [date, setDate] = useState("")

  return (
    <PreviewSection title="DatePicker" description="동일한 날짜 값을 shadcn 달력과 OS 기본 입력으로 각각 확인">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Custom Calendar" htmlFor="preview-calendar">
          <DatePicker id="preview-calendar" value={date} onValueChange={setDate} presentation="calendar" />
        </Field>
        <Field label="Native / OS" htmlFor="preview-native">
          <DatePicker id="preview-native" value={date} onValueChange={setDate} presentation="native" />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">선택값: {date || "선택되지 않음"}</span>
        <Button size="sm" onClick={() => setDate("")}>날짜 초기화</Button>
      </div>
    </PreviewSection>
  )
}

function OverlayPreview() {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <PreviewSection title="Dialog · ConfirmDialog · Popover · Tooltip" description="모달 열기/닫기, 확인 처리, 팝오버와 툴팁">
      <TooltipProvider>
        <div className="flex flex-wrap gap-2">
          <Dialog
            title="기본 Dialog"
            description="본문과 액션을 분리한 샘플입니다."
            trigger={<Button primary>Dialog 열기</Button>}
          >
            <p className="text-sm text-foreground">이 영역에 폼이나 상세 정보를 배치할 수 있습니다.</p>
          </Dialog>
          <ConfirmDialog
            title="작업을 실행할까요?"
            description="확인하면 샘플 상태만 변경합니다."
            onConfirm={() => setConfirmed(true)}
            trigger={<Button>ConfirmDialog 열기</Button>}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button>Popover 열기</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="text-sm font-medium">Popover</p>
              <p className="mt-1 text-xs text-muted-foreground">기준 버튼에 연결되는 추가 콘텐츠입니다.</p>
            </PopoverContent>
          </Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button>Tooltip 확인</Button>
            </TooltipTrigger>
            <TooltipContent>버튼에 마우스를 올리거나 포커스를 이동하세요.</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
      <p className="text-xs text-muted-foreground">ConfirmDialog 결과: {confirmed ? "확인됨" : "확인 전"}</p>
    </PreviewSection>
  )
}

function StatusPreview() {
  const [recovered, setRecovered] = useState(false)

  return (
    <PreviewSection title="ErrorState · Alert · Empty · Skeleton" description="영역 오류, 인라인 메시지, 빈 상태와 로딩 표현">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card">
          {recovered ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <CheckCircle2Icon className="size-6 text-success" aria-hidden="true" />
              <p className="text-sm">재시도 후 복구된 상태</p>
              <Button size="sm" onClick={() => setRecovered(false)}>오류 다시 표시</Button>
            </div>
          ) : (
            <ErrorState message="데이터를 불러오지 못했습니다." onRetry={() => setRecovered(true)} />
          )}
        </div>
        <Empty className="rounded-lg border border-border">
          <EmptyHeader>
            <EmptyTitle>등록된 항목이 없습니다</EmptyTitle>
            <EmptyDescription>검색 조건을 변경하거나 항목을 추가해 주세요.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
      <Alert variant="destructive">
        <CircleAlertIcon aria-hidden="true" />
        <AlertTitle>InlineError → Alert</AlertTitle>
        <AlertDescription>특정 작업 영역에 표시하는 오류 메시지 예시입니다.</AlertDescription>
      </Alert>
      <Alert>
        <InfoIcon aria-hidden="true" />
        <AlertTitle>안내</AlertTitle>
        <AlertDescription>같은 Alert의 기본 스타일입니다.</AlertDescription>
      </Alert>
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">Skeleton</p>
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-9 w-full" />
      </div>
    </PreviewSection>
  )
}

function NavigationPreview() {
  const [page, setPage] = useState(1)

  return (
    <PreviewSection title="Tabs · Pagination · Combobox" description="탭 내용 전환, 페이지 선택과 옵션 검색">
      <Tabs defaultValue="first">
        <TabsList>
          <TabsTrigger value="first">첫 번째 탭</TabsTrigger>
          <TabsTrigger value="second">두 번째 탭</TabsTrigger>
        </TabsList>
        <TabsContent value="first" className="rounded-md border border-border p-3 text-sm">첫 번째 탭 콘텐츠입니다.</TabsContent>
        <TabsContent value="second" className="rounded-md border border-border p-3 text-sm">두 번째 탭 콘텐츠입니다.</TabsContent>
      </Tabs>
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">현재 페이지: {page} / 3 (샘플)</p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(event) => { event.preventDefault(); setPage((value) => Math.max(1, value - 1)) }} aria-disabled={page === 1} />
            </PaginationItem>
            {[1, 2, 3].map((value) => (
              <PaginationItem key={value}>
                <PaginationLink
                  href="#"
                  isActive={page === value}
                  onClick={(event) => { event.preventDefault(); setPage(value) }}
                >
                  {value}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(event) => { event.preventDefault(); setPage((value) => Math.min(3, value + 1)) }} aria-disabled={page === 3} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <div className="max-w-sm">
        <p className="mb-2 text-sm font-medium">Combobox · 검색해서 선택</p>
        <Combobox items={["서울", "부산", "대구", "인천", "광주", "대전"]}>
          <ComboboxInput placeholder="도시 검색" aria-label="도시 선택" />
          <ComboboxContent>
            <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </PreviewSection>
  )
}

function LayoutPreview() {
  return (
    <PreviewSection title="PageHeader · Panel · Subtitle" description="페이지 제목과 영역 헤더 구성">
      <PageHeader title="샘플 페이지 제목" description="PageHeader의 description으로 표시하는 보조 설명입니다." />
      <Subtitle>단독 보조 설명용 Subtitle 컴포넌트입니다.</Subtitle>
      <Panel>
        <Panel.Header title="Panel.Header" description="패널 제목 및 설명" actions={<Badge variant="outline">샘플</Badge>} />
        <Panel.Content>
          <p className="text-sm text-muted-foreground">Panel.Content에 들어가는 콘텐츠 예시입니다.</p>
        </Panel.Content>
      </Panel>
    </PreviewSection>
  )
}

export function UiPlaygroundPage() {
  return (
    <div className="min-h-full bg-background">
      <PageLayout>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <PageHeader
            title="UI Playground"
            description="실제 공통 컴포넌트의 디자인과 동작을 샘플 데이터로 확인하는 페이지입니다."
          />
          <Badge variant="outline">미리보기 · 서버 저장 없음</Badge>
        </div>
        <div className="grid min-w-0 grid-cols-1 items-start gap-content xl:grid-cols-2">
          <ButtonPreview />
          <FormPreview />
          <SearchPreview />
          <DatePreview />
          <OverlayPreview />
          <StatusPreview />
          <NavigationPreview />
          <LayoutPreview />
        </div>
      </PageLayout>
      <Toaster position="top-right" />
    </div>
  )
}
