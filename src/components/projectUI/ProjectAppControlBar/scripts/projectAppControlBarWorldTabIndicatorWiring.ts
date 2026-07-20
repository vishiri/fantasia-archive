import type {
  I_assembleProjectAppControlBarApiInput,
  I_projectAppControlBarComposableApi
} from 'app/types/I_faProjectAppControlBarDomain'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  resolveProjectAppControlBarShowWorldTabIndicators,
  resolveProjectAppControlBarTabWorldIndicatorColor
} from '../functions/projectAppControlBarTabWorldIndicator'

export function buildProjectAppControlBarWorldTabIndicatorApi (input: {
  computed: I_assembleProjectAppControlBarApiInput['computed']
  projectWorlds: I_assembleProjectAppControlBarApiInput['projectWorlds']
}): Pick<
  I_projectAppControlBarComposableApi,
  'resolveTabWorldIndicatorColor' | 'showWorldTabIndicators'
> {
  const showWorldTabIndicators = input.computed(() => {
    return resolveProjectAppControlBarShowWorldTabIndicators(input.projectWorlds.value.length)
  })

  function resolveTabWorldIndicatorColor (tab: I_faOpenedDocumentTab): string | null {
    return resolveProjectAppControlBarTabWorldIndicatorColor({
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
