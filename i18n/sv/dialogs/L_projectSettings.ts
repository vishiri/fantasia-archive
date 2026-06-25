export default {
  title: 'Projektinställningar',
  closeButton: 'Stäng utan att spara',
  saveButton: 'Spara inställningar',
  saveWithoutClosingButton: 'Spara utan att stänga',
  saveErrors: {
    tooltipIntro: 'Kan inte spara. Följande fel hittades:',
    bulletWorldNameRequired: 'Världsnamn krävs för «{worldLabel}».',
    bulletDuplicatePalette: 'Dubblettfärger hittades i paletten för «{worldLabel}».',
    bulletDocumentTemplateNameRequired: 'Dokumentmallnamn krävs för «{templateLabel}».',
    bulletWorldTemplateGroupNameRequired: 'Mallgruppnamn krävs för «{worldLabel}».',
    bulletWorldTemplateDuplicateDocumentTemplate: 'Dubblett av dokumentmallen «{templateLabel}» i «{worldLabel}».'
  },
  singularPluralMissing: {
    bothIntro: 'Saknade översättningar för det valda språket:',
    singularBullet: 'Singularform saknas',
    pluralBullet: 'Pluralform saknas',
    usingFallback: 'Använder reserv av {fallbackLanguageName}'
  },
  categories: {
    generalSettings: {
      title: 'Allmänna inställningar'
    },
    worldsSettings: {
      title: 'Världar'
    },
    documentTemplatesSettings: {
      title: 'Dokumentmallar'
    }
  },
  fields: {
    projectName: {
      title: 'Projektnamn',
      label: 'Projektnamn',
      errorRequired: 'Projektnamn krävs.'
    },
    worldName: {
      title: 'Världsnamn',
      label: 'Världsnamn',
      errorRequired: 'Världsnamn krävs.'
    },
    worldColor: {
      title: 'Färg',
      label: 'Världsfärg',
      tooltip: 'Den här färgen avgör hur din värld visas på olika ställen i projektet — ikoner, text och liknande gränssnitt.',
      helpAriaLabel: 'Hjälp om världsfärg'
    },
    worldColorPalette: {
      label: 'Världens färgpalett',
      tooltipIntro: 'Färgpaletten låter dig fördefiniera färger som senare används i hela projektet utan att du behöver välja dem manuellt varje gång. Det ger konsekvens mellan dokument när det behövs.',
      tooltipRightClickIntro: 'Fler åtgärder finns när du högerklickar på enskilda färger:',
      tooltipRightClickDeletion: 'Radering',
      tooltipRightClickDuplication: 'Duplicering',
      addButton: 'Lägg till färg',
      helpAriaLabel: 'Hjälp om världens färgpalett',
      swatchAriaLabel: 'Redigera färgruta {hex}',
      contextMenu: {
        duplicateColor: 'Duplicera färg',
        deleteColor: 'Radera färg'
      }
    },
    worldTemplateLayout: {
      layoutTitle: 'Världens hierarkiska träd',
      availableTemplatesTitle: 'Tillgängliga dokumentmallar',
      availableTemplatesFilterAriaLabel: 'Filtrera tillgängliga dokumentmallar',
      availableTemplatesFilterClearAriaLabel: 'Rensa filter för tillgängliga dokumentmallar',
      availableTemplatesFilterPlaceholder: 'Sök...',
      emptyFilteredAvailableTemplates: 'Inga dokumentmallar matchar din sökning.',
      addGroupButton: 'Lägg till grupp',
      defaultNewGroupName: 'Ny grupp',
      editGroupTooltip: 'Byt namn på grupp',
      editTemplateTooltip: 'Justera mallens smeknamn',
      emptyAvailableTemplates: 'Alla dokumentmallar är tilldelade den här världen.',
      groupNameErrorRequired: 'Gruppnamn krävs.',
      groupRenameInputLabel: 'Namn på gruppen',
      placementNicknameHoverOriginalNameLabel: 'Ursprungligt namn',
      placementNicknameHoverNicknameLabel: 'Smeknamn',
      removeGroupTooltip: 'Ta bort grupp',
      removeTemplateTooltip: 'Ta bort dokumentmall',
      templateCanonicalNameLabel: 'Dokumentmallnamn',
      templateCanonicalNameTooltip: 'För att byta namn på en hel dokumentmall, gå till avsnittet «Dokumentmallar» i den här redigeringsdialogen och justera den där.',
      templateNicknameLabel: 'Smeknamn i den här världen',
      templateNicknameTooltip: 'Ett smeknamn låter dig snabbt byta namn på en dokumentmall i en specifik värld utan att ändra det riktiga namnet i hela projektet.',
      missingGroupDisplayNameTreeTooltip:
        'Vissa översättningar för det valda språket saknas för detta gruppnamn.',
      missingPlacementNicknameTreeTooltip:
        'Vissa översättningar för det valda språket saknas för detta placerings-smeknamn.',
      missingDocumentTemplateTitleTreeTooltip:
        'Vissa översättningar för det valda språket saknas för titeln på denna dokumentmall.',
      contextMenu: {
        renameGroup: 'Byt namn på grupp',
        deleteGroup: 'Radera grupp'
      },
      renameDialog: {
        title: 'Byt namn på grupp',
        confirmButton: 'Byt namn'
      }
    },
    documentTemplateName: {
      title: 'Dokumentmallnamn',
      label: 'Dokumentmallnamn',
      errorRequired: 'Minst en översättning av dokumentmalltiteln krävs.'
    },
    documentTemplateWorldAppendix: {
      title: 'Världstillägg',
      label: 'Världstillägg',
      tooltip: 'Världstillägg är en kort, unik beskrivning för din dokumentmall när den kopplas till enskilda världar. Det förhindrar förvirring när flera dokumentmallar delar samma namn mellan världar. Tillägget hjälper dig att skilja dem åt med en blick. Det här fältet visas bara på världsfliken när mallar kopplas till världar, ingen annanstans.',
      helpAriaLabel: 'Hjälp om världsbilaga'
    },
    documentTemplateIcon: {
      title: 'Ikon',
      label: 'Ikon'
    }
  },
  panels: {
    worlds: {
      title: 'Projektets världar',
      addWorldButton: 'Lägg till värld',
      defaultNewWorldName: 'Ny värld',
      deleteWorldButton: 'Radera värld',
      emptyFilteredWorlds: 'Inga världar matchar din sökning.',
      filterAriaLabel: 'Filtrera världar',
      filterClearAriaLabel: 'Rensa filter för världar',
      filterPlaceholder: 'Sök...',
      missingTranslationsTabTooltip: 'Vissa översättningar för det valda språket saknas i den här världen.',
      deleteConfirm: {
        confirmDeleteButton: 'Bekräfta radering',
        message: 'Är du säker på att du vill radera den här världen? Dokument och inställningar kopplade till den kan inte återställas efteråt. De går förlorade för alltid.'
      },
      removeDisabledHasDocuments: 'Ta bort dokument från den här världen innan du raderar den.',
      removeDisabledLastWorld: 'Ett projekt måste alltid ha minst en värld. Skapa en annan först för att radera den här.'
    },
    documentTemplates: {
      title: 'Dokumentmallar',
      addFirstTemplateButton: 'Lägg till din första mall',
      addTemplateButton: 'Lägg till dokumentmall',
      defaultNewTemplateName: 'Ny dokumentmall',
      deleteTemplateButton: 'Radera mall',
      emptyFilteredTemplates: 'Inga dokumentmallar matchar din sökning.',
      filterAriaLabel: 'Filtrera dokumentmallar',
      filterClearAriaLabel: 'Rensa filter för dokumentmallar',
      filterPlaceholder: 'Sök...',
      missingTranslationsTabTooltip: 'Vissa översättningar för det valda språket saknas i den här dokumentmallen.',
      deleteConfirm: {
        confirmDeleteButton: 'Bekräfta radering',
        message: 'Är du säker på att du vill radera den här dokumentmallen? Alla fält kopplade till den här mallen i andra mallar slutar fungera. Dessutom slutar anslutna dokument visa sina data om några fylldes i med den här mallen. Den här raderingen kan ha oavsiktliga bieffekter.'
      },
      removeDisabledHasDocuments: 'Ta bort dokument som använder den här mallen innan du raderar den.'
    }
  }
}
