import { z } from "zod"

export const rolePermissionSchema = z.object({
  grants: z.array(z.object({
    menuId: z.string(),
    actions: z.array(z.enum(["view", "create", "edit", "delete"])),
  })),
})

export type RolePermissionFormValues = z.infer<typeof rolePermissionSchema>
