import {
  resolveProjectAppControlBarTabsHorizontalWheelDelta,
  resolveProjectAppControlBarTabsWheelScrollLeft
} from '../functions/projectAppControlBarTabsWheelScroll'

export const PROJECT_APP_CONTROL_BAR_TABS_CONTENT_SELECTOR = '.q-tabs__content'

/**
 * Maps mouse-wheel / trackpad deltas onto Quasar q-tabs horizontal overflow scroll.
 */
export function onProjectAppControlBarTabsWheel (event: WheelEvent): void {
  const root = event.currentTarget
  if (!(root instanceof HTMLElement)) {
    return
  }

  const content = root.querySelector(PROJECT_APP_CONTROL_BAR_TABS_CONTENT_SELECTOR)
  if (!(content instanceof HTMLElement)) {
    return
  }

  const delta = resolveProjectAppControlBarTabsHorizontalWheelDelta({
    deltaX: event.deltaX,
    deltaY: event.deltaY
  })
  const nextScrollLeft = resolveProjectAppControlBarTabsWheelScrollLeft({
    clientWidth: content.clientWidth,
    delta,
    scrollLeft: content.scrollLeft,
    scrollWidth: content.scrollWidth
  })
  if (nextScrollLeft === null) {
    return
  }

  event.preventDefault()
  content.scrollLeft = nextScrollLeft
}
