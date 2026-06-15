import type {
  I_faVerticalDraggableTabsRootStyleInput,
  T_faVerticalDraggableTabsTabJustifyContent,
  T_faVerticalDraggableTabsTabLabelTextTransform,
  T_faVerticalDraggableTabsTabTextAlign
} from 'app/types/I_faVerticalDraggableTabs'

/**
 * faVerticalDraggableTabs root style builder and default constants.
 *
 * TabList column hosts bind the returned object to :style on the outer
 * .faVerticalDraggableTabs root. Global SCSS reads the CSS custom properties
 * below (with the same defaults as fallbacks when a host omits :style).
 *
 * CSS custom properties:
 * - --fa-vertical-draggable-tabs-column-width (from columnWidthPx / tabListWidthPx)
 * - --fa-vertical-draggable-tabs-tab-padding (tabPadding shorthand)
 * - --fa-vertical-draggable-tabs-tab-text-align (tab row + label)
 * - --fa-vertical-draggable-tabs-tab-justify-content (tab row flex main axis)
 * - --fa-vertical-draggable-tabs-tab-label-font-size
 * - --fa-vertical-draggable-tabs-tab-label-text-transform
 * - --fa-vertical-draggable-tabs-tab-min-height (dense mode only; SCSS fallback 48px)
 *
 * Drag helpers (sortable options, document drag cursor, ghost hiding) live in
 * sibling modules under src/scripts/faDragDrop/functions/.
 *
 * See .cursor/skills/fantasia-drag-drop/SKILL.md — Vertical draggable tab strips.
 */

/** Default column width in pixels for faVerticalDraggableTabs hosts. */
export const FA_VERTICAL_DRAGGABLE_TABS_COLUMN_WIDTH_PX_DEFAULT = 240

/** Default tab padding shorthand for faVerticalDraggableTabs rows. */
export const FA_VERTICAL_DRAGGABLE_TABS_TAB_PADDING_DEFAULT = '4px 40px 4px 60px'

/** Default tab text-align for faVerticalDraggableTabs rows and labels. */
export const FA_VERTICAL_DRAGGABLE_TABS_TAB_TEXT_ALIGN_DEFAULT: T_faVerticalDraggableTabsTabTextAlign = 'left'

/** Default tab justify-content for faVerticalDraggableTabs rows. */
export const FA_VERTICAL_DRAGGABLE_TABS_TAB_JUSTIFY_CONTENT_DEFAULT: T_faVerticalDraggableTabsTabJustifyContent =
  'flex-start'

/** Default tab label text-transform for faVerticalDraggableTabs hosts. */
export const FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_TEXT_TRANSFORM_DEFAULT: T_faVerticalDraggableTabsTabLabelTextTransform = 'none'

/** Default tab label font-size for faVerticalDraggableTabs hosts. */
export const FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_FONT_SIZE_DEFAULT = '14px'

/** Default tab min-height in pixels for faVerticalDraggableTabs rows (normal mode). */
export const FA_VERTICAL_DRAGGABLE_TABS_TAB_MIN_HEIGHT_PX_DEFAULT = 48

/** Tab min-height in pixels when tabDense is enabled on the column host. */
export const FA_VERTICAL_DRAGGABLE_TABS_TAB_MIN_HEIGHT_DENSE_PX = 36

export const FA_VERTICAL_DRAGGABLE_TABS_CSS_VAR_COLUMN_WIDTH = '--fa-vertical-draggable-tabs-column-width'

export const FA_VERTICAL_DRAGGABLE_TABS_CSS_VAR_TAB_JUSTIFY_CONTENT =
  '--fa-vertical-draggable-tabs-tab-justify-content'

export const FA_VERTICAL_DRAGGABLE_TABS_CSS_VAR_TAB_LABEL_FONT_SIZE =
  '--fa-vertical-draggable-tabs-tab-label-font-size'

export const FA_VERTICAL_DRAGGABLE_TABS_CSS_VAR_TAB_LABEL_TEXT_TRANSFORM =
  '--fa-vertical-draggable-tabs-tab-label-text-transform'

export const FA_VERTICAL_DRAGGABLE_TABS_CSS_VAR_TAB_PADDING = '--fa-vertical-draggable-tabs-tab-padding'

export const FA_VERTICAL_DRAGGABLE_TABS_CSS_VAR_TAB_MIN_HEIGHT = '--fa-vertical-draggable-tabs-tab-min-height'

export const FA_VERTICAL_DRAGGABLE_TABS_CSS_VAR_TAB_TEXT_ALIGN = '--fa-vertical-draggable-tabs-tab-text-align'

/**
 * Inline style binding for faVerticalDraggableTabs layout and tab chrome overrides.
 */
export function buildFaVerticalDraggableTabsRootStyle (
  input: I_faVerticalDraggableTabsRootStyleInput
): Record<string, string> {
  const columnWidth = `${input.columnWidthPx}px`
  const style: Record<string, string> = {}
  style[FA_VERTICAL_DRAGGABLE_TABS_CSS_VAR_COLUMN_WIDTH] = columnWidth
  style[FA_VERTICAL_DRAGGABLE_TABS_CSS_VAR_TAB_JUSTIFY_CONTENT] = input.tabJustifyContent
  style[FA_VERTICAL_DRAGGABLE_TABS_CSS_VAR_TAB_LABEL_FONT_SIZE] = input.tabLabelFontSize
  style[FA_VERTICAL_DRAGGABLE_TABS_CSS_VAR_TAB_LABEL_TEXT_TRANSFORM] = input.tabLabelTextTransform
  style[FA_VERTICAL_DRAGGABLE_TABS_CSS_VAR_TAB_PADDING] = input.tabPadding
  style[FA_VERTICAL_DRAGGABLE_TABS_CSS_VAR_TAB_TEXT_ALIGN] = input.tabTextAlign
  if (input.tabDense === true) {
    style[FA_VERTICAL_DRAGGABLE_TABS_CSS_VAR_TAB_MIN_HEIGHT] =
      `${FA_VERTICAL_DRAGGABLE_TABS_TAB_MIN_HEIGHT_DENSE_PX}px`
  }
  return style
}
