import path from 'node:path'

import { createProjectManagementE2ePathRuntime } from './projectManagementE2ePathRuntime'
import { createProjectManagementManagerSurface } from './projectManagementManagerSurface'

const projectManagementSurface = createProjectManagementManagerSurface({
  path
})

const projectManagementE2ePathRuntime = createProjectManagementE2ePathRuntime({
  getTestEnv: () => process.env.TEST_ENV
})

export const pathLooksLikeFaProjectFile = projectManagementSurface.pathLooksLikeFaProjectFile

export const ensureFaProjectExtension = projectManagementSurface.ensureFaProjectExtension

export const faDisplayNameFallbackFromProjectPath =
  projectManagementSurface.faDisplayNameFallbackFromProjectPath

export const faProjectSlugFromDisplayName = projectManagementSurface.faProjectSlugFromDisplayName

export const extractFaProjectPathsFromArgv = projectManagementSurface.extractFaProjectPathsFromArgv

export const dedupeFaProjectPathsLastWins = projectManagementSurface.dedupeFaProjectPathsLastWins

export const pickLastFaProjectPathForOsOpen = projectManagementSurface.pickLastFaProjectPathForOsOpen

export const resolveOsOpenFaProjectPathFromArgv =
  projectManagementSurface.resolveOsOpenFaProjectPathFromArgv

export const takeNextE2eProjectCreatePath =
  projectManagementE2ePathRuntime.takeNextE2eProjectCreatePath

export const takeNextE2eProjectOpenPath = projectManagementE2ePathRuntime.takeNextE2eProjectOpenPath

export const installFaProjectManagementE2ePathOverrideGlobals =
  projectManagementE2ePathRuntime.installFaProjectManagementE2ePathOverrideGlobals
