import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import type { I_faProjectDocumentDistributionResult } from 'app/types/I_faProjectDocumentLastOpenedDomain'
import type { I_faProjectDocumentLastOpenedItem } from 'app/types/I_faProjectDocumentLastOpenedDomain'
import type { I_faProjectOverviewChartSeries } from 'app/types/I_faProjectOverviewChart'

import { FA_PROJECT_OVERVIEW_CHART_SETTLE_MS } from '../../functions/buildProjectOverviewApexChartOptions'
import { createProjectOverviewDataLoader } from '../createProjectOverviewDataLoaderWiring'

function makeEmptyDistribution (): I_faProjectDocumentDistributionResult {
  return {
    counts: [],
    templates: [],
    documentTemplateTotalCount: 0,
    totalDocumentCount: 0,
    worlds: []
  }
}

/**
 * createProjectOverviewDataLoader
 * Applies chart model, last-opened rows, and settles loading after the chart delay.
 */
test('Test that createProjectOverviewDataLoader loads chart and last-opened data', async () => {
  vi.useFakeTimers()
  const chartLoading = ref(false)
  const chartOptions = ref<Record<string, unknown>>({})
  const chartSeries = ref<I_faProjectOverviewChartSeries[]>([])
  const graphCardWidthPx = ref(1386)
  const hasDocumentTemplates = ref(false)
  const lastOpenedItems = ref<I_faProjectDocumentLastOpenedItem[]>([])
  const totalDocumentCount = ref(0)

  const { clearChartSettleTimer, loadOverviewData } = createProjectOverviewDataLoader({
    chartLoading,
    chartOptions,
    chartSeries,
    graphCardWidthPx,
    hasDocumentTemplates,
    lastOpenedItems,
    listDocumentDistribution: async () => ({
      counts: [{
        documentCount: 1,
        templateId: 't1',
        worldId: 'w1'
      }],
      templates: [{
        icon: 'mdi-file',
        templateId: 't1',
        titlePluralTranslationsJson: '{"en-US":"Characters"}',
        sortOrder: 0
      }],
      documentTemplateTotalCount: 1,
      totalDocumentCount: 1,
      worlds: [{
        color: '#ff0000',
        displayNameTranslationsJson: '{"en-US":"World"}',
        sortOrder: 0,
        worldId: 'w1'
      }]
    }),
    listDocumentLastOpened: async () => ({
      items: [{
        displayName: 'Hero',
        documentBackgroundColor: null,
        documentId: 'doc-1',
        documentTextColor: null,
        isCategory: false,
        isDead: false,
        openedAtMs: 1,
        templateIcon: 'mdi-account',
        templateId: 't1',
        worldId: 'w1'
      }]
    }),
    preferredLanguageCode: () => 'en-US',
    resolveChartHeightPx: () => 666,
    resolveDocumentCountSeparator: () => ' - ',
    resolveDocumentsLabelSuffix: () => ' documents',
    totalDocumentCount
  })

  const loadPromise = loadOverviewData()
  expect(chartLoading.value).toBe(true)
  await loadPromise

  expect(totalDocumentCount.value).toBe(1)
  expect(hasDocumentTemplates.value).toBe(true)
  expect(chartSeries.value).toHaveLength(1)
  expect(lastOpenedItems.value).toHaveLength(1)
  expect(graphCardWidthPx.value).toBe(1022)
  expect((chartOptions.value.chart as { height: number }).height).toBe(666)

  await vi.advanceTimersByTimeAsync(FA_PROJECT_OVERVIEW_CHART_SETTLE_MS)
  expect(chartLoading.value).toBe(false)

  clearChartSettleTimer()
  vi.useRealTimers()
})

/**
 * createProjectOverviewDataLoader
 * Marks templates present from documentTemplateTotalCount even when none are placed.
 */
test('Test that createProjectOverviewDataLoader sets hasDocumentTemplates from total template count', async () => {
  const chartLoading = ref(false)
  const chartOptions = ref<Record<string, unknown>>({})
  const chartSeries = ref<I_faProjectOverviewChartSeries[]>([])
  const graphCardWidthPx = ref(1386)
  const hasDocumentTemplates = ref(false)
  const lastOpenedItems = ref<I_faProjectDocumentLastOpenedItem[]>([])
  const totalDocumentCount = ref(0)

  const { loadOverviewData } = createProjectOverviewDataLoader({
    chartLoading,
    chartOptions,
    chartSeries,
    graphCardWidthPx,
    hasDocumentTemplates,
    lastOpenedItems,
    listDocumentDistribution: async () => ({
      counts: [],
      documentTemplateTotalCount: 2,
      templates: [],
      totalDocumentCount: 0,
      worlds: []
    }),
    listDocumentLastOpened: async () => ({ items: [] }),
    preferredLanguageCode: () => 'en-US',
    resolveChartHeightPx: () => 445,
    resolveDocumentCountSeparator: () => ' - ',
    resolveDocumentsLabelSuffix: () => ' documents',
    totalDocumentCount
  })

  await loadOverviewData()
  expect(hasDocumentTemplates.value).toBe(true)
  expect(totalDocumentCount.value).toBe(0)
})

/**
 * createProjectOverviewDataLoader
 * Clears a pending settle timer on reload and resets state when fetch throws.
 */
test('Test that createProjectOverviewDataLoader clears settle timer and handles load errors', async () => {
  vi.useFakeTimers()
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  const chartLoading = ref(false)
  const chartOptions = ref<Record<string, unknown>>({ keep: true })
  const chartSeries = ref<I_faProjectOverviewChartSeries[]>([{
    color: '#111',
    data: [1],
    name: 'Old'
  }])
  const graphCardWidthPx = ref(1022)
  const hasDocumentTemplates = ref(true)
  const lastOpenedItems = ref<I_faProjectDocumentLastOpenedItem[]>([{
    displayName: 'Old',
    documentBackgroundColor: null,
    documentId: 'old',
    documentTextColor: null,
    isCategory: false,
    isDead: false,
    openedAtMs: 1,
    templateIcon: '',
    templateId: 't1',
    worldId: 'w1'
  }])
  const totalDocumentCount = ref(9)

  let failNext = false
  const { clearChartSettleTimer, loadOverviewData } = createProjectOverviewDataLoader({
    chartLoading,
    chartOptions,
    chartSeries,
    graphCardWidthPx,
    hasDocumentTemplates,
    lastOpenedItems,
    listDocumentDistribution: async () => {
      if (failNext) {
        throw new Error('boom')
      }
      return makeEmptyDistribution()
    },
    listDocumentLastOpened: async () => ({ items: [] }),
    preferredLanguageCode: () => 'en-US',
    resolveChartHeightPx: () => 445,
    resolveDocumentCountSeparator: () => ' - ',
    resolveDocumentsLabelSuffix: () => ' documents',
    totalDocumentCount
  })

  await loadOverviewData()
  expect(chartLoading.value).toBe(true)

  failNext = true
  await loadOverviewData()
  expect(totalDocumentCount.value).toBe(0)
  expect(hasDocumentTemplates.value).toBe(false)
  expect(lastOpenedItems.value).toEqual([])
  expect(chartSeries.value).toEqual([])
  expect(chartOptions.value).toEqual({})
  expect(graphCardWidthPx.value).toBe(1386)
  expect(warnSpy).toHaveBeenCalled()

  clearChartSettleTimer()
  warnSpy.mockRestore()
  vi.useRealTimers()
})

const sampleLastOpenedItem: I_faProjectDocumentLastOpenedItem = {
  displayName: 'Hero',
  documentBackgroundColor: null,
  documentId: 'doc-1',
  documentTextColor: null,
  isCategory: false,
  isDead: false,
  openedAtMs: 1,
  templateIcon: 'mdi-account',
  templateId: 't1',
  worldId: 'w1'
}

function makeOneDocDistribution (): I_faProjectDocumentDistributionResult {
  return {
    counts: [{
      documentCount: 1,
      templateId: 't1',
      worldId: 'w1'
    }],
    templates: [{
      icon: 'mdi-file',
      templateId: 't1',
      titlePluralTranslationsJson: '{"en-US":"Characters"}',
      sortOrder: 0
    }],
    documentTemplateTotalCount: 1,
    totalDocumentCount: 1,
    worlds: [{
      color: '#ff0000',
      displayNameTranslationsJson: '{"en-US":"World"}',
      sortOrder: 0,
      worldId: 'w1'
    }]
  }
}

/**
 * createProjectOverviewDataLoader.refreshLastOpenedAfterMru
 * Updates Last opened rows without chart reload when count stays non-empty.
 */
test('Test that refreshLastOpenedAfterMru updates list without chart reload when non-empty', async () => {
  vi.useFakeTimers()
  const chartLoading = ref(false)
  const chartOptions = ref<Record<string, unknown>>({})
  const chartSeries = ref<I_faProjectOverviewChartSeries[]>([])
  const graphCardWidthPx = ref(1386)
  const hasDocumentTemplates = ref(false)
  const lastOpenedItems = ref<I_faProjectDocumentLastOpenedItem[]>([sampleLastOpenedItem])
  const totalDocumentCount = ref(1)
  const listDocumentDistribution = vi.fn(async () => makeOneDocDistribution())
  const listDocumentLastOpened = vi.fn(async () => ({
    items: [
      sampleLastOpenedItem,
      {
        ...sampleLastOpenedItem,
        documentId: 'doc-2',
        displayName: 'Villain'
      }
    ]
  }))

  const { clearChartSettleTimer, loadOverviewData, refreshLastOpenedAfterMru } =
    createProjectOverviewDataLoader({
      chartLoading,
      chartOptions,
      chartSeries,
      graphCardWidthPx,
      hasDocumentTemplates,
      lastOpenedItems,
      listDocumentDistribution,
      listDocumentLastOpened,
      preferredLanguageCode: () => 'en-US',
      resolveChartHeightPx: () => 666,
      resolveDocumentCountSeparator: () => ' - ',
      resolveDocumentsLabelSuffix: () => ' documents',
      totalDocumentCount
    })

  await loadOverviewData()
  await vi.advanceTimersByTimeAsync(FA_PROJECT_OVERVIEW_CHART_SETTLE_MS)
  listDocumentDistribution.mockClear()
  chartLoading.value = false

  await refreshLastOpenedAfterMru()
  expect(listDocumentDistribution).not.toHaveBeenCalled()
  expect(chartLoading.value).toBe(false)
  expect(lastOpenedItems.value).toHaveLength(2)

  clearChartSettleTimer()
  vi.useRealTimers()
})

/**
 * createProjectOverviewDataLoader
 * A later settle replaces the pending timer so the older one cannot end loading early.
 */
test('Test that an older overview chart settle does not end loading after a newer settle', async () => {
  vi.useFakeTimers()
  const chartLoading = ref(false)
  const chartOptions = ref<Record<string, unknown>>({})
  const chartSeries = ref<I_faProjectOverviewChartSeries[]>([])
  const graphCardWidthPx = ref(1386)
  const hasDocumentTemplates = ref(false)
  const lastOpenedItems = ref<I_faProjectDocumentLastOpenedItem[]>([])
  const totalDocumentCount = ref(0)
  const listDocumentLastOpened = vi.fn(async () => ({
    items: [
      sampleLastOpenedItem,
      {
        ...sampleLastOpenedItem,
        documentId: 'doc-2',
        displayName: 'Villain'
      }
    ]
  }))

  const { clearChartSettleTimer, loadOverviewData, refreshLastOpenedAfterMru } =
    createProjectOverviewDataLoader({
      chartLoading,
      chartOptions,
      chartSeries,
      graphCardWidthPx,
      hasDocumentTemplates,
      lastOpenedItems,
      listDocumentDistribution: async () => makeOneDocDistribution(),
      listDocumentLastOpened,
      preferredLanguageCode: () => 'en-US',
      resolveChartHeightPx: () => 666,
      resolveDocumentCountSeparator: () => ' - ',
      resolveDocumentsLabelSuffix: () => ' documents',
      totalDocumentCount
    })

  await loadOverviewData()
  expect(chartLoading.value).toBe(true)
  await vi.advanceTimersByTimeAsync(200)
  await refreshLastOpenedAfterMru()
  await vi.advanceTimersByTimeAsync(FA_PROJECT_OVERVIEW_CHART_SETTLE_MS - 200)
  expect(chartLoading.value).toBe(true)
  await vi.advanceTimersByTimeAsync(200)
  expect(chartLoading.value).toBe(false)

  clearChartSettleTimer()
  vi.useRealTimers()
})

/**
 * createProjectOverviewDataLoader.refreshLastOpenedAfterMru
 * Full overview reload when Last opened crosses empty↔non-empty.
 */
test('Test that refreshLastOpenedAfterMru reloads chart when empty boundary crosses', async () => {
  vi.useFakeTimers()
  const chartLoading = ref(false)
  const chartOptions = ref<Record<string, unknown>>({})
  const chartSeries = ref<I_faProjectOverviewChartSeries[]>([])
  const graphCardWidthPx = ref(1386)
  const hasDocumentTemplates = ref(false)
  const lastOpenedItems = ref<I_faProjectDocumentLastOpenedItem[]>([])
  const totalDocumentCount = ref(0)
  const listDocumentDistribution = vi.fn(async () => makeOneDocDistribution())
  const listDocumentLastOpened = vi.fn(async () => ({
    items: [sampleLastOpenedItem]
  }))

  const { clearChartSettleTimer, refreshLastOpenedAfterMru } = createProjectOverviewDataLoader({
    chartLoading,
    chartOptions,
    chartSeries,
    graphCardWidthPx,
    hasDocumentTemplates,
    lastOpenedItems,
    listDocumentDistribution,
    listDocumentLastOpened,
    preferredLanguageCode: () => 'en-US',
    resolveChartHeightPx: () => 666,
    resolveDocumentCountSeparator: () => ' - ',
    resolveDocumentsLabelSuffix: () => ' documents',
    totalDocumentCount
  })

  await refreshLastOpenedAfterMru()
  expect(listDocumentDistribution).toHaveBeenCalledTimes(1)
  expect(chartLoading.value).toBe(true)
  expect(lastOpenedItems.value).toHaveLength(1)
  expect(totalDocumentCount.value).toBe(1)

  clearChartSettleTimer()
  vi.useRealTimers()
})

/**
 * createProjectOverviewDataLoader
 * Drops chart and Last opened writes when the project epoch moves during the fetch.
 */
test('Test that loadOverviewData drops a read from an older project', async () => {
  let resolveDistribution: ((value: I_faProjectDocumentDistributionResult) => void) | undefined
  const pendingDistribution = new Promise<I_faProjectDocumentDistributionResult>((resolve) => {
    resolveDistribution = resolve
  })
  let epoch = 1
  const chartLoading = ref(false)
  const chartOptions = ref<Record<string, unknown>>({ keep: true })
  const chartSeries = ref<I_faProjectOverviewChartSeries[]>([])
  const graphCardWidthPx = ref(500)
  const hasDocumentTemplates = ref(false)
  const lastOpenedItems = ref<I_faProjectDocumentLastOpenedItem[]>([])
  const totalDocumentCount = ref(4)

  const loadPromise = createProjectOverviewDataLoader({
    chartLoading,
    chartOptions,
    chartSeries,
    graphCardWidthPx,
    hasDocumentTemplates,
    lastOpenedItems,
    listDocumentDistribution: () => pendingDistribution,
    listDocumentLastOpened: async () => ({ items: [sampleLastOpenedItem] }),
    preferredLanguageCode: () => 'en-US',
    readProjectContentEpoch: () => epoch,
    resolveChartHeightPx: () => 445,
    resolveDocumentCountSeparator: () => ' - ',
    resolveDocumentsLabelSuffix: () => ' documents',
    totalDocumentCount
  }).loadOverviewData()

  await Promise.resolve()
  epoch = 2
  const finishDistribution = resolveDistribution
  if (finishDistribution === undefined) {
    throw new Error('missing distribution resolver')
  }
  finishDistribution(makeOneDocDistribution())
  await loadPromise
  expect(totalDocumentCount.value).toBe(4)
  expect(lastOpenedItems.value).toEqual([])
  expect(chartOptions.value).toEqual({ keep: true })
  expect(chartLoading.value).toBe(true)
})

/**
 * createProjectOverviewDataLoader.refreshLastOpenedAfterMru
 * Drops a Last opened refresh when the project epoch moves during the fetch.
 */
test('Test that refreshLastOpenedAfterMru drops a read from an older project', async () => {
  let resolveLastOpened: ((value: { items: I_faProjectDocumentLastOpenedItem[] }) => void) | undefined
  const pendingLastOpened = new Promise<{ items: I_faProjectDocumentLastOpenedItem[] }>((resolve) => {
    resolveLastOpened = resolve
  })
  let epoch = 1
  const lastOpenedItems = ref<I_faProjectDocumentLastOpenedItem[]>([sampleLastOpenedItem])

  const refreshPromise = createProjectOverviewDataLoader({
    chartLoading: ref(false),
    chartOptions: ref({}),
    chartSeries: ref([]),
    graphCardWidthPx: ref(500),
    hasDocumentTemplates: ref(true),
    lastOpenedItems,
    listDocumentDistribution: async () => makeOneDocDistribution(),
    listDocumentLastOpened: () => pendingLastOpened,
    preferredLanguageCode: () => 'en-US',
    readProjectContentEpoch: () => epoch,
    resolveChartHeightPx: () => 445,
    resolveDocumentCountSeparator: () => ' - ',
    resolveDocumentsLabelSuffix: () => ' documents',
    totalDocumentCount: ref(1)
  }).refreshLastOpenedAfterMru()

  await Promise.resolve()
  epoch = 2
  const finishLastOpened = resolveLastOpened
  if (finishLastOpened === undefined) {
    throw new Error('missing last-opened resolver')
  }
  finishLastOpened({
    items: [{
      ...sampleLastOpenedItem,
      documentId: 'stale'
    }]
  })
  await refreshPromise
  expect(lastOpenedItems.value).toEqual([sampleLastOpenedItem])
})

test('Test that loadOverviewData ignores an older overlapping read', async () => {
  let resolveSlowDistribution: ((value: I_faProjectDocumentDistributionResult) => void) | undefined
  const slowDistribution = new Promise<I_faProjectDocumentDistributionResult>((resolve) => {
    resolveSlowDistribution = resolve
  })
  let distributionCallCount = 0
  const chartLoading = ref(false)
  const chartOptions = ref<Record<string, unknown>>({})
  const chartSeries = ref<I_faProjectOverviewChartSeries[]>([])
  const graphCardWidthPx = ref(500)
  const hasDocumentTemplates = ref(false)
  const lastOpenedItems = ref<I_faProjectDocumentLastOpenedItem[]>([])
  const totalDocumentCount = ref(0)
  const freshItem: I_faProjectDocumentLastOpenedItem = {
    ...sampleLastOpenedItem,
    displayName: 'Fresh'
  }
  const { loadOverviewData } = createProjectOverviewDataLoader({
    chartLoading,
    chartOptions,
    chartSeries,
    graphCardWidthPx,
    hasDocumentTemplates,
    lastOpenedItems,
    listDocumentDistribution: () => {
      distributionCallCount += 1
      if (distributionCallCount === 1) {
        return slowDistribution
      }
      return Promise.resolve(makeOneDocDistribution())
    },
    listDocumentLastOpened: async () => {
      if (distributionCallCount === 1) {
        return {
          items: [sampleLastOpenedItem]
        }
      }
      return {
        items: [freshItem]
      }
    },
    preferredLanguageCode: () => 'en-US',
    resolveChartHeightPx: () => 445,
    resolveDocumentCountSeparator: () => ' - ',
    resolveDocumentsLabelSuffix: () => ' documents',
    totalDocumentCount
  })
  const slowLoad = loadOverviewData()
  await loadOverviewData()
  const finishSlow = resolveSlowDistribution
  if (finishSlow === undefined) {
    throw new Error('missing distribution resolver')
  }
  finishSlow(makeEmptyDistribution())
  await slowLoad
  expect(lastOpenedItems.value).toEqual([freshItem])
  expect(totalDocumentCount.value).toBe(1)
})

test('Test that refreshLastOpenedAfterMru keeps an in-flight chart load', async () => {
  let resolveDistribution: ((value: I_faProjectDocumentDistributionResult) => void) | undefined
  const pendingDistribution = new Promise<I_faProjectDocumentDistributionResult>((resolve) => {
    resolveDistribution = resolve
  })
  let resolveLoadLastOpened: ((
    value: { items: I_faProjectDocumentLastOpenedItem[] }
  ) => void) | undefined
  const pendingLoadLastOpened = new Promise<{ items: I_faProjectDocumentLastOpenedItem[] }>(
    (resolve) => {
      resolveLoadLastOpened = resolve
    }
  )
  let lastOpenedCallCount = 0
  const chartSeries = ref<I_faProjectOverviewChartSeries[]>([])
  const lastOpenedItems = ref<I_faProjectDocumentLastOpenedItem[]>([sampleLastOpenedItem])
  const totalDocumentCount = ref(0)
  const refreshedItem: I_faProjectDocumentLastOpenedItem = {
    ...sampleLastOpenedItem,
    displayName: 'Refreshed'
  }
  const listDocumentDistribution = vi.fn(() => pendingDistribution)
  const { loadOverviewData, refreshLastOpenedAfterMru } = createProjectOverviewDataLoader({
    chartLoading: ref(false),
    chartOptions: ref({}),
    chartSeries,
    graphCardWidthPx: ref(500),
    hasDocumentTemplates: ref(false),
    lastOpenedItems,
    listDocumentDistribution,
    listDocumentLastOpened: () => {
      lastOpenedCallCount += 1
      if (lastOpenedCallCount === 1) {
        return pendingLoadLastOpened
      }
      return Promise.resolve({
        items: [sampleLastOpenedItem, refreshedItem]
      })
    },
    preferredLanguageCode: () => 'en-US',
    resolveChartHeightPx: () => 445,
    resolveDocumentCountSeparator: () => ' - ',
    resolveDocumentsLabelSuffix: () => ' documents',
    totalDocumentCount
  })
  const loadPromise = loadOverviewData()
  await Promise.resolve()
  await refreshLastOpenedAfterMru()
  const finishDistribution = resolveDistribution
  const finishLoadLastOpened = resolveLoadLastOpened
  if (finishDistribution === undefined || finishLoadLastOpened === undefined) {
    throw new Error('missing overview load resolver')
  }
  finishDistribution(makeOneDocDistribution())
  finishLoadLastOpened({
    items: [sampleLastOpenedItem]
  })
  await loadPromise
  expect(listDocumentDistribution).toHaveBeenCalledTimes(1)
  expect(totalDocumentCount.value).toBe(1)
  expect(chartSeries.value.length).toBeGreaterThan(0)
  expect(lastOpenedItems.value).toEqual([sampleLastOpenedItem, refreshedItem])
})

test('Test that a failed chart load keeps a newer Last opened refresh', async () => {
  let rejectDistribution: ((error: Error) => void) | undefined
  const pendingDistribution = new Promise<I_faProjectDocumentDistributionResult>((_resolve, reject) => {
    rejectDistribution = reject
  })
  let lastOpenedCallCount = 0
  const chartSeries = ref<I_faProjectOverviewChartSeries[]>([{
    color: '#112233',
    data: [1],
    name: 'Kept'
  }])
  const lastOpenedItems = ref<I_faProjectDocumentLastOpenedItem[]>([sampleLastOpenedItem])
  const totalDocumentCount = ref(4)
  const refreshedItem: I_faProjectDocumentLastOpenedItem = {
    ...sampleLastOpenedItem,
    displayName: 'Refreshed'
  }
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  const { loadOverviewData, refreshLastOpenedAfterMru } = createProjectOverviewDataLoader({
    chartLoading: ref(true),
    chartOptions: ref({ keep: true }),
    chartSeries,
    graphCardWidthPx: ref(500),
    hasDocumentTemplates: ref(true),
    lastOpenedItems,
    listDocumentDistribution: () => pendingDistribution,
    listDocumentLastOpened: () => {
      lastOpenedCallCount += 1
      if (lastOpenedCallCount === 1) {
        return new Promise(() => undefined)
      }
      return Promise.resolve({
        items: [refreshedItem]
      })
    },
    preferredLanguageCode: () => 'en-US',
    resolveChartHeightPx: () => 445,
    resolveDocumentCountSeparator: () => ' - ',
    resolveDocumentsLabelSuffix: () => ' documents',
    totalDocumentCount
  })
  const loadPromise = loadOverviewData()
  await Promise.resolve()
  await refreshLastOpenedAfterMru()
  const failDistribution = rejectDistribution
  if (failDistribution === undefined) {
    throw new Error('missing distribution reject')
  }
  failDistribution(new Error('boom'))
  await loadPromise
  expect(lastOpenedItems.value).toEqual([refreshedItem])
  expect(totalDocumentCount.value).toBe(0)
  expect(chartSeries.value).toEqual([])
  warnSpy.mockRestore()
})

/**
 * createProjectOverviewDataLoader.refreshLastOpenedAfterMru
 * A Last opened refresh that finishes during a chart load must not end the chart spinner.
 */
test('Test that refreshLastOpenedAfterMru does not end chart loading during an in-flight chart load', async () => {
  vi.useFakeTimers()
  const chartLoading = ref(false)
  const chartOptions = ref<Record<string, unknown>>({})
  const chartSeries = ref<I_faProjectOverviewChartSeries[]>([])
  const graphCardWidthPx = ref(1386)
  const hasDocumentTemplates = ref(false)
  const lastOpenedItems = ref<I_faProjectDocumentLastOpenedItem[]>([sampleLastOpenedItem])
  const totalDocumentCount = ref(1)
  let releaseChartLoad: (() => void) | undefined
  const chartLoadGate = new Promise<void>((resolve) => {
    releaseChartLoad = resolve
  })
  let lastOpenedCallCount = 0

  const { clearChartSettleTimer, loadOverviewData, refreshLastOpenedAfterMru } =
    createProjectOverviewDataLoader({
      chartLoading,
      chartOptions,
      chartSeries,
      graphCardWidthPx,
      hasDocumentTemplates,
      lastOpenedItems,
      listDocumentDistribution: async () => {
        await chartLoadGate
        return makeOneDocDistribution()
      },
      listDocumentLastOpened: async () => {
        lastOpenedCallCount += 1
        if (lastOpenedCallCount === 1) {
          await chartLoadGate
        }
        return {
          items: [
            sampleLastOpenedItem,
            {
              ...sampleLastOpenedItem,
              displayName: 'Villain',
              documentId: 'doc-2'
            }
          ]
        }
      },
      preferredLanguageCode: () => 'en-US',
      resolveChartHeightPx: () => 666,
      resolveDocumentCountSeparator: () => ' - ',
      resolveDocumentsLabelSuffix: () => ' documents',
      totalDocumentCount
    })

  const loadPromise = loadOverviewData()
  await Promise.resolve()
  expect(chartLoading.value).toBe(true)
  await refreshLastOpenedAfterMru()
  await vi.advanceTimersByTimeAsync(FA_PROJECT_OVERVIEW_CHART_SETTLE_MS)
  expect(chartLoading.value).toBe(true)
  const release = releaseChartLoad
  if (release === undefined) {
    throw new Error('missing chart load release')
  }
  release()
  await loadPromise
  expect(chartLoading.value).toBe(true)
  await vi.advanceTimersByTimeAsync(FA_PROJECT_OVERVIEW_CHART_SETTLE_MS)
  expect(chartLoading.value).toBe(false)
  expect(lastOpenedItems.value).toHaveLength(2)

  clearChartSettleTimer()
  vi.useRealTimers()
})
