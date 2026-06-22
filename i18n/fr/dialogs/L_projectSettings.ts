export default {
  title: 'Paramètres du projet',
  closeButton: 'Fermer sans enregistrer',
  saveButton: 'Enregistrer les paramètres',
  saveErrors: {
    tooltipIntro: "Impossible d'enregistrer. Les erreurs suivantes ont été détectées :",
    bulletWorldNameRequired: 'Le nom du monde est requis pour « {worldLabel} ».',
    bulletDuplicatePalette: 'Couleurs en double trouvées dans la palette de « {worldLabel} ».',
    bulletDocumentTemplateNameRequired: 'Le nom du modèle de document est requis pour « {templateLabel} ».',
    bulletWorldTemplateGroupNameRequired: 'Le nom du groupe de modèles est requis pour « {worldLabel} ».',
    bulletWorldTemplateDuplicateDocumentTemplate: 'Modèle de document en double « {templateLabel} » dans « {worldLabel} ».'
  },
  categories: {
    generalSettings: {
      title: 'Paramètres généraux'
    },
    worldsSettings: {
      title: 'Mondes'
    },
    documentTemplatesSettings: {
      title: 'Modèles de documents'
    }
  },
  fields: {
    projectName: {
      title: 'Nom du projet',
      label: 'Nom du projet',
      errorRequired: 'Le nom du projet est requis.'
    },
    worldName: {
      title: 'Nom du monde',
      label: 'Nom du monde',
      errorRequired: 'Le nom du monde est requis.'
    },
    worldColor: {
      title: 'Couleur',
      label: 'Couleur du monde',
      tooltip: "Cette couleur détermine l'apparence de votre monde à divers endroits du projet — icônes, texte et éléments d'interface similaires."
    },
    worldColorPalette: {
      label: 'Palette de couleurs du monde',
      tooltipIntro: "La palette de couleurs vous permet de prédéfinir des couleurs qui seront ensuite utilisées dans l'ensemble du projet sans avoir à les sélectionner manuellement à chaque fois. Cela permet une cohérence inter-documents lorsque cela est nécessaire.",
      tooltipRightClickIntro: "D'autres actions sont disponibles en cliquant avec le bouton droit sur des couleurs individuelles :",
      tooltipRightClickDeletion: 'Suppression',
      tooltipRightClickDuplication: 'Duplication',
      addButton: 'Ajouter une couleur',
      contextMenu: {
        duplicateColor: 'Dupliquer la couleur',
        deleteColor: 'Supprimer la couleur'
      }
    },
    worldTemplateLayout: {
      layoutTitle: 'Arbre hiérarchique du monde',
      availableTemplatesTitle: 'Modèles de documents disponibles',
      availableTemplatesFilterAriaLabel: 'Filtrer les modèles de documents disponibles',
      availableTemplatesFilterClearAriaLabel: 'Effacer le filtre des modèles de documents disponibles',
      availableTemplatesFilterPlaceholder: 'Rechercher…',
      emptyFilteredAvailableTemplates: 'Aucun modèle de document ne correspond à votre recherche.',
      addGroupButton: 'Ajouter un groupe',
      defaultNewGroupName: 'Nouveau groupe',
      editGroupTooltip: 'Renommer le groupe',
      editTemplateTooltip: 'Ajuster le surnom du modèle',
      emptyAvailableTemplates: 'Tous les modèles de documents sont assignés à ce monde.',
      groupNameErrorRequired: 'Le nom du groupe est requis.',
      groupRenameInputLabel: 'Nom du groupe',
      placementNicknameHoverOriginalNameLabel: "Nom d'origine",
      placementNicknameHoverNicknameLabel: 'Surnom',
      removeGroupTooltip: 'Supprimer le groupe',
      removeTemplateTooltip: 'Supprimer le modèle de document',
      templateCanonicalNameLabel: 'Nom du modèle de document',
      templateCanonicalNameTooltip: "Pour renommer correctement un modèle de document entier, veuillez vous rendre dans la section « Modèles de documents » de cette boîte de dialogue de modification et l'ajuster là-bas.",
      templateNicknameLabel: 'Surnom dans ce monde',
      templateNicknameTooltip: "Définir un surnom vous permet de renommer rapidement un modèle de document dans un monde spécifique sans modifier son vrai nom dans l'ensemble du projet.",
      contextMenu: {
        renameGroup: 'Renommer le groupe',
        deleteGroup: 'Supprimer le groupe'
      },
      renameDialog: {
        title: 'Renommer le groupe',
        confirmButton: 'Renommer'
      }
    },
    documentTemplateName: {
      title: 'Nom du modèle de document',
      label: 'Nom du modèle de document',
      errorRequired: 'Au moins une traduction du titre du modèle de document est requise.'
    },
    documentTemplateWorldAppendix: {
      title: 'Annexe du monde',
      label: 'Annexe du monde',
      tooltip: "L'annexe du monde est une courte description unique pour votre modèle de document lorsqu'il est associé à des mondes individuels. Cela évite la confusion lorsque plusieurs modèles de documents portent le même nom dans différents mondes. L'annexe vous aide à les distinguer d'un coup d'œil. Ce champ n'apparaît que dans l'onglet Mondes lors de l'association des modèles aux mondes, nulle part ailleurs."
    },
    documentTemplateIcon: {
      title: 'Icône',
      label: 'Icône'
    }
  },
  panels: {
    worlds: {
      title: 'Mondes du projet',
      addWorldButton: 'Ajouter un monde',
      defaultNewWorldName: 'Nouveau monde',
      deleteWorldButton: 'Supprimer le monde',
      emptyFilteredWorlds: 'Aucun monde ne correspond à votre recherche.',
      filterAriaLabel: 'Filtrer les mondes',
      filterClearAriaLabel: 'Effacer le filtre des mondes',
      filterPlaceholder: 'Rechercher…',
      deleteConfirm: {
        confirmDeleteButton: 'Confirmer la suppression',
        message: 'Voulez-vous vraiment supprimer ce monde ? Les documents et paramètres qui y sont liés ne pourront pas être récupérés par la suite. Ils seront perdus à jamais.'
      },
      removeDisabledHasDocuments: 'Supprimez les documents de ce monde avant de le supprimer.',
      removeDisabledLastWorld: "Un projet doit toujours avoir au moins un monde. Créez-en un autre d'abord pour supprimer celui-ci."
    },
    documentTemplates: {
      title: 'Modèles de documents',
      addFirstTemplateButton: 'Ajouter votre premier modèle',
      addTemplateButton: 'Ajouter un modèle de document',
      defaultNewTemplateName: 'Nouveau modèle de document',
      deleteTemplateButton: 'Supprimer le modèle',
      emptyFilteredTemplates: 'Aucun modèle de document ne correspond à votre recherche.',
      filterAriaLabel: 'Filtrer les modèles de documents',
      filterClearAriaLabel: 'Effacer le filtre des modèles de documents',
      filterPlaceholder: 'Rechercher…',
      missingTranslationsTabTooltip: 'Certaines traductions pour la langue actuellement sélectionnée manquent dans ce modèle de document.',
      deleteConfirm: {
        confirmDeleteButton: 'Confirmer la suppression',
        message: "Voulez-vous vraiment supprimer ce modèle de document ? Tous les champs connectés à ce modèle dans d'autres modèles cesseront de fonctionner. De plus, tous les documents connectés cesseront d'afficher leurs données s'ils ont été remplis à l'aide de ce modèle. Cette suppression peut avoir des effets secondaires involontaires."
      },
      removeDisabledHasDocuments: 'Supprimez les documents utilisant ce modèle avant de le supprimer.'
    }
  }
}
