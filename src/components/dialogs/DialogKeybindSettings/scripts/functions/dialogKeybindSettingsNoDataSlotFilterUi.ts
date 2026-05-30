/**
 * Used by the Keybind settings empty-table slot so clearable filter null and whitespace-only queries
 * differentiate the generic empty-state from filtered-no-rows copy.
 */
export function dialogKeybindSettingsNoDataSlotShowsFilterError (
  filter: string | null | undefined
): boolean {
  return (filter ?? '').trim().length > 0
}
