import type {
  I_faProjectOverviewStackedChartModel,
  T_faProjectOverviewApexTooltipCustom
} from 'app/types/I_faProjectOverviewChart'

import {
  FA_PROJECT_OVERVIEW_CHART_HEIGHT_PX,
  FA_PROJECT_OVERVIEW_CHART_TOP_RESERVED_PX,
  FA_PROJECT_OVERVIEW_CHART_XAXIS_LABELS_MAX_HEIGHT_PX
} from '../functions/buildProjectOverviewApexChartOptions'
import {
  buildProjectOverviewApexXaxis,
  buildProjectOverviewApexYaxis
} from '../functions/buildProjectOverviewApexAxisOptions'
import { buildProjectOverviewApexBarPlotOptions } from '../functions/buildProjectOverviewApexBarPlotOptions'
import { buildProjectOverviewApexChartChrome } from '../functions/buildProjectOverviewApexChartChrome'

/**
 * Builds ApexCharts options for the Project overview stacked document-distribution chart.
 */
export function buildProjectOverviewApexChartOptions (input: {
  chartHeightPx?: number
  chartModel: I_faProjectOverviewStackedChartModel
  columnWidth: string
  tooltipCustom: T_faProjectOverviewApexTooltipCustom
}): Record<string, unknown> {
  const chartHeightPx = input.chartHeightPx ?? FA_PROJECT_OVERVIEW_CHART_HEIGHT_PX
  const colors = input.chartModel.series.map((series) => series.color)
  const totals = input.chartModel.categories.map((_, categoryIndex) => {
    let total = 0
    for (const series of input.chartModel.series) {
      total += series.data[categoryIndex] ?? 0
    }
    return total
  })
  const plotOptions = buildProjectOverviewApexBarPlotOptions({
    columnWidth: input.columnWidth,
    totals
  })
  const xaxis = buildProjectOverviewApexXaxis({
    categories: input.chartModel.categories,
    labelsMaxHeightPx: FA_PROJECT_OVERVIEW_CHART_XAXIS_LABELS_MAX_HEIGHT_PX
  })
  const yaxis = buildProjectOverviewApexYaxis()
  const chartChrome = buildProjectOverviewApexChartChrome({
    chartHeightPx,
    colors,
    plotOptions,
    tooltipCustom: input.tooltipCustom,
    topReservedPx: FA_PROJECT_OVERVIEW_CHART_TOP_RESERVED_PX,
    xaxis,
    yaxis
  })
  return chartChrome
}
