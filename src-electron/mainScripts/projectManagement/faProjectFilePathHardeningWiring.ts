import fs from 'node:fs'

import { Result } from 'neverthrow'

import { createResolveHardenedFaProjectFilePath } from './functions/faProjectFilePathHardening'
import { pathLooksLikeFaProjectFile } from './projectManagementSharedPathWiring'

const faProjectFilePathHardeningApi = createResolveHardenedFaProjectFilePath({
  Result,
  pathLooksLikeFaProjectFile,
  realpathSync: (path) => fs.realpathSync(path),
  statSync: (path) => fs.statSync(path)
})

export const resolveHardenedFaProjectFilePath =
  faProjectFilePathHardeningApi.resolveHardenedFaProjectFilePath
