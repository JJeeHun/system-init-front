export type ExclusiveBooleanProps<K extends PropertyKey> =
  | { [P in K]?: never }
  | {
      [P in K]:
        & { [Q in P]?: boolean }
        & { [Q in Exclude<K, P>]?: never }
    }[K]
