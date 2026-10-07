import { ResultAsync } from 'neverthrow'

import type { I_faProjectDocumentLastOpenedItem } from 'app/types/I_faProjectDocumentLastOpenedDomain'
import type { I_ref } from 'app/types/I_vueCompositionShims'

import { didProjectOverviewLastOpenedEmptyBoundaryCross } from '../functions/didProjectOverviewLastOpenedEmptyBoundaryCross'

export function isProjectOverviewRequestCurrent (input: {
  epochAtStart: number | undefined
  readProjectContentEpoch: (() => number | undefined) | undefined
  requestSerial: number
  requestSerialBox: { current: number }
}): boolean {
  if (input.requestSerial !== input.requestSerialBox.current) {
    return false
  }
  return input.readProjectContentEpoch?.() === input.epochAtStart
}

export async function refreshProjectOverviewLastOpenedAfterMru (input: {
  chartLoadInFlight: { current: boolean }
  chartLoading: I_ref<boolean>
  lastOpenedItems: I_ref<I_faProjectDocumentLastOpenedItem[]>
  listDocumentLastOpened: () => Promise<{ items: I_faProjectDocumentLastOpenedItem[] }>
  loadOverviewData: () => Promise<void>
  overviewLastOpenedRequestSerial: { current: number }
  readProjectContentEpoch: (() => number | undefined) | undefined
  scheduleChartSettle: () => void
}): Promise<void> {
  const requestSerial = input.overviewLastOpenedRequestSerial.current + 1
  input.overviewLastOpenedRequestSerial.current = requestSerial
  const epochAtStart = input.readProjectContentEpoch?.()
  const previousCount = input.lastOpenedItems.value.length
  const refreshed = await ResultAsync.fromPromise((async () => {
    const lastOpened = await input.listDocumentLastOpened()
    if (!isProjectOverviewRequestCurrent({
      epochAtStart,
      readProjectContentEpoch: input.readProjectContentEpoch,
      requestSerial,
      requestSerialBox: input.overviewLastOpenedRequestSerial
    })) {
      return
    }
    const nextCount = lastOpened.items.length
    if (didProjectOverviewLastOpenedEmptyBoundaryCross(previousCount, nextCount)) {
      await input.loadOverviewData()
      return
    }
    input.lastOpenedItems.value = lastOpened.items
  })(), (error: unknown) => error)
  if (!isProjectOverviewRequestCurrent({
    epochAtStart,
    readProjectContentEpoch: input.readProjectContentEpoch,
    requestSerial,
    requestSerialBox: input.overviewLastOpenedRequestSerial
  })) {
    return
  }
  if (refreshed.isErr()) {
    console.warn('[ProjectOverview] failed to refresh last opened', refreshed.error)
  }
  if (input.chartLoading.value && !input.chartLoadInFlight.current) {
    input.scheduleChartSettle()
  }
}
