import type { LinkProps } from "react-router-dom"
import { Link } from "react-router-dom"

import { routePath, type RouteKey } from "@/app/routing/route-config"

type RouteLinkProps = Omit<LinkProps, "to"> & {
  to: RouteKey
}

export function RouteLink({ to, ...props }: RouteLinkProps) {
  return <Link {...props} to={routePath(to)} />
}
