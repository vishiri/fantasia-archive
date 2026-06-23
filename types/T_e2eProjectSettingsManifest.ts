export type T_e2eLocaleSingularPlural = {
  enUS: {
    plural: string
    singular: string
  }
  de?: {
    plural?: string
    singular?: string
  }
}

export type T_e2eLocaleString = {
  enUS: string
  de?: string
}

export type T_e2eTemplateManifestEntry = {
  tabLabel: string
  titles: T_e2eLocaleSingularPlural
  appendix: T_e2eLocaleString
  icon: string
  iconSearchTerm: string
}

export type T_e2eLayoutTemplateNode = {
  type: 'template'
  tabLabel: string
  nickname?: T_e2eLocaleSingularPlural
}

export type T_e2eLayoutGroupNode = {
  type: 'group'
  name: T_e2eLocaleString
  children: T_e2eLayoutTemplateNode[]
}

export type T_e2eLayoutNodeManifest = T_e2eLayoutTemplateNode | T_e2eLayoutGroupNode

export type T_e2eWorldManifestEntry = {
  tabLabel: string
  names: T_e2eLocaleString
  worldColor: string
  paletteHexes: string[]
  layout: T_e2eLayoutNodeManifest[]
}

export type T_e2eProjectSettingsManifest = {
  projectName: string
  templates: T_e2eTemplateManifestEntry[]
  worlds: T_e2eWorldManifestEntry[]
}

export const E2E_PROJECT_SETTINGS_SELECTOR_LIST = {
  closeButton: 'dialogProjectSettings-button-close',
  colorPaletteAddButton: 'dialogProjectSettings-worlds-colorPaletteAddButton',
  colorPaletteSwatch: 'dialogProjectSettings-worlds-colorPaletteSwatch',
  documentTemplatesAddButton: 'dialogProjectSettings-documentTemplates-addButton',
  documentTemplatesAddFirstButton: 'dialogProjectSettings-documentTemplates-addFirstButton',
  documentTemplatesIconInput: 'dialogProjectSettings-documentTemplates-iconInput',
  documentTemplatesIconTrigger: 'dialogProjectSettings-documentTemplates-iconInput-trigger',
  documentTemplatesNameInput: 'dialogProjectSettings-documentTemplates-nameInput',
  documentTemplatesTab: 'dialogProjectSettings-documentTemplates-tab',
  documentTemplatesTabIcon: 'dialogProjectSettings-documentTemplates-tabIcon',
  documentTemplatesTabWorldAppendix: 'dialogProjectSettings-documentTemplates-tabWorldAppendix',
  documentTemplatesWorldAppendixInput: 'dialogProjectSettings-documentTemplates-worldAppendixInput',
  groupRenameInput: 'dialogProjectSettings-worldTemplateLayoutGroupRenameInput',
  projectNameInput: 'dialogProjectSettings-input-projectName',
  saveButton: 'dialogProjectSettings-button-save',
  saveWithoutClosingButton: 'dialogProjectSettings-button-saveWithoutClosing',
  tabDocumentTemplatesSettings: 'dialogProjectSettings-tab-documentTemplatesSettings',
  tabGeneralSettings: 'dialogProjectSettings-tab-generalSettings',
  tabWorldsSettings: 'dialogProjectSettings-tab-worldsSettings',
  templateRenameInput: 'dialogProjectSettings-worldTemplateLayoutTemplateRenameInput',
  title: 'dialogProjectSettings-title',
  worldsAddButton: 'dialogProjectSettings-worlds-addButton',
  worldsColorInput: 'dialogProjectSettings-worlds-colorInput',
  worldsNameInput: 'dialogProjectSettings-worlds-nameInput',
  worldsTab: 'dialogProjectSettings-worlds-tab',
  worldTemplateLayoutAddGroup: 'dialogProjectSettings-worldTemplateLayoutAddGroup',
  worldTemplateLayoutTree: 'dialogProjectSettings-worldTemplateLayoutTree'
} as const
