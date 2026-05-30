import { faKeybindEventToChord } from './faKeybindsChordFromEvent_manager'
import { matchGlobalKeybindChordAndDispatch } from './faKeybindsGlobalDispatchMatch_manager'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'

import { createFaKeybindsGlobalDispatch } from './functions/createFaKeybindsGlobalDispatch'

const faKeybindsGlobalDispatchApi = createFaKeybindsGlobalDispatch({
  faKeybindEventToChord,
  getFaKeybindsStore: () => S_FaKeybinds(),
  matchGlobalKeybindChordAndDispatch
})

export const getFaKeybindKeydownContext = faKeybindsGlobalDispatchApi.getFaKeybindKeydownContext

export const createFaKeybindKeydownHandler = faKeybindsGlobalDispatchApi.createFaKeybindKeydownHandler
