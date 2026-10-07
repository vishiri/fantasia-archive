import type { T_faAppThemeSkin } from 'app/types/faUserSettingsAppThemeRegistry'

export const FA_PROJECT_OVERVIEW_CHART_SETTLE_MS = 600

/**
 * FA 1.0 ProjectScreen used height 425 with CSS svg height 425px + content-box
 * padding-bottom so diagonal category labels have room under the plot.
 * +20 after title/pad tighten (keep in sync with $projectOverview-graph-apex-svg-height).
 */
export const FA_PROJECT_OVERVIEW_CHART_HEIGHT_PX = 445
/**
 * Same card delta as tips-hidden containers (808 - 587 = 221).
 * Keep in sync with $projectOverview-graph-apex-svg-height-tipsHidden (height + 2).
 */
export const FA_PROJECT_OVERVIEW_CHART_HEIGHT_TIPS_HIDDEN_PX = 666
/**
 * Flat theme subtitle margin is 23px taller than fantasy (-8 vs 15).
 * Keep in sync with FA_PROJECT_OVERVIEW_GRAPH_HEIGHT_FLAT_THEME_OFFSET_PX.
 */
export const FA_PROJECT_OVERVIEW_CHART_HEIGHT_FLAT_THEME_OFFSET_PX = 23
/** CSS svg height is Apex height + 2px (see $projectOverview-graph-apex-svg-height). */
export const FA_PROJECT_OVERVIEW_CHART_SVG_HEIGHT_EXTRA_PX = 2
/**
 * Apex default maxHeight is 120 — long rotated titles need a bit more before clip.
 * Keep in sync with bottom padding / svg overflow under the plot.
 */
export const FA_PROJECT_OVERVIEW_CHART_XAXIS_LABELS_MAX_HEIGHT_PX = 130
/** Extra top pad so stacked totals sit clear of the plot edge. */
export const FA_PROJECT_OVERVIEW_CHART_TOP_RESERVED_PX = 28

/**
 * Apex chart height from Hide tips + flat/fantasy skin.
 */
export function resolveProjectOverviewChartHeightPx (input: {
  hideTooltipsProject: boolean
  themeSkin: T_faAppThemeSkin
}): number {
  const baseHeight = input.hideTooltipsProject
    ? FA_PROJECT_OVERVIEW_CHART_HEIGHT_TIPS_HIDDEN_PX
    : FA_PROJECT_OVERVIEW_CHART_HEIGHT_PX
  if (input.themeSkin === 'flat') {
    return baseHeight - FA_PROJECT_OVERVIEW_CHART_HEIGHT_FLAT_THEME_OFFSET_PX
  }
  return baseHeight
}

/**
 * CSS svg height paired with Apex chart height.
 */
export function resolveProjectOverviewChartSvgHeightPx (chartHeightPx: number): number {
  return chartHeightPx + FA_PROJECT_OVERVIEW_CHART_SVG_HEIGHT_EXTRA_PX
}
