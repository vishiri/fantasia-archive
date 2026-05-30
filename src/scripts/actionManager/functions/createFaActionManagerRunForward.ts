import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'

type T_runFaAction = <Id extends T_faActionId>(
  id: Id,
  payload: I_faActionPayloadMap[Id]
) => void

export function createFaActionManagerRunForward (): {
  wireFaActionManagerRunForward: (deps: { runFaAction: T_runFaAction }) => void
  runFaActionThroughForward: <Id extends T_faActionId>(
  id: Id,
  payload: I_faActionPayloadMap[Id]
  ) => void
} {
  let runFaActionForward: T_runFaAction = () => {
    throw new Error('faActionManager runFaAction forward is not wired yet')
  }

  const wireFaActionManagerRunForward = (deps: {
    runFaAction: T_runFaAction
  }): void => {
    runFaActionForward = deps.runFaAction
  }

  const runFaActionThroughForward = <Id extends T_faActionId>(
    id: Id,
    payload: I_faActionPayloadMap[Id]
  ): void => {
    runFaActionForward(id, payload)
  }

  return {
    runFaActionThroughForward,
    wireFaActionManagerRunForward
  }
}
