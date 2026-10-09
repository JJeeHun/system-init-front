import { AppError } from "@/shared/lib/app-error"
import type { UserAccount, UserAccountInput, UserFilters } from "@/features/user/types/user-management.types"

const initialUsers: UserAccount[] = [
  { id: "admin01", name: "김관리", email: "admin01@example.com", center: "SEOUL", role: "ADMIN", enabled: true },
  { id: "user02", name: "이사용", email: "user02@example.com", center: "SEOUL", role: "STAFF", enabled: true },
  { id: "user03", name: "박테스트", email: "user03@example.com", center: "BUSAN", role: "STAFF", enabled: false },
  { id: "user04", name: "최운영", email: "user04@example.com", center: "BUSAN", role: "ADMIN", enabled: true },
  { id: "user05", name: "정담당", email: "user05@example.com", center: "SEOUL", role: "STAFF", enabled: true },
]
let users = initialUsers.map(user => ({ ...user }))

export function listMockUsers(filters: UserFilters): UserAccount[] {
  const keyword = filters.keyword.trim().toLocaleLowerCase()
  return users
    .filter(user =>
      (!keyword || [user.id, user.name, user.email].some(value => value.toLocaleLowerCase().includes(keyword))) &&
      (filters.status === "all" || user.enabled === (filters.status === "enabled")) &&
      (filters.role === "all" || user.role === filters.role),
    )
    .map(user => ({ ...user }))
}

function normalize(input: UserAccountInput, editingId?: string): UserAccount {
  const id = input.id.trim()
  const name = input.name.trim()
  const email = input.email.trim()
  if (!/^[a-zA-Z0-9_-]{3,30}$/.test(id)) throw new AppError("USER_INVALID_ID", "Invalid login ID")
  if (!name) throw new AppError("USER_NAME_REQUIRED", "User name is required")
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError("USER_INVALID_EMAIL", "Invalid email")
  if (users.some(user => user.id.toLowerCase() === id.toLowerCase() && user.id !== editingId)) {
    throw new AppError("USER_DUPLICATE_ID", "Login ID already exists")
  }
  if (users.some(user => user.email.toLowerCase() === email.toLowerCase() && user.id !== editingId)) {
    throw new AppError("USER_DUPLICATE_EMAIL", "Email already exists")
  }
  return { ...input, id, name, email }
}

export function createMockUser(input: UserAccountInput): UserAccount {
  const user = normalize(input)
  users = [...users, user]
  return { ...user }
}

export function updateMockUser(id: string, request: Omit<UserAccountInput, "id">): UserAccount {
  const previous = users.find(user => user.id === id)
  if (!previous) throw new AppError("USER_NOT_FOUND", "User not found")
  const updated = normalize({ ...request, id })
  users = users.map(user => user.id === id ? updated : user)
  return { ...updated }
}

export function setMockUserEnabled(id: string, enabled: boolean): UserAccount {
  const user = users.find(item => item.id === id)
  if (!user) throw new AppError("USER_NOT_FOUND", "User not found")
  const updated = { ...user, enabled }
  users = users.map(item => item.id === id ? updated : item)
  return { ...updated }
}

export function resetMockUsersForTest() {
  users = initialUsers.map(user => ({ ...user }))
}
