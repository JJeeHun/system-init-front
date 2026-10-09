import { AppError } from "@/shared/lib/app-error"
import { message } from "@/shared/lib/message"
import { i18n } from "@/shared/i18n"

const errorTranslationKeys: Record<string, string> = {
  COMMON_CODE_GROUP_CODE_REQUIRED: "common-code:errors.groupCodeRequired",
  COMMON_CODE_GROUP_NAME_REQUIRED: "common-code:errors.groupNameRequired",
  COMMON_CODE_GROUP_DUPLICATE: "common-code:errors.groupDuplicate",
  COMMON_CODE_GROUP_NOT_FOUND: "common-code:errors.groupNotFound",
  COMMON_CODE_GROUP_HAS_ITEMS: "common-code:errors.groupHasItems",
  COMMON_CODE_ITEM_GROUP_NOT_FOUND: "common-code:errors.itemGroupNotFound",
  COMMON_CODE_ITEM_CODE_REQUIRED: "common-code:errors.itemCodeRequired",
  COMMON_CODE_ITEM_NAME_REQUIRED: "common-code:errors.itemNameRequired",
  COMMON_CODE_ITEM_DUPLICATE: "common-code:errors.itemDuplicate",
  COMMON_CODE_ITEM_NOT_FOUND: "common-code:errors.itemNotFound",
}

export function translateAppError(error: unknown): string {
  const code = error instanceof AppError ? error.code : "UNEXPECTED_ERROR"
  return i18n.t(errorTranslationKeys[code] ?? "common:messages.requestFailure")
}

export function notifyGlobalError(error: unknown) {
  const code = error instanceof AppError ? error.code : "UNEXPECTED_ERROR"
  message.error(translateAppError(error), { id: `global-error:${code}` })
}
