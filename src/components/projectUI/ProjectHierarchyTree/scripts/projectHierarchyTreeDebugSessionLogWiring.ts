/**
 * Debug session logging for hierarchy tree expand/drag investigation (session 9037f2).
 */
export function logProjectHierarchyTreeDebugSession (payload: {
  data?: Record<string, unknown>
  hypothesisId: string
  location: string
  message: string
  runId?: string
}): void {
  // #region agent log
  fetch('http://127.0.0.1:7605/ingest/9ad2c332-43d0-41fd-a724-35a6fda651d4', {
    body: JSON.stringify({
      data: payload.data ?? {},
      hypothesisId: payload.hypothesisId,
      location: payload.location,
      message: payload.message,
      runId: payload.runId ?? 'pre-fix',
      sessionId: '9037f2',
      timestamp: Date.now()
    }),
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '9037f2'
    },
    method: 'POST'
  }).catch(() => {})
  // #endregion
}
