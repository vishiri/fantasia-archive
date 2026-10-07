import { ResultAsync } from 'neverthrow'

import type {
  I_faProjectDocumentDistributionResult,
  I_faProjectDocumentLastOpenedItem
} from 'app/types/I_faProjectDocumentLastOpenedDomain'
import type { I_ref } from 'app/types/I_vueCompositionShims'

import type { I_faProjectOverviewChartSeries } from 'app/types/I_faProjectOverviewChart'
import { FA_PROJECT_OVERVIEW_CHART_SETTLE_MS } from '../functions/buildProjectOverviewApexChartOptions'
import { FA_PROJECT_OVERVIEW_GRAPH_CARD_WIDTH_FULLSIZE_PX } from '../functions/resolveProjectOverviewGraphCardWidth'
import { applyProjectOverviewChartModel } from './applyProjectOverviewChartModelWiring'
import {
  isProjectOverviewRequestCurrent,
  refreshProjectOverviewLastOpenedAfterMru
} from './refreshProjectOverviewLastOpenedAfterMruWiring'

async function loadProjectOverviewData (input: {
  chartLoadInFlight: { current: boolean }
  chartLoading: I_ref<boolean>
  chartOptions: I_ref<Record<string, unknown>>
  chartSeries: I_ref<I_faProjectOverviewChartSeries[]>
  clearChartSettleTimer: () => void
  graphCardWidthPx: I_ref<number>
  hasDocumentTemplates: I_ref<boolean>
  lastOpenedItems: I_ref<I_faProjectDocumentLastOpenedItem[]>
  listDocumentDistribution: () => Promise<I_faProjectDocumentDistributionResult>
  listDocumentLastOpened: () => Promise<{ items: I_faProjectDocumentLastOpenedItem[] }>
  overviewChartRequestSerial: { current: number }
  overviewLastOpenedRequestSerial: { current: number }
  preferredLanguageCode: () => string
  readProjectContentEpoch: (() => number | undefined) | undefined
  resolveChartHeightPx: () => number
  resolveDocumentCountSeparator: () => string
  resolveDocumentsLabelSuffix: () => string
  scheduleChartSettle: () => void
  totalDocumentCount: I_ref<number>
}): Promise<void> {
  const chartRequestSerial = input.overviewChartRequestSerial.current + 1
  input.overviewChartRequestSerial.current = chartRequestSerial
  const lastOpenedRequestSerial = input.overviewLastOpenedRequestSerial.current + 1
  input.overviewLastOpenedRequestSerial.current = lastOpenedRequestSerial
  const epochAtStart = input.readProjectContentEpoch?.()
  input.chartLoadInFlight.current = true
  input.chartLoading.value = true
  input.clearChartSettleTimer()
  const loaded = await ResultAsync.fromPromise((async () => {
    const [distribution, lastOpened] = await Promise.all([
      input.listDocumentDistribution(),
      input.listDocumentLastOpened()
    ])
    const chartStillCurrent = isProjectOverviewRequestCurrent({
      epochAtStart,
      readProjectContentEpoch: input.readProjectContentEpoch,
      requestSerial: chartRequestSerial,
      requestSerialBox: input.overviewChartRequestSerial
    })
    const lastOpenedStillCurrent = isProjectOverviewRequestCurrent({
      epochAtStart,
      readProjectContentEpoch: input.readProjectContentEpoch,
      requestSerial: lastOpenedRequestSerial,
      requestSerialBox: input.overviewLastOpenedRequestSerial
    })
    if (!chartStillCurrent && !lastOpenedStillCurrent) {
      return
    }
    if (lastOpenedStillCurrent) {
      input.lastOpenedItems.value = lastOpened.items
    }
    if (chartStillCurrent) {
      applyProjectOverviewChartModel({
        chartOptions: input.chartOptions,
        chartSeries: input.chartSeries,
        distribution,
        graphCardWidthPx: input.graphCardWidthPx,
        hasDocumentTemplates: input.hasDocumentTemplates,
        lastOpenedItemCount: input.lastOpenedItems.value.length,
        preferredLanguageCode: input.preferredLanguageCode,
        resolveChartHeightPx: input.resolveChartHeightPx,
        resolveDocumentCountSeparator: input.resolveDocumentCountSeparator,
        resolveDocumentsLabelSuffix: input.resolveDocumentsLabelSuffix,
        totalDocumentCount: input.totalDocumentCount
      })
    }
  })(), (error: unknown) => error)
  if (!isProjectOverviewRequestCurrent({
    epochAtStart,
    readProjectContentEpoch: input.readProjectContentEpoch,
    requestSerial: chartRequestSerial,
    requestSerialBox: input.overviewChartRequestSerial
  })) {
    return
  }
  input.chartLoadInFlight.current = false
  if (loaded.isErr()) {
    console.warn('[ProjectOverview] failed to load overview data', loaded.error)
    const keepLastOpened = !isProjectOverviewRequestCurrent({
      epochAtStart,
      readProjectContentEpoch: input.readProjectContentEpoch,
      requestSerial: lastOpenedRequestSerial,
      requestSerialBox: input.overviewLastOpenedRequestSerial
    })
    resetProjectOverviewAfterFailedLoad(input, keepLastOpened)
  }
  input.scheduleChartSettle()
}

function resetProjectOverviewAfterFailedLoad (input: {
  chartOptions: I_ref<Record<string, unknown>>
  chartSeries: I_ref<I_faProjectOverviewChartSeries[]>
  graphCardWidthPx: I_ref<number>
  hasDocumentTemplates: I_ref<boolean>
  lastOpenedItems: I_ref<I_faProjectDocumentLastOpenedItem[]>
  totalDocumentCount: I_ref<number>
}, keepLastOpened = false): void {
  input.totalDocumentCount.value = 0
  input.hasDocumentTemplates.value = false
  if (!keepLastOpened) {
    input.lastOpenedItems.value = []
  }
  input.chartSeries.value = []
  input.chartOptions.value = {}
  input.graphCardWidthPx.value = FA_PROJECT_OVERVIEW_GRAPH_CARD_WIDTH_FULLSIZE_PX
}

/**
 * Chart + last-opened fetch lifecycle for Project Overview mount.
 */
export function createProjectOverviewDataLoader (input: {
  chartLoading: I_ref<boolean>
  chartOptions: I_ref<Record<string, unknown>>
  chartSeries: I_ref<I_faProjectOverviewChartSeries[]>
  graphCardWidthPx: I_ref<number>
  hasDocumentTemplates: I_ref<boolean>
  lastOpenedItems: I_ref<I_faProjectDocumentLastOpenedItem[]>
  listDocumentDistribution: () => Promise<I_faProjectDocumentDistributionResult>
  listDocumentLastOpened: () => Promise<{ items: I_faProjectDocumentLastOpenedItem[] }>
  preferredLanguageCode: () => string
  readProjectContentEpoch?: () => number | undefined
  resolveChartHeightPx: () => number
  resolveDocumentCountSeparator: () => string
  resolveDocumentsLabelSuffix: () => string
  totalDocumentCount: I_ref<number>
}): {
    clearChartSettleTimer: () => void
    loadOverviewData: () => Promise<void>
    refreshLastOpenedAfterMru: () => Promise<void>
  } {
  let chartSettleTimerId: ReturnType<typeof setTimeout> | null = null
  const chartLoadInFlight = {
    current: false
  }
  const overviewChartRequestSerial = {
    current: 0
  }
  const overviewLastOpenedRequestSerial = {
    current: 0
  }

  function clearChartSettleTimer (): void {
    if (chartSettleTimerId !== null) {
      clearTimeout(chartSettleTimerId)
      chartSettleTimerId = null
    }
  }

  function scheduleChartSettle (): void {
    clearChartSettleTimer()
    chartSettleTimerId = setTimeout(() => {
      chartSettleTimerId = null
      input.chartLoading.value = false
    }, FA_PROJECT_OVERVIEW_CHART_SETTLE_MS)
  }

  async function loadOverviewData (): Promise<void> {
    await loadProjectOverviewData({
      chartLoadInFlight,
      chartLoading: input.chartLoading,
      chartOptions: input.chartOptions,
      chartSeries: input.chartSeries,
      clearChartSettleTimer,
      graphCardWidthPx: input.graphCardWidthPx,
      hasDocumentTemplates: input.hasDocumentTemplates,
      lastOpenedItems: input.lastOpenedItems,
      listDocumentDistribution: input.listDocumentDistribution,
      listDocumentLastOpened: input.listDocumentLastOpened,
      overviewChartRequestSerial,
      overviewLastOpenedRequestSerial,
      preferredLanguageCode: input.preferredLanguageCode,
      readProjectContentEpoch: input.readProjectContentEpoch,
      resolveChartHeightPx: input.resolveChartHeightPx,
      resolveDocumentCountSeparator: input.resolveDocumentCountSeparator,
      resolveDocumentsLabelSuffix: input.resolveDocumentsLabelSuffix,
      scheduleChartSettle,
      totalDocumentCount: input.totalDocumentCount
    })
  }

  async function refreshLastOpenedAfterMru (): Promise<void> {
    await refreshProjectOverviewLastOpenedAfterMru({
      chartLoadInFlight,
      chartLoading: input.chartLoading,
      lastOpenedItems: input.lastOpenedItems,
      listDocumentLastOpened: input.listDocumentLastOpened,
      loadOverviewData,
      overviewLastOpenedRequestSerial,
      readProjectContentEpoch: input.readProjectContentEpoch,
      scheduleChartSettle
    })
  }

  return {
    clearChartSettleTimer,
    loadOverviewData,
    refreshLastOpenedAfterMru
  }
}
