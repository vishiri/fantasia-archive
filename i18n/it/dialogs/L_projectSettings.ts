export default {
  title: 'Impostazioni del progetto',
  closeButton: 'Chiudi senza salvare',
  saveButton: 'Salva impostazioni',
  saveErrors: {
    tooltipIntro: 'Impossibile salvare. Sono stati rilevati i seguenti errori:',
    bulletWorldNameRequired: 'Il nome del mondo è obbligatorio per «{worldLabel}».',
    bulletDuplicatePalette: 'Colori duplicati trovati nella tavolozza di «{worldLabel}».',
    bulletDocumentTemplateNameRequired: 'Il nome del modello di documento è obbligatorio per «{templateLabel}».',
    bulletWorldTemplateGroupNameRequired: 'Il nome del gruppo di modelli è obbligatorio per «{worldLabel}».',
    bulletWorldTemplateDuplicateDocumentTemplate: 'Modello di documento duplicato «{templateLabel}» in «{worldLabel}».'
  },
  categories: {
    generalSettings: {
      title: 'Impostazioni generali'
    },
    worldsSettings: {
      title: 'Mondi'
    },
    documentTemplatesSettings: {
      title: 'Modelli di documento'
    }
  },
  fields: {
    projectName: {
      title: 'Nome del progetto',
      label: 'Nome del progetto',
      errorRequired: 'Il nome del progetto è obbligatorio.'
    },
    worldName: {
      title: 'Nome del mondo',
      label: 'Nome del mondo',
      errorRequired: 'Il nome del mondo è obbligatorio.'
    },
    worldColor: {
      title: 'Colore',
      label: 'Colore del mondo',
      tooltip: "Questo colore determina l'aspetto del mondo in vari punti del progetto — icone, testo e elementi dell'interfaccia simili."
    },
    worldColorPalette: {
      label: 'Tavolozza colori del mondo',
      tooltipIntro: "La tavolozza colori consente di predefinire colori che verranno utilizzati in seguito nell'intero progetto senza doverli selezionare manualmente ogni volta. Ciò permette coerenza tra documenti quando necessario.",
      tooltipRightClickIntro: 'Altre azioni disponibili con clic destro sui singoli colori:',
      tooltipRightClickDeletion: 'Eliminazione',
      tooltipRightClickDuplication: 'Duplicazione',
      addButton: 'Aggiungi colore',
      contextMenu: {
        duplicateColor: 'Duplica colore',
        deleteColor: 'Elimina colore'
      }
    },
    worldTemplateLayout: {
      layoutTitle: 'Albero gerarchico del mondo',
      availableTemplatesTitle: 'Modelli di documento disponibili',
      availableTemplatesFilterAriaLabel: 'Filtra modelli di documento disponibili',
      availableTemplatesFilterClearAriaLabel: 'Cancella filtro modelli di documento disponibili',
      availableTemplatesFilterPlaceholder: 'Cerca…',
      emptyFilteredAvailableTemplates: 'Nessun modello di documento corrisponde alla ricerca.',
      addGroupButton: 'Aggiungi gruppo',
      defaultNewGroupName: 'Nuovo gruppo',
      editGroupTooltip: 'Rinomina gruppo',
      editTemplateTooltip: 'Modifica soprannome del modello',
      emptyAvailableTemplates: 'Tutti i modelli di documento sono assegnati a questo mondo.',
      groupNameErrorRequired: 'Il nome del gruppo è obbligatorio.',
      groupRenameInputLabel: 'Nome del gruppo',
      placementNicknameHoverOriginalNameLabel: 'Nome originale',
      placementNicknameHoverNicknameLabel: 'Soprannome',
      removeGroupTooltip: 'Rimuovi gruppo',
      removeTemplateTooltip: 'Rimuovi modello di documento',
      templateCanonicalNameLabel: 'Nome del modello di documento',
      templateCanonicalNameTooltip: 'Per rinominare correttamente un intero modello di documento, andare alla sezione «Modelli di documento» di questa finestra di modifica e modificarlo lì.',
      templateNicknameLabel: 'Soprannome in questo mondo',
      templateNicknameTooltip: "Impostare un soprannome consente di rinominare rapidamente un modello di documento all'interno di un mondo specifico senza modificarne il nome reale in tutto il progetto.",
      contextMenu: {
        renameGroup: 'Rinomina gruppo',
        deleteGroup: 'Elimina gruppo'
      },
      renameDialog: {
        title: 'Rinomina gruppo',
        confirmButton: 'Rinomina'
      }
    },
    documentTemplateName: {
      title: 'Nome del modello di documento',
      label: 'Nome del modello di documento',
      errorRequired: 'È richiesta almeno una traduzione del titolo del modello di documento.'
    },
    documentTemplateWorldAppendix: {
      title: 'Appendice del mondo',
      label: 'Appendice del mondo',
      tooltip: "L'appendice del mondo è una breve descrizione univoca per il modello di documento quando è associato a singoli mondi. Evita confusione quando più modelli di documento condividono lo stesso nome in mondi diversi. L'appendice aiuta a distinguerli a colpo d'occhio. Questo campo appare solo nella scheda Mondi durante l'associazione dei modelli ai mondi, da nessun'altra parte."
    },
    documentTemplateIcon: {
      title: 'Icona',
      label: 'Icona'
    }
  },
  panels: {
    worlds: {
      title: 'Mondi del progetto',
      addWorldButton: 'Aggiungi mondo',
      defaultNewWorldName: 'Nuovo mondo',
      deleteWorldButton: 'Elimina mondo',
      emptyFilteredWorlds: 'Nessun mondo corrisponde alla ricerca.',
      filterAriaLabel: 'Filtra mondi',
      filterClearAriaLabel: 'Cancella filtro mondi',
      filterPlaceholder: 'Cerca…',
      deleteConfirm: {
        confirmDeleteButton: 'Conferma eliminazione',
        message: 'Eliminare davvero questo mondo? I documenti e le impostazioni collegati non potranno essere recuperati in seguito. Andranno persi per sempre.'
      },
      removeDisabledHasDocuments: 'Rimuovere i documenti da questo mondo prima di eliminarlo.',
      removeDisabledLastWorld: 'Un progetto deve avere sempre almeno un mondo. Crearne un altro prima di eliminare questo.'
    },
    documentTemplates: {
      title: 'Modelli di documento',
      addFirstTemplateButton: 'Aggiungi il primo modello',
      addTemplateButton: 'Aggiungi modello di documento',
      defaultNewTemplateName: 'Nuovo modello di documento',
      deleteTemplateButton: 'Elimina modello',
      emptyFilteredTemplates: 'Nessun modello di documento corrisponde alla ricerca.',
      filterAriaLabel: 'Filtra modelli di documento',
      filterClearAriaLabel: 'Cancella filtro modelli di documento',
      filterPlaceholder: 'Cerca…',
      missingTranslationsTabTooltip: 'Mancano alcune traduzioni per la lingua attualmente selezionata in questo modello di documento.',
      deleteConfirm: {
        confirmDeleteButton: 'Conferma eliminazione',
        message: 'Eliminare davvero questo modello di documento? Tutti i campi collegati a questo modello in altri modelli smetteranno di funzionare. Inoltre, tutti i documenti collegati smetteranno di mostrare i dati se erano stati compilati con questo modello. Questa eliminazione può avere effetti collaterali indesiderati.'
      },
      removeDisabledHasDocuments: 'Rimuovere i documenti che usano questo modello prima di eliminarlo.'
    }
  }
}
