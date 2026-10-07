import {
  computeProjectOverviewApexTooltipAboveBarPosition,
  resolveProjectOverviewApexStackedColumnAnchorRect
} from '../functions/computeProjectOverviewApexTooltipAboveBarPosition'

/* Clears stack top + Apex total data-label above the column. */
const FA_PROJECT_OVERVIEW_APEX_TOOLTIP_ABOVE_GAP_PX = 6
const FA_PROJECT_OVERVIEW_APEX_TOOLTIP_LEFT_VAR = '--fa-po-tt-left'
const FA_PROJECT_OVERVIEW_APEX_TOOLTIP_TOP_VAR = '--fa-po-tt-top'

/**
 * Resolves the hovered bar path from a chart mouse event target.
 */
function resolveProjectOverviewApexHoveredBar (eventTarget: EventTarget | null): Element | null {
  if (!(eventTarget instanceof Element)) {
    return null
  }
  if (eventTarget.classList.contains('apexcharts-bar-area')) {
    return eventTarget
  }
  return eventTarget.closest('.apexcharts-bar-area')
}

/**
 * Collects all stacked segments that share the hovered column data-point index.
 */
function resolveProjectOverviewApexColumnSegmentRects (
  canvas: Element,
  hoveredBar: Element
): Array<{
  bottom: number
  left: number
  right: number
  top: number
}> {
  const dataPointIndex = hoveredBar.getAttribute('j')
  const bars = dataPointIndex === null
    ? [hoveredBar]
    : Array.from(canvas.querySelectorAll(`.apexcharts-bar-area[j="${dataPointIndex}"]`))

  const segmentBars = bars.length > 0 ? bars : [hoveredBar]
  return segmentBars.map((segment) => {
    const rect = segment.getBoundingClientRect()
    const bottom = rect.bottom
    const left = rect.left
    const right = rect.right
    const top = rect.top
    return {
      bottom,
      left,
      right,
      top
    }
  })
}

/**
 * Pins tip coords via CSS variables above the whole stacked column.
 * Apex still writes inline left/top; anchored styles win with !important.
 */
function anchorProjectOverviewApexTooltipAboveBar (bar: Element): void {
  const canvas = bar.closest('.apexcharts-canvas')
  if (!(canvas instanceof HTMLElement)) {
    return
  }

  const tooltip = canvas.querySelector('.apexcharts-tooltip.projectOverview__apexTooltip')
  if (!(tooltip instanceof HTMLElement)) {
    return
  }

  const wrapRect = canvas.getBoundingClientRect()
  const tooltipWidth = tooltip.offsetWidth
  const tooltipHeight = tooltip.offsetHeight
  if (tooltipWidth <= 0 || tooltipHeight <= 0) {
    return
  }

  const columnAnchor = resolveProjectOverviewApexStackedColumnAnchorRect(
    resolveProjectOverviewApexColumnSegmentRects(canvas, bar)
  )
  if (columnAnchor === null) {
    return
  }

  const position = computeProjectOverviewApexTooltipAboveBarPosition({
    barLeft: columnAnchor.left,
    barTop: columnAnchor.top,
    barWidth: columnAnchor.width,
    gapPx: FA_PROJECT_OVERVIEW_APEX_TOOLTIP_ABOVE_GAP_PX,
    tooltipHeight,
    tooltipWidth,
    wrapLeft: wrapRect.left,
    wrapTop: wrapRect.top,
    wrapWidth: wrapRect.width
  })

  tooltip.style.setProperty(FA_PROJECT_OVERVIEW_APEX_TOOLTIP_LEFT_VAR, `${position.leftPx}px`)
  tooltip.style.setProperty(FA_PROJECT_OVERVIEW_APEX_TOOLTIP_TOP_VAR, `${position.topPx}px`)
  tooltip.dataset.placement = position.placement
  tooltip.classList.add('projectOverview__apexTooltip--anchored')
}

/**
 * Clears the above-bar CSS pin so the next hover re-anchors cleanly.
 */
function clearProjectOverviewApexTooltipAboveBarAnchor (eventTarget: EventTarget | null): void {
  if (!(eventTarget instanceof Element)) {
    return
  }
  const canvas = eventTarget.closest('.apexcharts-canvas')
  const tooltip = canvas?.querySelector('.apexcharts-tooltip.projectOverview__apexTooltip')
  if (!(tooltip instanceof HTMLElement)) {
    return
  }
  tooltip.classList.remove('projectOverview__apexTooltip--anchored')
  tooltip.style.removeProperty(FA_PROJECT_OVERVIEW_APEX_TOOLTIP_LEFT_VAR)
  tooltip.style.removeProperty(FA_PROJECT_OVERVIEW_APEX_TOOLTIP_TOP_VAR)
}

/**
 * Chart events that keep the overview tip above the whole stacked column.
 */
export function createProjectOverviewApexTooltipAboveBarChartEvents (): {
  dataPointMouseEnter: (event?: Event | null) => void
  dataPointMouseLeave: (event?: Event | null) => void
  mouseMove: (event?: Event | null) => void
} {
  let hoveredBar: Element | null = null

  const anchorHoveredBar = (): void => {
    if (hoveredBar === null) {
      return
    }
    anchorProjectOverviewApexTooltipAboveBar(hoveredBar)
  }

  const onBarHover = (event?: Event | null): void => {
    if (event == null) {
      return
    }
    const bar = resolveProjectOverviewApexHoveredBar(event.target)
    if (bar === null) {
      return
    }
    hoveredBar = bar
    // Tip stays hidden until anchored. Run after Apex writes inline left/top.
    requestAnimationFrame(anchorHoveredBar)
  }

  const onBarLeave = (event?: Event | null): void => {
    // Apex pathMouseLeave may pass null/undefined instead of a DOM Event.
    const clearFrom = event?.target ?? hoveredBar
    hoveredBar = null
    clearProjectOverviewApexTooltipAboveBarAnchor(clearFrom ?? null)
  }

  return {
    dataPointMouseEnter: onBarHover,
    dataPointMouseLeave: onBarLeave,
    mouseMove: onBarHover
  }
}

/**
 * Merges above-column tooltip placement events into built Apex chart options.
 */
export function attachProjectOverviewApexTooltipAboveBarEvents (
  chartOptions: Record<string, unknown>
): Record<string, unknown> {
  const existingChart = (
    chartOptions.chart && typeof chartOptions.chart === 'object'
      ? chartOptions.chart
      : {}
  ) as Record<string, unknown>
  const existingEvents = (
    existingChart.events && typeof existingChart.events === 'object'
      ? existingChart.events
      : {}
  ) as Record<string, unknown>

  const aboveBarEvents = createProjectOverviewApexTooltipAboveBarChartEvents()
  const events = {
    ...existingEvents,
    ...aboveBarEvents
  }
  const chart = {
    ...existingChart,
    events
  }
  return {
    ...chartOptions,
    chart
  }
}
