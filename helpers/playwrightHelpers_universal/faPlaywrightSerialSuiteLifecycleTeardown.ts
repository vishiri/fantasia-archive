import type { ElectronApplication } from 'playwright'
import type { TestInfo } from '@playwright/test'

import { closeFaElectronAppWithRecordedVideoAttachments } from 'app/helpers/playwrightHelpers_universal/playwrightElectronRecordVideo'

/**
 * Closes the Electron app, attaches queued WebMs, then runs optional suite teardown.
 */
export async function tearDownFaPlaywrightElectronSerialSuite (options: {
  electronApp: ElectronApplication | undefined
  suiteTestInfo: TestInfo
  afterAllTestInfo: TestInfo
  afterClose?: () => void | Promise<void>
}): Promise<void> {
  const electronAppBinding = options.electronApp
  const suiteTestInfoBinding = options.suiteTestInfo
  const afterAllTestInfoBinding = options.afterAllTestInfo
  const afterCloseBinding = options.afterClose

  await closeFaElectronAppWithRecordedVideoAttachments(
    electronAppBinding,
    suiteTestInfoBinding,
    afterAllTestInfoBinding
  )
  if (afterCloseBinding === undefined) {
    return
  }
  await afterCloseBinding()
}
