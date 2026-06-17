import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'

import { createEmptyDialogProjectSettingsWorldTemplateLayoutDraft } from '../scripts/dialogProjectSettingsWorldTemplateLayoutDraft'

/** Builds a Project Settings world draft row for Vitest and Storybook fixtures. */
export function dialogProjectSettingsWorldDraftFixture (
  partial: Partial<I_dialogProjectSettingsWorldDraft> = {}
): I_dialogProjectSettingsWorldDraft {
  return {
    color: '',
    colorPallete: '',
    displayName: 'World',
    documentCount: 0,
    id: 'world-id-1',
    templateLayout: createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(),
    ...partial
  }
}
