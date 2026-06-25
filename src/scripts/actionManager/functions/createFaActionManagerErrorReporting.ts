import type { I_faActionFailureLog, I_faActionQueueEntry } from 'app/types/I_faActionManagerDomain'

import type { T_injectedResultFromThrowable } from 'app/types/I_injectedNeverthrow'

type T_createFaActionManagerErrorReportingDeps = {
  fromThrowable: T_injectedResultFromThrowable
  normalizeFaActionError: (error: unknown) => { name: string, message: string, stack?: string }
  notifyCreate: (options: Record<string, unknown>) => void
  readFaProjectOpenFailedShape: (error: unknown) => {
    attemptedFilePath?: string
    notifyType?: 'negative' | 'warning'
  } | null
  resolveFaActionManagerStore: () => {
    recordFailure: (failure: I_faActionFailureLog) => void
  } | null
  resolveFaActionFailureNotifyCaption: (
    entry: I_faActionQueueEntry,
    error: unknown,
    normalizedMessage: string
  ) => string
  translateActionFailed: (actionId: string) => string
}

function buildFaActionPayloadPreview (
  deps: T_createFaActionManagerErrorReportingDeps,
  payload: unknown,
  maxLength = 400
): string {
  if (payload === undefined) {
    return ''
  }
  if (payload !== null && typeof payload === 'object' && !Array.isArray(payload)) {
    const plain = payload as Record<string, unknown>
    if (Object.keys(plain).length === 0) {
      return ''
    }
  }
  const serializedResult = deps.fromThrowable(
    (): string => JSON.stringify(payload),
    (): undefined => undefined
  )()
  if (serializedResult.isErr()) {
    return '[unserializable]'
  }
  const serialized = serializedResult.value
  if (serialized === undefined) {
    return ''
  }
  if (serialized.length <= maxLength) {
    return serialized
  }
  return `${serialized.slice(0, maxLength)}...`
}

function buildFaActionFailureHistoryPayloadPreview (
  deps: T_createFaActionManagerErrorReportingDeps,
  error: unknown
): string | undefined {
  const projectOpenFailed = deps.readFaProjectOpenFailedShape(error)
  if (projectOpenFailed === null) {
    return undefined
  }
  const row: Record<string, string> = {
    errorMessage: (error as Error).message
  }
  if (projectOpenFailed.attemptedFilePath !== undefined) {
    row.filePath = projectOpenFailed.attemptedFilePath
  }
  return buildFaActionPayloadPreview(deps, row, Number.POSITIVE_INFINITY)
}

function reportFaActionFailure (
  deps: T_createFaActionManagerErrorReportingDeps,
  entry: I_faActionQueueEntry,
  error: unknown
): I_faActionFailureLog {
  const normalized = deps.normalizeFaActionError(error)
  const payloadPreview = buildFaActionPayloadPreview(
    deps,
    entry.payload,
    Number.POSITIVE_INFINITY
  )

  console.error('[faActionManager]', {
    error: normalized,
    id: entry.id,
    kind: entry.kind,
    payload: payloadPreview === '' ? undefined : payloadPreview,
    uid: entry.uid
  })

  const notifyDisplayType =
    deps.readFaProjectOpenFailedShape(error)?.notifyType === 'warning'
      ? 'warning'
      : 'negative'
  const notifyCaption = deps.resolveFaActionFailureNotifyCaption(
    entry,
    error,
    normalized.message
  )

  deps.notifyCreate({
    actions: [{
      color: 'white',
      icon: 'mdi-close'
    }],
    caption: notifyCaption,
    faSkipNotifyConsoleLog: true,
    group: false,
    message: deps.translateActionFailed(entry.id),
    timeout: 6000,
    type: notifyDisplayType
  })

  const failure: I_faActionFailureLog = {
    errorMessage: normalized.message,
    errorName: normalized.name,
    failedAt: Date.now(),
    id: entry.id,
    kind: entry.kind,
    payloadPreview,
    uid: entry.uid
  }

  const store = deps.resolveFaActionManagerStore()
  if (store !== null) {
    store.recordFailure(failure)
  }

  return failure
}

export function createFaActionManagerErrorReporting (deps: T_createFaActionManagerErrorReportingDeps): {
  buildFaActionFailureHistoryPayloadPreview: (error: unknown) => string | undefined
  buildFaActionPayloadPreview: (payload: unknown, maxLength?: number) => string
  normalizeFaActionError: (error: unknown) => { name: string, message: string, stack?: string }
  reportFaActionFailure: (entry: I_faActionQueueEntry, error: unknown) => I_faActionFailureLog
} {
  const normalizeFaActionError = deps.normalizeFaActionError

  return {
    buildFaActionFailureHistoryPayloadPreview: (error) => buildFaActionFailureHistoryPayloadPreview(deps, error),
    buildFaActionPayloadPreview: (payload, maxLength) => buildFaActionPayloadPreview(deps, payload, maxLength),
    normalizeFaActionError,
    reportFaActionFailure: (entry, error) => reportFaActionFailure(deps, entry, error)
  }
}
