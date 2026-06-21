export function resolveVueComponentRootElement (target: unknown): HTMLElement | null {
  if (target instanceof HTMLElement) {
    return target
  }
  if (
    typeof target === 'object' &&
    target !== null &&
    '$el' in target &&
    (target as { $el: unknown }).$el instanceof HTMLElement
  ) {
    return (target as { $el: HTMLElement }).$el
  }
  return null
}
