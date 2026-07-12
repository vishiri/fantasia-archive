import type {
  I_assembleProjectDocumentControlBarApiInput,
  I_projectDocumentControlBarComposableApi
} from 'app/types/I_faProjectDocumentControlBarDomain'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  resolveProjectDocumentControlBarShowWorldTabIndicators,
  resolveProjectDocumentControlBarTabWorldIndicatorColor
} from '../functions/projectDocumentControlBarTabWorldIndicator'

export function buildProjectDocumentControlBarWorldTabIndicatorApi (input: {
  computed: I_assembleProjectDocumentControlBarApiInput['computed']
  projectWorlds: I_assembleProjectDocumentControlBarApiInput['projectWorlds']
}): Pick<
  I_projectDocumentControlBarComposableApi,
  'resolveTabWorldIndicatorColor' | 'showWorldTabIndicators'
> {
  const showWorldTabIndicators = input.computed(() => {
    return resolveProjectDocumentControlBarShowWorldTabIndicators(input.projectWorlds.value.length)
  })

  function resolveTabWorldIndicatorColor (tab: I_faOpenedDocumentTab): string | null {
    return resolveProjectDocumentControlBarTabWorldIndicatorColor({
      projectWorldCount: input.projectWorlds.value.length,
      tab,
      worlds: input.projectWorlds.value
    })
  }

  return {
    resolveTabWorldIndicatorColor,
    showWorldTabIndicators
  }
}
