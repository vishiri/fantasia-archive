import { expect, test, vi } from 'vitest'

const runFaActionMock = vi.hoisted(() => vi.fn())

vi.mock('app/src/scripts/actionManager/faActionManagerRun', () => ({
  runFaAction: runFaActionMock
}))

/**
 * reportFaBridgeLoadFailure
 * Routes load failures through reportBridgeLoadFailure.
 */
test('Test that reportFaBridgeLoadFailure dispatches reportBridgeLoadFailure', async () => {
  runFaActionMock.mockReset()
  const { reportFaBridgeLoadFailure } = await import('../faBridgeLoadFailureReporting')
  reportFaBridgeLoadFailure('load failed')
  expect(runFaActionMock).toHaveBeenCalledWith('reportBridgeLoadFailure', { message: 'load failed' })
})

/**
 * hydrateFromBridgeOrReport
 * Completes without reporting when hydration succeeds.
 */
test('Test that hydrateFromBridgeOrReport resolves successful hydration', async () => {
  runFaActionMock.mockReset()
  const { hydrateFromBridgeOrReport } = await import('../faBridgeLoadFailureReporting')
  await hydrateFromBridgeOrReport(async () => undefined)
  expect(runFaActionMock).not.toHaveBeenCalled()
})

/**
 * hydrateFromBridgeOrReport
 * Reports thrown bridge failures through the action manager.
 */
test('Test that hydrateFromBridgeOrReport reports thrown bridge failures', async () => {
  runFaActionMock.mockReset()
  const { hydrateFromBridgeOrReport } = await import('../faBridgeLoadFailureReporting')
  await hydrateFromBridgeOrReport(async () => {
    throw new Error('bridge down')
  })
  expect(runFaActionMock).toHaveBeenCalledWith('reportBridgeLoadFailure', { message: 'bridge down' })
})

/**
 * hydrateFromBridgeOrReport
 * Stringifies non-Error rejections before reporting.
 */
test('Test that hydrateFromBridgeOrReport stringifies non-Error rejections', async () => {
  runFaActionMock.mockReset()
  const { hydrateFromBridgeOrReport } = await import('../faBridgeLoadFailureReporting')
  await hydrateFromBridgeOrReport(async () => {
    // eslint-disable-next-line no-throw-literal -- exercises non-Error branch
    throw 'raw failure'
  })
  expect(runFaActionMock).toHaveBeenCalledWith('reportBridgeLoadFailure', { message: 'raw failure' })
})
