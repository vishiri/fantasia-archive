export default {
  title: 'Project Settings',
  closeButton: 'Close without saving',
  saveButton: 'Save settings',
  saveErrors: {
    tooltipIntro: 'Unable to save, following errors found:',
    bulletWorldNameRequired: 'World name is required for "{worldLabel}".',
    bulletDuplicatePalette: 'Duplicate colors found in palette of "{worldLabel}".'
  },
  categories: {
    generalSettings: {
      title: 'General settings'
    },
    worldsSettings: {
      title: 'Worlds settings'
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
      tooltip: 'This color determines how your world will be colored at various places around the project - Icons, texts, etc.'
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
    }
  },
  panels: {
    worlds: {
      title: "Project's Worlds",
      addWorldButton: 'Add world',
      defaultNewWorldName: 'New world',
      deleteWorldButton: 'Delete world',
      deleteConfirm: {
        confirmDeleteButton: 'Confirm delete',
        message: 'Are you sure you want to delete this world? Documents and settings linked to it cannot be recovered afterwards - They will be lost forever.'
      },
      removeDisabledHasDocuments: 'Remove documents from this world before deleting it.',
      removeDisabledLastWorld: 'A project must have at least one world at all times. Create another first to delete this one.'
    }
  }
}
