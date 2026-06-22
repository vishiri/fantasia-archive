export default {
  title: 'Prosjektinnstillinger',
  closeButton: 'Lukk uten å lagre',
  saveButton: 'Lagre innstillinger',
  saveWithoutClosingButton: 'Lagre uten å lukke',
  saveErrors: {
    tooltipIntro: 'Kan ikke lagre. Følgende feil ble funnet:',
    bulletWorldNameRequired: 'Verdensnavn er påkrevd for «{worldLabel}».',
    bulletDuplicatePalette: 'Dupliserte farger funnet i paletten til «{worldLabel}».',
    bulletDocumentTemplateNameRequired: 'Dokumentmalnavn er påkrevd for «{templateLabel}».',
    bulletWorldTemplateGroupNameRequired: 'Malgruppenavn er påkrevd for «{worldLabel}».',
    bulletWorldTemplateDuplicateDocumentTemplate: 'Duplisert dokumentmal «{templateLabel}» i «{worldLabel}».'
  },
  singularPluralMissing: {
    bothIntro: 'Manglende oversettelser for gjeldende språk:',
    singularBullet: 'Entallsform mangler',
    pluralBullet: 'Flertallsform mangler',
    usingFallback: 'Bruker reserveversjon: {fallbackLanguageName}'
  },
  categories: {
    generalSettings: {
      title: 'Generelle innstillinger'
    },
    worldsSettings: {
      title: 'Verdener'
    },
    documentTemplatesSettings: {
      title: 'Dokumentmaler'
    }
  },
  fields: {
    projectName: {
      title: 'Prosjektnavn',
      label: 'Prosjektnavn',
      errorRequired: 'Prosjektnavn er påkrevd.'
    },
    worldName: {
      title: 'Verdensnavn',
      label: 'Verdensnavn',
      errorRequired: 'Verdensnavn er påkrevd.'
    },
    worldColor: {
      title: 'Farge',
      label: 'Verdensfarge',
      tooltip: 'Denne fargen bestemmer hvordan verdenen din vises ulike steder i prosjektet — ikoner, tekst og lignende grensesnitt.'
    },
    worldColorPalette: {
      label: 'Verdens fargepalett',
      tooltipIntro: 'Fargepaletten lar deg forhåndsdefinere farger som senere brukes i hele prosjektet uten at du må velge dem manuelt hver gang. Dette gir konsistens på tvers av dokumenter når det trengs.',
      tooltipRightClickIntro: 'Flere handlinger er tilgjengelige når du høyreklikker på enkeltfarger:',
      tooltipRightClickDeletion: 'Sletting',
      tooltipRightClickDuplication: 'Duplisering',
      addButton: 'Legg til farge',
      contextMenu: {
        duplicateColor: 'Dupliser farge',
        deleteColor: 'Slett farge'
      }
    },
    worldTemplateLayout: {
      layoutTitle: 'Verdens hierarkiske tre',
      availableTemplatesTitle: 'Tilgjengelige dokumentmaler',
      availableTemplatesFilterAriaLabel: 'Filtrer tilgjengelige dokumentmaler',
      availableTemplatesFilterClearAriaLabel: 'Tøm filter for tilgjengelige dokumentmaler',
      availableTemplatesFilterPlaceholder: 'Søk...',
      emptyFilteredAvailableTemplates: 'Ingen dokumentmaler samsvarer med søket ditt.',
      addGroupButton: 'Legg til gruppe',
      defaultNewGroupName: 'Ny gruppe',
      editGroupTooltip: 'Gi gruppen nytt navn',
      editTemplateTooltip: 'Juster malens kallenavn',
      emptyAvailableTemplates: 'Alle dokumentmaler er tilordnet denne verdenen.',
      groupNameErrorRequired: 'Gruppenavn er påkrevd.',
      groupRenameInputLabel: 'Navn på gruppen',
      placementNicknameHoverOriginalNameLabel: 'Opprinnelig navn',
      placementNicknameHoverNicknameLabel: 'Kallenavn',
      removeGroupTooltip: 'Fjern gruppe',
      removeTemplateTooltip: 'Fjern dokumentmal',
      templateCanonicalNameLabel: 'Dokumentmalnavn',
      templateCanonicalNameTooltip: 'For å gi hele dokumentmalen et nytt navn, gå til delen «Dokumentmaler» i denne redigeringsdialogen og endre den der.',
      templateNicknameLabel: 'Kallenavn i denne verdenen',
      templateNicknameTooltip: 'Et kallenavn lar deg raskt gi dokumentmalen et annet navn i én bestemt verden uten å endre det virkelige navnet i hele prosjektet.',
      missingGroupDisplayNameTreeTooltip:
        'Noen oversettelser for det valgte språket mangler for dette gruppenavnet.',
      missingPlacementNicknameTreeTooltip:
        'Noen oversettelser for det valgte språket mangler for dette plasseringskallenavnet.',
      missingDocumentTemplateTitleTreeTooltip:
        'Noen oversettelser for det valgte språket mangler for tittelen på denne dokumentmalen.',
      contextMenu: {
        renameGroup: 'Gi gruppen nytt navn',
        deleteGroup: 'Slett gruppe'
      },
      renameDialog: {
        title: 'Gi gruppen nytt navn',
        confirmButton: 'Gi nytt navn'
      }
    },
    documentTemplateName: {
      title: 'Dokumentmalnavn',
      label: 'Dokumentmalnavn',
      errorRequired: 'Minst én oversettelse av dokumentmaltittelen er påkrevd.'
    },
    documentTemplateWorldAppendix: {
      title: 'Verdenstillegg',
      label: 'Verdenstillegg',
      tooltip: 'Verdenstillegg er en kort, unik beskrivelse for dokumentmalen din når den er koblet til enkeltverdener. Dette hindrer forvirring når flere dokumentmaler deler samme navn på tvers av verdener. Tillegget hjelper deg å skille dem med ett blikk. Dette feltet vises bare på verden-fanen når maler kobles til verdener, ingen andre steder.'
    },
    documentTemplateIcon: {
      title: 'Ikon',
      label: 'Ikon'
    }
  },
  panels: {
    worlds: {
      title: 'Prosjektets verdener',
      addWorldButton: 'Legg til verden',
      defaultNewWorldName: 'Ny verden',
      deleteWorldButton: 'Slett verden',
      emptyFilteredWorlds: 'Ingen verdener samsvarer med søket ditt.',
      filterAriaLabel: 'Filtrer verdener',
      filterClearAriaLabel: 'Tøm filter for verdener',
      filterPlaceholder: 'Søk...',
      missingTranslationsTabTooltip: 'Noen av oversettelsene for det valgte språket mangler i denne verden.',
      deleteConfirm: {
        confirmDeleteButton: 'Bekreft sletting',
        message: 'Er du sikker på at du vil slette denne verdenen? Dokumenter og innstillinger knyttet til den kan ikke gjenopprettes etterpå. De vil gå tapt for alltid.'
      },
      removeDisabledHasDocuments: 'Fjern dokumenter fra denne verdenen før du sletter den.',
      removeDisabledLastWorld: 'Et prosjekt må alltid ha minst én verden. Opprett en annen først for å slette denne.'
    },
    documentTemplates: {
      title: 'Dokumentmaler',
      addFirstTemplateButton: 'Legg til din første mal',
      addTemplateButton: 'Legg til dokumentmal',
      defaultNewTemplateName: 'Ny dokumentmal',
      deleteTemplateButton: 'Slett mal',
      emptyFilteredTemplates: 'Ingen dokumentmaler samsvarer med søket ditt.',
      filterAriaLabel: 'Filtrer dokumentmaler',
      filterClearAriaLabel: 'Tøm filter for dokumentmaler',
      filterPlaceholder: 'Søk...',
      missingTranslationsTabTooltip: 'Noen av oversettelsene for det valgte språket mangler i denne dokumentmalen.',
      deleteConfirm: {
        confirmDeleteButton: 'Bekreft sletting',
        message: 'Er du sikker på at du vil slette denne dokumentmalen? Alle felt koblet til denne malen i andre maler slutter å fungere. I tillegg slutter tilknyttede dokumenter å vise dataene sine hvis noen ble fylt ut med denne malen. Denne slettingen kan ha utilsiktede bivirkninger.'
      },
      removeDisabledHasDocuments: 'Fjern dokumenter som bruker denne malen før du sletter den.'
    }
  }
}
