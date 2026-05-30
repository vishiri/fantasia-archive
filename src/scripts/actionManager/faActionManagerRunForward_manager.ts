import { createFaActionManagerRunForward } from './functions/createFaActionManagerRunForward'

const faActionManagerRunForwardApi = createFaActionManagerRunForward()

export const wireFaActionManagerRunForward =
  faActionManagerRunForwardApi.wireFaActionManagerRunForward

export const runFaActionThroughForward =
  faActionManagerRunForwardApi.runFaActionThroughForward
