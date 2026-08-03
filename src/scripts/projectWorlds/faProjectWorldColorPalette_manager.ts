import { computed, ref, watch } from 'vue'

import { aggregateFaProjectWorldColorPaletteHexList } from './functions/faProjectWorldColorPaletteHexList'
import { createUseFaProjectWorldColorPaletteFromBridge } from './functions/createUseFaProjectWorldColorPaletteFromBridge'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

export const useFaProjectWorldColorPaletteFromBridge = createUseFaProjectWorldColorPaletteFromBridge({
  aggregateFaProjectWorldColorPaletteHexList,
  computed,
  getActiveProjectId: () => S_FaActiveProject().activeProject?.id ?? null,
  listWorldColorPaletteStrings: async () => {
    const api = window.faContentBridgeAPIs?.projectContent
    if (typeof api?.listWorlds !== 'function') {
      return []
    }
    const result = await api.listWorlds()
    return result.items.map((world) => world.colorPalette)
  },
  ref,
  watch
})
