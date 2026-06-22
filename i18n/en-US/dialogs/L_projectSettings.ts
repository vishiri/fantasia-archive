export default {
  title: 'Project Settings',
  closeButton: 'Close without saving',
  saveButton: 'Save settings',
  saveErrors: {
    tooltipIntro: 'Unable to save. The following errors were found:',
    bulletWorldNameRequired: 'World name is required for "{worldLabel}".',
    bulletDuplicatePalette: 'Duplicate colors found in palette of "{worldLabel}".',
    bulletDocumentTemplateNameRequired: 'Document template name is required for "{templateLabel}".',
    bulletWorldTemplateGroupNameRequired: 'Template group name is required for "{worldLabel}".',
    bulletWorldTemplateDuplicateDocumentTemplate: 'Duplicate document template "{templateLabel}" in "{worldLabel}".'
  },
  singularPluralMissing: {
    bothIntro: 'Missing translations for current language:',
    singularBullet: 'Singular form missing',
    pluralBullet: 'Plural form missing',
    usingFallback: 'Using fallback of {fallbackLanguageName}'
  },
  categories: {
    generalSettings: {
      title: 'General settings'
    },
    worldsSettings: {
      title: 'Worlds'
    },
    documentTemplatesSettings: {
      title: 'Document Templates'
    }
  },
  fields: {
    projectName: {
      title: 'Project Name',
      label: 'Project name',
      errorRequired: 'Project name is required.'
    },
    worldName: {
      title: 'World name',
      label: 'World name',
      errorRequired: 'World name is required.'
    },
    worldColor: {
      title: 'Color',
      label: 'World color',
      tooltip: 'This color determines how your world appears in various places around the project—icons, text, and similar UI.'
    },
    worldColorPalette: {
      label: 'World color palette',
      tooltipIntro: 'Color palette allows you to pre-define colors that will be later used across the project without having to manually select them every time. This allows for cross-document consistency when required.',
      tooltipRightClickIntro: 'More actions available on right clicking individual colors:',
      tooltipRightClickDeletion: 'Deletion',
      tooltipRightClickDuplication: 'Duplication',
      addButton: 'Add Color',
      contextMenu: {
        duplicateColor: 'Duplicate color',
        deleteColor: 'Delete color'
      }
    },
    worldTemplateLayout: {
      layoutTitle: "World's hierarchical tree",
      availableTemplatesTitle: 'Available document templates',
      availableTemplatesFilterAriaLabel: 'Filter available document templates',
      availableTemplatesFilterClearAriaLabel: 'Clear available document templates filter',
      availableTemplatesFilterPlaceholder: 'Search...',
      emptyFilteredAvailableTemplates: 'No document templates match your search.',
      addGroupButton: 'Add group',
      defaultNewGroupName: 'New group',
      editGroupTooltip: 'Rename group',
      editTemplateTooltip: "Adjust template's nickname",
      emptyAvailableTemplates: 'All document templates are assigned to this world.',
      groupNameErrorRequired: 'Group name is required.',
      groupRenameInputLabel: 'Name of the group',
      placementNicknameHoverOriginalNameLabel: 'Original name',
      placementNicknameHoverNicknameLabel: 'Nickname',
      removeGroupTooltip: 'Remove group',
      removeTemplateTooltip: 'Remove document template',
      templateCanonicalNameLabel: 'Document template name',
      templateCanonicalNameTooltip: 'In order to properly rename a whole document template, please go to the "Document Templates" section of this edit dialog and adjust it there.',
      templateNicknameLabel: 'Nickname inside this world',
      templateNicknameTooltip: 'Setting a nickname allows you to quick-rename a document template inside a specific world without changing its real name across the whole project.',
      missingGroupDisplayNameTreeTooltip:
        'Some of the translations for the currently selected language are missing from this group name.',
      missingPlacementNicknameTreeTooltip:
        'Some of the translations for the currently selected language are missing from this placement nickname.',
      missingDocumentTemplateTitleTreeTooltip:
        'Some of the translations for the currently selected language are missing from this document template title.',
      contextMenu: {
        renameGroup: 'Rename group',
        deleteGroup: 'Delete group'
      },
      renameDialog: {
        title: 'Rename group',
        confirmButton: 'Rename'
      }
    },
    documentTemplateName: {
      title: 'Document template name',
      label: 'Document template name',
      errorRequired: 'At least one document template title translation is required.'
    },
    documentTemplateWorldAppendix: {
      title: 'World appendix',
      label: 'World appendix',
      tooltip: 'World appendix is a short, unique description for your document template when it is paired with individual worlds. This prevents confusion when multiple document templates share the same name across worlds. The appendix helps you tell them apart at a glance. This field appears only on the world tab when pairing templates to worlds, nowhere else.'
    },
    documentTemplateIcon: {
      title: 'Icon',
      label: 'Icon'
    }
  },
  panels: {
    worlds: {
      title: "Project's Worlds",
      addWorldButton: 'Add world',
      defaultNewWorldName: 'New world',
      deleteWorldButton: 'Delete world',
      emptyFilteredWorlds: 'No worlds match your search.',
      filterAriaLabel: 'Filter worlds',
      filterClearAriaLabel: 'Clear worlds filter',
      filterPlaceholder: 'Search...',
      missingTranslationsTabTooltip:
        'Some of the translations for the currently selected language are missing from this world.',
      deleteConfirm: {
        confirmDeleteButton: 'Confirm delete',
        message: 'Are you sure you want to delete this world? Documents and settings linked to it cannot be recovered afterwards. They will be lost forever.'
      },
      removeDisabledHasDocuments: 'Remove documents from this world before deleting it.',
      removeDisabledLastWorld: 'A project must have at least one world at all times. Create another first to delete this one.'
    },
    documentTemplates: {
      title: 'Document Templates',
      addFirstTemplateButton: 'Add your first template',
      addTemplateButton: 'Add document template',
      defaultNewTemplateName: 'New document template',
      deleteTemplateButton: 'Delete Template',
      emptyFilteredTemplates: 'No document templates match your search.',
      filterAriaLabel: 'Filter document templates',
      filterClearAriaLabel: 'Clear document templates filter',
      filterPlaceholder: 'Search...',
      missingTranslationsTabTooltip:
        'Some of the translations for the currently selected language are missing from this document template.',
      deleteConfirm: {
        confirmDeleteButton: 'Confirm delete',
        message: 'Are you sure you want to delete this document template? All fields connected to this template in any other template will stop working. Also, all connected documents will stop showing their data if any were filled using this template. This deletion might have unintended side effects.'
      },
      removeDisabledHasDocuments: 'Remove documents using this template before deleting it.'
    }
  }
}
