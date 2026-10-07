export default {
  title: 'Project Settings',
  loadError: 'Could not load project settings.',
  closeButton: 'Close Without Saving',
  saveButton: 'Save Settings',
  saveWithoutClosingButton: 'Save Without Closing',
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
      title: 'General Settings'
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
      label: 'Project Name',
      errorRequired: 'Project name is required.'
    },
    worldName: {
      title: 'World Name',
      label: 'World Name',
      errorRequired: 'World name is required.'
    },
    worldColor: {
      title: 'Color',
      label: 'World Color',
      tooltip: 'This color determines how your world appears in various places around the project—icons, text, and similar UI.',
      helpAriaLabel: 'Help for world color'
    },
    worldColorPalette: {
      label: 'World Color Palette',
      tooltipIntro: 'Color palette allows you to pre-define colors that will be later used across the project without having to manually select them every time. This allows for cross-document consistency when required.',
      tooltipRightClickIntro: 'More actions available on right clicking individual colors:',
      tooltipRightClickDeletion: 'Deletion',
      tooltipRightClickDuplication: 'Duplication',
      addButton: 'Add Color',
      helpAriaLabel: 'Help for world color palette',
      swatchAriaLabel: 'Edit color swatch {hex}',
      contextMenu: {
        duplicateColor: 'Duplicate Color',
        deleteColor: 'Delete Color'
      }
    },
    worldTemplateLayout: {
      layoutTitle: "World's Hierarchical Tree",
      availableTemplatesTitle: 'Available Document Templates',
      availableTemplatesFilterAriaLabel: 'Filter available document templates',
      availableTemplatesFilterClearAriaLabel: 'Clear available document templates filter',
      availableTemplatesFilterPlaceholder: 'Search...',
      emptyFilteredAvailableTemplates: 'No document templates match your search.',
      addGroupButton: 'Add Group',
      defaultNewGroupName: 'New group',
      editGroupTooltip: 'Rename group',
      editTemplateTooltip: "Adjust template's nickname",
      emptyAvailableTemplates: 'All document templates are assigned to this world.',
      groupNameErrorRequired: 'Group name is required.',
      groupRenameInputLabel: 'Name of the Group',
      placementNicknameHoverOriginalNameLabel: 'Original name',
      placementNicknameHoverNicknameLabel: 'Nickname',
      removeGroupTooltip: 'Remove group',
      removeTemplateDisabledHasDocuments:
        'Remove all documents connected to this template before removing it.',
      removeTemplateTooltip: 'Remove document template',
      templateCanonicalNameLabel: 'Document Template Name',
      templateCanonicalNameTooltip: 'In order to properly rename a whole document template, please go to the "Document Templates" section of this edit dialog and adjust it there.',
      templateNicknameLabel: 'Nickname Inside This World',
      templateNicknameTooltip: 'Setting a nickname allows you to quick-rename a document template inside a specific world without changing its real name across the whole project.',
      missingGroupDisplayNameTreeTooltip:
        'Some of the translations for the currently selected language are missing from this group name.',
      missingPlacementNicknameTreeTooltip:
        'Some of the translations for the currently selected language are missing from this placement nickname.',
      missingDocumentTemplateTitleTreeTooltip:
        'Some of the translations for the currently selected language are missing from this document template title.',
      contextMenu: {
        renameGroup: 'Rename Group',
        deleteGroup: 'Delete Group'
      },
      renameDialog: {
        title: 'Rename Group',
        confirmButton: 'Rename'
      }
    },
    documentTemplateName: {
      title: 'Document Template Name',
      label: 'Document Template Name',
      errorRequired: 'At least one document template title translation is required.'
    },
    documentTemplateWorldAppendix: {
      title: 'World Appendix',
      label: 'World Appendix',
      tooltip: 'World appendix is a short, unique description for your document template when it is paired with individual worlds. This prevents confusion when multiple document templates share the same name across worlds. The appendix helps you tell them apart at a glance. This field appears only on the world tab when pairing templates to worlds, nowhere else.',
      helpAriaLabel: 'Help for world appendix'
    },
    documentTemplateIcon: {
      title: 'Icon',
      label: 'Icon'
    }
  },
  panels: {
    worlds: {
      title: "Project's Worlds",
      addWorldButton: 'Add World',
      defaultNewWorldName: 'New world',
      deleteWorldButton: 'Delete World',
      emptyFilteredWorlds: 'No worlds match your search.',
      filterAriaLabel: 'Filter worlds',
      filterClearAriaLabel: 'Clear worlds filter',
      filterPlaceholder: 'Search...',
      missingTranslationsTabTooltip:
        'Some of the translations for the currently selected language are missing from this world.',
      deleteConfirm: {
        confirmDeleteButton: 'Confirm Delete',
        message: 'Are you sure you want to delete this world? Documents and settings linked to it cannot be recovered afterwards. They will be lost forever.'
      },
      removeDisabledHasDocuments: 'Remove documents from this world before deleting it.',
      removeDisabledLastWorld: 'A project must have at least one world at all times. Create another first to delete this one.'
    },
    documentTemplates: {
      title: 'Document Templates',
      addFirstTemplateButton: 'Add Your First Template',
      addTemplateButton: 'Add Document Template',
      defaultNewTemplateName: 'New document template',
      deleteTemplateButton: 'Delete Template',
      emptyFilteredTemplates: 'No document templates match your search.',
      filterAriaLabel: 'Filter document templates',
      filterClearAriaLabel: 'Clear document templates filter',
      filterPlaceholder: 'Search...',
      missingTranslationsTabTooltip:
        'Some of the translations for the currently selected language are missing from this document template.',
      deleteConfirm: {
        confirmDeleteButton: 'Confirm Delete',
        message: 'Are you sure you want to delete this document template? All fields connected to this template in any other template will stop working. Also, all connected documents will stop showing their data if any were filled using this template. This deletion might have unintended side effects.'
      },
      removeDisabledHasDocuments: 'Remove documents using this template before deleting it.',
      removeDisabledAssignedToWorld:
        'This template is connected to one or more worlds, please un-assign it first from all affected worlds.'
    }
  }
}
