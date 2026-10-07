import {
  Activity,
  Boxes,
  CalendarClock,
  ClipboardCheck,
  Code2,
  LayoutDashboard,
  PackageSearch,
  ReceiptText,
  ScanBarcode,
  Settings,
  Truck,
  Users,
} from "lucide-react"

import type { NavigationIconKey } from "@/features/navigation/types/navigation.types"

const icons = {
  activity: Activity,
  boxes: Boxes,
  calendar: CalendarClock,
  clipboard: ClipboardCheck,
  code: Code2,
  dashboard: LayoutDashboard,
  package: PackageSearch,
  receipt: ReceiptText,
  scan: ScanBarcode,
  settings: Settings,
  truck: Truck,
  users: Users,
} satisfies Record<NavigationIconKey, typeof Activity>

type MenuIconProps = {
  name?: NavigationIconKey
}

export function MenuIcon({ name }: MenuIconProps) {
  const Icon = name ? icons[name] : Boxes
  return <Icon aria-hidden="true" className="size-4 shrink-0" />
}
