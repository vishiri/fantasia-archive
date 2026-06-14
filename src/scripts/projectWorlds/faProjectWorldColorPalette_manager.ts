import { computed, ref, watch } from 'vue'

import { aggregateFaProjectWorldColorPalleteHexList } from './functions/faProjectWorldColorPalleteHexList'
import { createUseFaProjectWorldColorPaletteFromBridge } from './functions/createUseFaProjectWorldColorPaletteFromBridge'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

export const useFaProjectWorldColorPaletteFromBridge = createUseFaProjectWorldColorPaletteFromBridge({
  aggregateFaProjectWorldColorPalleteHexList,
  computed,
  getActiveProjectId: () => S_FaActiveProject().activeProject?.id ?? null,
  listWorldColorPalleteStrings: async () => {
    const api = window.faContentBridgeAPIs?.projectContent
    if (typeof api?.listWorlds !== 'function') {
      return []
    }
    const result = await api.listWorlds()
    return result.items.map((world) => world.colorPallete)
  },
  ref,
  watch
})
