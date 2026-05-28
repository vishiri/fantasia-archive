import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Props for DialogProjectSettings (Storybook direct open and optional snapshot override).
 */
export interface I_dialogProjectSettingsProps {
  directInput?: T_dialogName
  directSettingsSnapshot?: I_faProjectSettingsRoot
}
