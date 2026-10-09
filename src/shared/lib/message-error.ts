import { AppError } from "@/shared/lib/app-error"
import { message } from "@/shared/lib/message"

const errorMessages: Record<string, string> = {
  COMMON_CODE_GROUP_CODE_REQUIRED: "그룹 코드를 입력해주세요.",
  COMMON_CODE_GROUP_NAME_REQUIRED: "그룹명을 입력해주세요.",
  COMMON_CODE_GROUP_DUPLICATE: "이미 등록된 그룹 코드입니다.",
  COMMON_CODE_GROUP_NOT_FOUND: "공통코드 그룹을 찾을 수 없습니다.",
  COMMON_CODE_GROUP_HAS_ITEMS: "하위 코드가 있는 그룹은 삭제할 수 없습니다.",
  COMMON_CODE_ITEM_GROUP_NOT_FOUND: "공통코드 그룹을 찾을 수 없습니다.",
  COMMON_CODE_ITEM_CODE_REQUIRED: "코드를 입력해주세요.",
  COMMON_CODE_ITEM_NAME_REQUIRED: "코드명을 입력해주세요.",
  COMMON_CODE_ITEM_DUPLICATE: "선택한 그룹에 이미 등록된 코드입니다.",
  COMMON_CODE_ITEM_NOT_FOUND: "공통코드를 찾을 수 없습니다.",
}

export function notifyGlobalError(error: unknown) {
  const code = error instanceof AppError ? error.code : "UNEXPECTED_ERROR"
  const text = errorMessages[code] ?? "요청을 처리하지 못했습니다. 다시 시도해주세요."

  message.error(text, { id: `global-error:${code}` })
}
