/**
 * faVerticalDraggableTabs — shared vertical draggable tab column contract.
 *
 * Use with vue-draggable-plus and global BEM under faVerticalDraggableTabs in
 * src/css/theme/custom-components/faVerticalDraggableTabs.scss (loaded via
 * customComponentsAdjustments.scss).
 *
 * Reference hosts:
 * - DialogProjectSettingsWorldsTabList.vue (tabListWidthPx default 240)
 * - DialogProjectSettingsDocumentTemplatesTabList.vue (tabListWidthPx 360 from panel)
 *
 * Layout props on those TabList SFCs map to CSS custom properties through
 * buildFaVerticalDraggableTabsRootStyle in
 * src/scripts/faDragDrop/functions/buildFaVerticalDraggableTabsRootStyle.ts.
 *
 * Playbook: .cursor/skills/fantasia-drag-drop/SKILL.md (Vertical draggable tab strips).
 */

/** Allowed text-align values for faVerticalDraggableTabs tab rows and labels. */
export type T_faVerticalDraggableTabsTabTextAlign = 'center' | 'left' | 'right'

/** Allowed text-transform values for faVerticalDraggableTabs tab labels. */
export type T_faVerticalDraggableTabsTabLabelTextTransform = 'capitalize' | 'none' | 'uppercase'

/**
 * CSS justify-content keywords supported on faVerticalDraggableTabs tab rows.
 * Pass through tabJustifyContent on the column host SFC.
 */
export type T_faVerticalDraggableTabsTabJustifyContent =
  | 'center'
  | 'end'
  | 'flex-end'
  | 'flex-start'
  | 'left'
  | 'right'
  | 'space-around'
  | 'space-between'
  | 'space-evenly'
  | 'start'

/**
 * Inputs for buildFaVerticalDraggableTabsRootStyle — one object per column root.
 *
 * tabPadding is a full CSS padding shorthand string (for example '4px 40px 4px 60px').
 * tabLabelFontSize is any valid CSS font-size (for example '15px' or '1rem').
 * tabDense when true sets tab min-height to 36px (normal mode fallback is 48px).
 */
export interface I_faVerticalDraggableTabsRootStyleInput {
  columnWidthPx: number
  tabDense?: boolean
  tabJustifyContent: T_faVerticalDraggableTabsTabJustifyContent
  tabLabelFontSize: string
  tabLabelTextTransform: T_faVerticalDraggableTabsTabLabelTextTransform
  tabPadding: string
  tabTextAlign: T_faVerticalDraggableTabsTabTextAlign
}
