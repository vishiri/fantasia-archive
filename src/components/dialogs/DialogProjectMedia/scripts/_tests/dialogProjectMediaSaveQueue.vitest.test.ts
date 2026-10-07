import { expect, test } from 'vitest'

import { enqueueDialogProjectMediaSave } from '../dialogProjectMediaSaveQueue'

test('Test that enqueueDialogProjectMediaSave clears the tail when a save rejects', async () => {
  await expect(enqueueDialogProjectMediaSave(async () => {
    throw new Error('media-save-fail')
  })).rejects.toThrow('media-save-fail')
  await expect(enqueueDialogProjectMediaSave(async () => 'ok')).resolves.toBe('ok')
})
