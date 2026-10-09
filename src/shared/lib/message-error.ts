import { AppError } from "@/shared/lib/app-error"
import { message } from "@/shared/lib/message"
import { translate } from "@/shared/i18n"

const errorTranslationKeys: Record<string, string> = {
  USER_INVALID_ID: "user:errors.invalidId",
  USER_NAME_REQUIRED: "user:errors.nameRequired",
  USER_INVALID_EMAIL: "user:errors.invalidEmail",
  USER_DUPLICATE_ID: "user:errors.duplicateId",
  USER_DUPLICATE_EMAIL: "user:errors.duplicateEmail",
  USER_NOT_FOUND: "user:errors.notFound",
  MENU_INVALID_ID: "navigation:management.errors.invalidId",
  MENU_NAME_REQUIRED: "navigation:management.errors.nameRequired",
  MENU_INVALID_ORDER: "navigation:management.errors.invalidOrder",
  MENU_DUPLICATE_ID: "navigation:management.errors.duplicateId",
  MENU_INVALID_PARENT: "navigation:management.errors.invalidParent",
  MENU_CYCLE: "navigation:management.errors.cycle",
  MENU_INVALID_PATH: "navigation:management.errors.invalidPath",
  MENU_DUPLICATE_PATH: "navigation:management.errors.duplicatePath",
  MENU_HAS_CHILDREN: "navigation:management.errors.hasChildren",
  MENU_NOT_FOUND: "navigation:management.errors.notFound",
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
  return translate(errorTranslationKeys[code] ?? "common:messages.requestFailure")
}

export function notifyGlobalError(error: unknown) {
  const code = error instanceof AppError ? error.code : "UNEXPECTED_ERROR"
  message.error(translateAppError(error), { id: `global-error:${code}` })
}
