import { expect, test, vi } from 'vitest'

import { createRunFaComponentTestingRendererProbesBoot } from '../functions/createRunFaComponentTestingRendererProbesBoot'

/**
 * createRunFaComponentTestingRendererProbesBoot
 * Invokes the register callback only for Electron components harness.
 */
test('Test that createRunFaComponentTestingRendererProbesBoot registers for components', async () => {
  const registerFaComponentTestingStoreSeedProbe = vi.fn()
  const run = createRunFaComponentTestingRendererProbesBoot({
    getCachedTestEnv: () => 'components',
    getMode: () => 'electron',
    registerFaComponentTestingStoreSeedProbe
  })

  await run()

  expect(registerFaComponentTestingStoreSeedProbe).toHaveBeenCalledOnce()
})

/**
 * createRunFaComponentTestingRendererProbesBoot
 * Skips when TEST_ENV is not components.
 */
test('Test that createRunFaComponentTestingRendererProbesBoot skips for other TEST_ENV', async () => {
  const registerFaComponentTestingStoreSeedProbe = vi.fn()
  const run = createRunFaComponentTestingRendererProbesBoot({
    getCachedTestEnv: () => 'e2e',
    getMode: () => 'electron',
    registerFaComponentTestingStoreSeedProbe
  })

  await run()

  expect(registerFaComponentTestingStoreSeedProbe).not.toHaveBeenCalled()
})
