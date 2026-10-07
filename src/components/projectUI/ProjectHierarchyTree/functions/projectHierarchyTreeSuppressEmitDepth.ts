const suppressEmitDepthByFlag = new WeakMap<{ value: boolean }, number>()

/**
 * Nested tree publishes share one suppress flag.
 * The flag stays set until every begin has a matching end.
 */
export function beginProjectHierarchyTreeSuppressEmit (flag: { value: boolean }): void {
  const nextDepth = (suppressEmitDepthByFlag.get(flag) ?? 0) + 1
  suppressEmitDepthByFlag.set(flag, nextDepth)
  flag.value = true
}

/**
 * Drops one suppress level. The flag clears only when no publish is still in flight.
 */
export function endProjectHierarchyTreeSuppressEmit (flag: { value: boolean }): void {
  const nextDepth = (suppressEmitDepthByFlag.get(flag) ?? 1) - 1
  const depth = nextDepth < 0 ? 0 : nextDepth
  suppressEmitDepthByFlag.set(flag, depth)
  flag.value = depth > 0
}
