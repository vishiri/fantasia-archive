import type { I_faProjectDocumentDistributionResult } from 'app/types/I_faProjectDocumentLastOpenedDomain'
import type { I_ref } from 'app/types/I_vueCompositionShims'
import type { I_faProjectOverviewChartSeries } from 'app/types/I_faProjectOverviewChart'

import { Result } from 'neverthrow'

import {
  buildProjectOverviewApexChartOptions
} from './buildProjectOverviewApexChartOptionsWiring'
import { buildProjectOverviewApexChartTooltipHtml } from '../functions/buildProjectOverviewApexChartTooltipHtml'
import { buildProjectOverviewStackedChartModel } from '../functions/buildProjectOverviewStackedChartModel'
import { createProjectOverviewApexTooltipCustom } from '../functions/createProjectOverviewApexTooltipCustom'
import { mapProjectOverviewTranslationStrings } from '../functions/parseProjectOverviewTranslationsJson'
import { resolveProjectOverviewApexColumnWidth } from '../functions/resolveProjectOverviewApexColumnWidth'
import { resolveProjectOverviewGraphCardWidthPx } from '../functions/resolveProjectOverviewGraphCardWidth'
import { attachProjectOverviewApexTooltipAboveBarEvents } from './projectOverviewApexTooltipAboveBarWiring'

/**
 * Best-effort parse of a translations JSON map for overview chart labels.
 */
export function parseProjectOverviewTranslationsJson (raw: string): Record<string, string> {
  const parsed = Result.fromThrowable(
    () => JSON.parse(raw) as unknown,
    () => undefined
  )().unwrapOr(undefined)
  if (parsed === undefined) {
    return {}
  }
  return mapProjectOverviewTranslationStrings(parsed)
}

/**
 * Applies distribution IPC payload into overview chart refs (series, options, width).
 */
export function applyProjectOverviewChartModel (input: {
  chartOptions: I_ref<Record<string, unknown>>
  chartSeries: I_ref<I_faProjectOverviewChartSeries[]>
  distribution: I_faProjectDocumentDistributionResult
  graphCardWidthPx: I_ref<number>
  hasDocumentTemplates: I_ref<boolean>
  lastOpenedItemCount: number
  preferredLanguageCode: () => string
  resolveChartHeightPx: () => number
  resolveDocumentCountSeparator: () => string
  resolveDocumentsLabelSuffix: () => string
  totalDocumentCount: I_ref<number>
}): void {
  const chartModel = buildProjectOverviewStackedChartModel({
    distribution: input.distribution,
    preferredLanguageCode: input.preferredLanguageCode(),
    parseTranslationsJson: parseProjectOverviewTranslationsJson
  })
  const fullsize = chartModel.totalDocumentCount === 0 || input.lastOpenedItemCount === 0
  const graphCardWidthPx = resolveProjectOverviewGraphCardWidthPx({
    categoryCount: chartModel.categories.length,
    fullsize
  })
  input.graphCardWidthPx.value = graphCardWidthPx
  input.chartSeries.value = chartModel.series
  input.chartOptions.value = attachProjectOverviewApexTooltipAboveBarEvents(
    buildProjectOverviewApexChartOptions({
      chartHeightPx: input.resolveChartHeightPx(),
      chartModel,
      columnWidth: resolveProjectOverviewApexColumnWidth(
        chartModel.categories.length,
        graphCardWidthPx
      ),
      tooltipCustom: createProjectOverviewApexTooltipCustom({
        buildTooltipHtml: buildProjectOverviewApexChartTooltipHtml,
        documentCountSeparator: input.resolveDocumentCountSeparator(),
        documentsLabelSuffix: input.resolveDocumentsLabelSuffix()
      })
    })
  )
  input.totalDocumentCount.value = chartModel.totalDocumentCount
  input.hasDocumentTemplates.value = input.distribution.documentTemplateTotalCount > 0
}
