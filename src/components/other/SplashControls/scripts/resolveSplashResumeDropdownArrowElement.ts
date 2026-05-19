import type { ComponentPublicInstance } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'

/**
 * Split QBtnDropdown renders the menu toggle as `.q-btn-dropdown__arrow-container`. Resolve it so a
 * sibling QTooltip can use `:target`, and mirror browse-latest copy onto Playwright-facing markup.
 */
export function resolveSplashResumeDropdownArrowElement (
  instance: ComponentPublicInstance | null
): HTMLElement | null {
  const rootUnknown = instance?.$el
  if (!(rootUnknown instanceof HTMLElement)) {
    return null
  }

  const arrow = rootUnknown.querySelector('.q-btn-dropdown__arrow-container')
  if (!(arrow instanceof HTMLElement)) {
    return null
  }

  const text = i18n.global.t('splashPage.browseLatestProjects')

  arrow.setAttribute('data-test-tooltip-text', text)

  return arrow
}
