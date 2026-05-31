import type { Page } from 'playwright'

import type { I_faComponentTestingStoreSeed } from 'app/types/I_faComponentTestingStoreSeed'

const MISSING_COMPONENT_STORE_SEED_PROBE = '__fa_component_testing_store_seed_probe_missing__'

/**
 * Patches Pinia session stores in the component-testing harness (requires TEST_ENV components boot probe).
 */
export async function patchFaPlaywrightComponentHarnessStores (
  page: Page,
  seed: I_faComponentTestingStoreSeed
): Promise<void> {
  await page.evaluate((payload) => {
    const patch = window.__faComponentTestingPatchStores
    if (typeof patch !== 'function') {
      throw new Error(MISSING_COMPONENT_STORE_SEED_PROBE)
    }
    patch(payload)
  }, seed)
}
