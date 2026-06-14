import { expect, test, vi } from 'vitest'

const { runWithDbMock } = vi.hoisted(() => ({
  runWithDbMock: vi.fn()
}))

vi.mock('app/src-electron/mainScripts/projectManagement/projectManagement_manager', () => ({
  runWithFaProjectDatabaseForIpcAsync: runWithDbMock
}))

/**
 * runFaProjectContentIpcWork
 * Returns the inner work result when the database session is active.
 */
test('Test that runFaProjectContentIpcWork returns unwrapped work value', async () => {
  runWithDbMock.mockResolvedValueOnce({
    ok: true,
    value: { items: [] }
  })
  const { runFaProjectContentIpcWork } = await import('../runFaProjectContentIpcWorkWiring')
  const event = {} as never
  await expect(runFaProjectContentIpcWork(event, () => ({ items: [] }))).resolves.toEqual({
    items: []
  })
})

/**
 * runFaProjectContentIpcWork
 * Throws when no active project database is attached.
 */
test('Test that runFaProjectContentIpcWork throws when database session is missing', async () => {
  runWithDbMock.mockResolvedValueOnce({ ok: false })
  const { runFaProjectContentIpcWork } = await import('../runFaProjectContentIpcWorkWiring')
  const event = {} as never
  await expect(runFaProjectContentIpcWork(event, () => ({ items: [] }))).rejects.toThrow(
    'no active project database'
  )
})
