import { storeToRefs } from 'pinia'

import { S_FaProjectWorkspaceWorlds } from 'app/src/stores/S_FaProjectWorkspaceWorlds'

import { createUseProjectWorkspaceWorldList } from '../functions/createUseProjectWorkspaceWorldList'

export const useProjectWorkspaceWorldList = createUseProjectWorkspaceWorldList({
  S_FaProjectWorkspaceWorlds,
  storeToRefs
})
