import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import type { T_dialogName } from 'app/types/T_dialogList'

export interface I_dialogProgramSettingsProps {
  directInput?: T_dialogName
  directSettingsSnapshot?: I_faUserSettings
}
