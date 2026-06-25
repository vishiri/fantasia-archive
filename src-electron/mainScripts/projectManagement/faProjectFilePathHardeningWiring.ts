import fs from 'node:fs'

import { createResolveHardenedFaProjectFilePath } from './functions/faProjectFilePathHardening'
import { pathLooksLikeFaProjectFile } from './projectManagementSharedPathWiring'

const faProjectFilePathHardeningApi = createResolveHardenedFaProjectFilePath({
  pathLooksLikeFaProjectFile,
  realpathSync: (path) => fs.realpathSync(path),
  statSync: (path) => fs.statSync(path)
})

export const resolveHardenedFaProjectFilePath =
  faProjectFilePathHardeningApi.resolveHardenedFaProjectFilePath
