/**
 * Split QBtnDropdown renders the menu toggle as .q-btn-dropdown__arrow-container. Resolve it so a
 * sibling QTooltip can use :target, and mirror browse-latest copy onto Playwright-facing markup.
 */
export function resolveSplashResumeDropdownArrowElement (
  instance: { $el?: unknown } | null,
  tooltipText: string
): HTMLElement | null {
  const rootUnknown = instance?.$el
  if (!(rootUnknown instanceof HTMLElement)) {
    return null
  }

  const arrow = rootUnknown.querySelector('.q-btn-dropdown__arrow-container')
  if (!(arrow instanceof HTMLElement)) {
    return null
  }

  arrow.setAttribute('data-test-tooltip-text', tooltipText)

  return arrow
}
