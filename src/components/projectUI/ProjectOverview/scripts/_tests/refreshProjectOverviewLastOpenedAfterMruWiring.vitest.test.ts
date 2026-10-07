import { ref } from 'vue'
import { expect, test, vi } from 'vitest'

import { refreshProjectOverviewLastOpenedAfterMru } from '../refreshProjectOverviewLastOpenedAfterMruWiring'

test('Test that last opened refresh warns when the list read fails', async () => {
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  const scheduleChartSettle = vi.fn()
  await refreshProjectOverviewLastOpenedAfterMru({
    chartLoadInFlight: { current: false },
    chartLoading: ref(true),
    lastOpenedItems: ref([]),
    listDocumentLastOpened: async () => {
      throw new Error('last-opened-fail')
    },
    loadOverviewData: async () => undefined,
    overviewLastOpenedRequestSerial: { current: 0 },
    readProjectContentEpoch: () => 1,
    scheduleChartSettle
  })
  expect(warnSpy).toHaveBeenCalled()
  expect(scheduleChartSettle).toHaveBeenCalled()
  warnSpy.mockRestore()
})
