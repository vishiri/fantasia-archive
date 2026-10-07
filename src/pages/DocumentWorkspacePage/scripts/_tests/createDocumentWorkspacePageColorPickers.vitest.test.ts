import { computed } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  createDocumentWorkspacePageColorPickers,
  resolveDocumentWorkspacePaletteAppendWorldId
} from '../functions/createDocumentWorkspacePageColorPickers'

const liveWorld: I_faProjectHierarchyTreeWorkspaceWorld = {
  color: '#808080',
  colorPalette: '#112233',
  displayName: 'Live realm',
  groups: [],
  id: 'world-live',
  placements: [],
  sortOrder: 0
}

/**
 * createDocumentWorkspacePageColorPickers
 * A palette saved for one world must not land on the document world that is open when the save finishes.
 */
test('Test that document workspace palette append patches the saved world', () => {
  const patchWorldColorPaletteInLayout = vi.fn()
  const api = createDocumentWorkspacePageColorPickers({
    computed,
    documentTab: computed(() => ({ worldId: 'world-live' } as I_faOpenedDocumentTab)),
    i18n: { global: { t: (key: string) => key } },
    parseFaProjectWorldColorPaletteToHexList: () => ['#112233'],
    patchWorldColorPaletteInLayout,
    resolveOpenedDocumentTabIsInPreviewMode: () => false,
    routeDocumentId: computed(() => 'doc-live'),
    updateDocumentBackgroundColorDraft: () => {},
    updateDocumentTextColorDraft: () => {},
    worlds: computed(() => [liveWorld])
  })

  api.onAppendToWorldPalette('#112233;#AABBCC', 'world-saved')

  expect(patchWorldColorPaletteInLayout).toHaveBeenCalledWith('world-saved', '#112233;#AABBCC')
  expect(resolveDocumentWorkspacePaletteAppendWorldId('', 'world-live')).toBe('world-live')
  expect(resolveDocumentWorkspacePaletteAppendWorldId('', null)).toBeNull()
})
