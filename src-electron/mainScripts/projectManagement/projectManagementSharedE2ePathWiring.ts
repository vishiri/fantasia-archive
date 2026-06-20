import { createProjectManagementE2ePathRuntime } from './projectManagementE2ePathRuntime'

const projectManagementE2ePathRuntime = createProjectManagementE2ePathRuntime({
  getTestEnv: () => process.env.TEST_ENV
})

export const takeNextE2eProjectCreatePath = projectManagementE2ePathRuntime.takeNextE2eProjectCreatePath

export const takeNextE2eProjectOpenPath = projectManagementE2ePathRuntime.takeNextE2eProjectOpenPath

export const installFaProjectManagementE2ePathOverrideGlobals =
  projectManagementE2ePathRuntime.installFaProjectManagementE2ePathOverrideGlobals
