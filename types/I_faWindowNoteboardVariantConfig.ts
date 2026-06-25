import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'
import type { T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/** Z-layer bands used by app vs project noteboard floating windows. */
export type T_faFloatingWindowZLayerNoteboard = 'noteboard' | 'projectNoteboard'

/** Per-window noteboard variant wiring passed into createWindowNoteboard. */
export interface I_faWindowNoteboardVariantConfig {
  directInputDialogName: T_dialogName
  documentNameClass: string
  floatingWindowZLayer: T_faFloatingWindowZLayerNoteboard
  persistFrameSilent: (frame: {
    height: number
    width: number
    x: number
    y: number
  }) => Promise<void>
  saveFailureActionId: T_faActionId
  toggleKeybindCommandId: T_faKeybindCommandId
}
