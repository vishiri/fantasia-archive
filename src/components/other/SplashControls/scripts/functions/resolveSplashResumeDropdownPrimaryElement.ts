/** Stable Playwright locator on the splash Resume split primary segment. */
export const FA_SPLASH_RESUME_DROPDOWN_PRIMARY_TEST_LOCATOR = 'splashPage-btn-resume-latest-primary'

const SPLASH_RESUME_DROPDOWN_PRIMARY_SELECTORS = [
  '.q-btn-dropdown--current',
  '.q-btn-group > .q-btn:first-child',
  '.q-btn-group > button.q-btn:first-of-type'
] as const

/**
 * Split QBtnDropdown primary segment may use Quasar-internal classes; tag a stable data-test-locator.
 */
export function resolveSplashResumeDropdownPrimaryElement (
  instance: { $el?: unknown } | null
): HTMLElement | null {
  const rootUnknown = instance?.$el
  if (!(rootUnknown instanceof HTMLElement)) {
    return null
  }

  for (const selector of SPLASH_RESUME_DROPDOWN_PRIMARY_SELECTORS) {
    const primary = rootUnknown.querySelector(selector)
    if (primary instanceof HTMLElement) {
      primary.setAttribute('data-test-locator', FA_SPLASH_RESUME_DROPDOWN_PRIMARY_TEST_LOCATOR)
      return primary
    }
  }

  return null
}
