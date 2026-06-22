/**
 * Curated translations for Project Settings dialog and related missing locale keys (part 2).
 * Locales: nb, sv, fi, el, ru, uk
 */

export const PROJECT_SETTINGS_BY_LOCALE = {
  nb: {
    title: 'Prosjektinnstillinger',
    closeButton: 'Lukk uten å lagre',
    saveButton: 'Lagre innstillinger',
    'saveErrors.tooltipIntro': 'Kan ikke lagre. Følgende feil ble funnet:',
    'saveErrors.bulletWorldNameRequired': 'Verdensnavn er påkrevd for «{worldLabel}».',
    'saveErrors.bulletDuplicatePalette': 'Dupliserte farger funnet i paletten til «{worldLabel}».',
    'saveErrors.bulletDocumentTemplateNameRequired': 'Dokumentmalnavn er påkrevd for «{templateLabel}».',
    'saveErrors.bulletWorldTemplateGroupNameRequired': 'Malgruppenavn er påkrevd for «{worldLabel}».',
    'saveErrors.bulletWorldTemplateDuplicateDocumentTemplate': 'Duplisert dokumentmal «{templateLabel}» i «{worldLabel}».',
    'categories.generalSettings.title': 'Generelle innstillinger',
    'categories.worldsSettings.title': 'Verdener',
    'categories.documentTemplatesSettings.title': 'Dokumentmaler',
    'fields.projectName.title': 'Prosjektnavn',
    'fields.projectName.label': 'Prosjektnavn',
    'fields.projectName.errorRequired': 'Prosjektnavn er påkrevd.',
    'fields.worldName.title': 'Verdensnavn',
    'fields.worldName.label': 'Verdensnavn',
    'fields.worldName.errorRequired': 'Verdensnavn er påkrevd.',
    'fields.worldColor.title': 'Farge',
    'fields.worldColor.label': 'Verdensfarge',
    'fields.worldColor.tooltip': 'Denne fargen bestemmer hvordan verdenen din vises ulike steder i prosjektet — ikoner, tekst og lignende grensesnitt.',
    'fields.worldColorPalette.label': 'Verdens fargepalett',
    'fields.worldColorPalette.tooltipIntro': 'Fargepaletten lar deg forhåndsdefinere farger som senere brukes i hele prosjektet uten at du må velge dem manuelt hver gang. Dette gir konsistens på tvers av dokumenter når det trengs.',
    'fields.worldColorPalette.tooltipRightClickIntro': 'Flere handlinger er tilgjengelige når du høyreklikker på enkeltfarger:',
    'fields.worldColorPalette.tooltipRightClickDeletion': 'Sletting',
    'fields.worldColorPalette.tooltipRightClickDuplication': 'Duplisering',
    'fields.worldColorPalette.addButton': 'Legg til farge',
    'fields.worldColorPalette.contextMenu.duplicateColor': 'Dupliser farge',
    'fields.worldColorPalette.contextMenu.deleteColor': 'Slett farge',
    'fields.worldTemplateLayout.layoutTitle': 'Verdens hierarkiske tre',
    'fields.worldTemplateLayout.availableTemplatesTitle': 'Tilgjengelige dokumentmaler',
    'fields.worldTemplateLayout.availableTemplatesFilterAriaLabel': 'Filtrer tilgjengelige dokumentmaler',
    'fields.worldTemplateLayout.availableTemplatesFilterClearAriaLabel': 'Tøm filter for tilgjengelige dokumentmaler',
    'fields.worldTemplateLayout.availableTemplatesFilterPlaceholder': 'Søk...',
    'fields.worldTemplateLayout.emptyFilteredAvailableTemplates': 'Ingen dokumentmaler samsvarer med søket ditt.',
    'fields.worldTemplateLayout.addGroupButton': 'Legg til gruppe',
    'fields.worldTemplateLayout.defaultNewGroupName': 'Ny gruppe',
    'fields.worldTemplateLayout.editGroupTooltip': 'Gi gruppen nytt navn',
    'fields.worldTemplateLayout.editTemplateTooltip': 'Juster malens kallenavn',
    'fields.worldTemplateLayout.emptyAvailableTemplates': 'Alle dokumentmaler er tilordnet denne verdenen.',
    'fields.worldTemplateLayout.groupNameErrorRequired': 'Gruppenavn er påkrevd.',
    'fields.worldTemplateLayout.groupRenameInputLabel': 'Navn på gruppen',
    'fields.worldTemplateLayout.placementNicknameHoverOriginalNameLabel': 'Opprinnelig navn',
    'fields.worldTemplateLayout.placementNicknameHoverNicknameLabel': 'Kallenavn',
    'fields.worldTemplateLayout.removeGroupTooltip': 'Fjern gruppe',
    'fields.worldTemplateLayout.removeTemplateTooltip': 'Fjern dokumentmal',
    'fields.worldTemplateLayout.templateCanonicalNameLabel': 'Dokumentmalnavn',
    'fields.worldTemplateLayout.templateCanonicalNameTooltip': 'For å gi hele dokumentmalen et nytt navn, gå til delen «Dokumentmaler» i denne redigeringsdialogen og endre den der.',
    'fields.worldTemplateLayout.templateNicknameLabel': 'Kallenavn i denne verdenen',
    'fields.worldTemplateLayout.templateNicknameTooltip': 'Et kallenavn lar deg raskt gi dokumentmalen et annet navn i én bestemt verden uten å endre det virkelige navnet i hele prosjektet.',
    'fields.worldTemplateLayout.contextMenu.renameGroup': 'Gi gruppen nytt navn',
    'fields.worldTemplateLayout.contextMenu.deleteGroup': 'Slett gruppe',
    'fields.worldTemplateLayout.renameDialog.title': 'Gi gruppen nytt navn',
    'fields.worldTemplateLayout.renameDialog.confirmButton': 'Gi nytt navn',
    'fields.documentTemplateName.title': 'Dokumentmalnavn',
    'fields.documentTemplateName.label': 'Dokumentmalnavn',
    'fields.documentTemplateName.errorRequired': 'Minst én oversettelse av dokumentmaltittelen er påkrevd.',
    'fields.documentTemplateName.fallbackWarningTooltip':
      'Dette feltet mangler oversettelse for gjeldende språk.\nReserve brukt: {fallbackLanguageName}',
    'fields.documentTemplateTitleTranslations.tooltip': 'Rediger oversettelser',
    'fields.documentTemplateWorldAppendix.title': 'Verdenstillegg',
    'fields.documentTemplateWorldAppendix.label': 'Verdenstillegg',
    'fields.documentTemplateWorldAppendix.tooltip': 'Verdenstillegg er en kort, unik beskrivelse for dokumentmalen din når den er koblet til enkeltverdener. Dette hindrer forvirring når flere dokumentmaler deler samme navn på tvers av verdener. Tillegget hjelper deg å skille dem med ett blikk. Dette feltet vises bare på verden-fanen når maler kobles til verdener, ingen andre steder.',
    'fields.documentTemplateIcon.title': 'Ikon',
    'fields.documentTemplateIcon.label': 'Ikon',
    'panels.worlds.title': 'Prosjektets verdener',
    'panels.worlds.addWorldButton': 'Legg til verden',
    'panels.worlds.defaultNewWorldName': 'Ny verden',
    'panels.worlds.deleteWorldButton': 'Slett verden',
    'panels.worlds.emptyFilteredWorlds': 'Ingen verdener samsvarer med søket ditt.',
    'panels.worlds.filterAriaLabel': 'Filtrer verdener',
    'panels.worlds.filterClearAriaLabel': 'Tøm filter for verdener',
    'panels.worlds.filterPlaceholder': 'Søk...',
    'panels.worlds.deleteConfirm.confirmDeleteButton': 'Bekreft sletting',
    'panels.worlds.deleteConfirm.message': 'Er du sikker på at du vil slette denne verdenen? Dokumenter og innstillinger knyttet til den kan ikke gjenopprettes etterpå. De vil gå tapt for alltid.',
    'panels.worlds.removeDisabledHasDocuments': 'Fjern dokumenter fra denne verdenen før du sletter den.',
    'panels.worlds.removeDisabledLastWorld': 'Et prosjekt må alltid ha minst én verden. Opprett en annen først for å slette denne.',
    'panels.documentTemplates.title': 'Dokumentmaler',
    'panels.documentTemplates.addFirstTemplateButton': 'Legg til din første mal',
    'panels.documentTemplates.addTemplateButton': 'Legg til dokumentmal',
    'panels.documentTemplates.defaultNewTemplateName': 'Ny dokumentmal',
    'panels.documentTemplates.deleteTemplateButton': 'Slett mal',
    'panels.documentTemplates.emptyFilteredTemplates': 'Ingen dokumentmaler samsvarer med søket ditt.',
    'panels.documentTemplates.filterAriaLabel': 'Filtrer dokumentmaler',
    'panels.documentTemplates.filterClearAriaLabel': 'Tøm filter for dokumentmaler',
    'panels.documentTemplates.filterPlaceholder': 'Søk...',
    'panels.documentTemplates.missingTranslationsTabTooltip':
      'Noen av oversettelsene for det valgte språket mangler i denne dokumentmalen.',
    'panels.documentTemplates.deleteConfirm.confirmDeleteButton': 'Bekreft sletting',
    'panels.documentTemplates.deleteConfirm.message': 'Er du sikker på at du vil slette denne dokumentmalen? Alle felt koblet til denne malen i andre maler slutter å fungere. I tillegg slutter tilknyttede dokumenter å vise dataene sine hvis noen ble fylt ut med denne malen. Denne slettingen kan ha utilsiktede bivirkninger.',
    'panels.documentTemplates.removeDisabledHasDocuments': 'Fjern dokumenter som bruker denne malen før du sletter den.'
  },

  sv: {
    title: 'Projektinställningar',
    closeButton: 'Stäng utan att spara',
    saveButton: 'Spara inställningar',
    'saveErrors.tooltipIntro': 'Kan inte spara. Följande fel hittades:',
    'saveErrors.bulletWorldNameRequired': 'Världsnamn krävs för «{worldLabel}».',
    'saveErrors.bulletDuplicatePalette': 'Dubblettfärger hittades i paletten för «{worldLabel}».',
    'saveErrors.bulletDocumentTemplateNameRequired': 'Dokumentmallnamn krävs för «{templateLabel}».',
    'saveErrors.bulletWorldTemplateGroupNameRequired': 'Mallgruppnamn krävs för «{worldLabel}».',
    'saveErrors.bulletWorldTemplateDuplicateDocumentTemplate': 'Dubblett av dokumentmallen «{templateLabel}» i «{worldLabel}».',
    'categories.generalSettings.title': 'Allmänna inställningar',
    'categories.worldsSettings.title': 'Världar',
    'categories.documentTemplatesSettings.title': 'Dokumentmallar',
    'fields.projectName.title': 'Projektnamn',
    'fields.projectName.label': 'Projektnamn',
    'fields.projectName.errorRequired': 'Projektnamn krävs.',
    'fields.worldName.title': 'Världsnamn',
    'fields.worldName.label': 'Världsnamn',
    'fields.worldName.errorRequired': 'Världsnamn krävs.',
    'fields.worldColor.title': 'Färg',
    'fields.worldColor.label': 'Världsfärg',
    'fields.worldColor.tooltip': 'Den här färgen avgör hur din värld visas på olika ställen i projektet — ikoner, text och liknande gränssnitt.',
    'fields.worldColorPalette.label': 'Världens färgpalett',
    'fields.worldColorPalette.tooltipIntro': 'Färgpaletten låter dig fördefiniera färger som senare används i hela projektet utan att du behöver välja dem manuellt varje gång. Det ger konsekvens mellan dokument när det behövs.',
    'fields.worldColorPalette.tooltipRightClickIntro': 'Fler åtgärder finns när du högerklickar på enskilda färger:',
    'fields.worldColorPalette.tooltipRightClickDeletion': 'Radering',
    'fields.worldColorPalette.tooltipRightClickDuplication': 'Duplicering',
    'fields.worldColorPalette.addButton': 'Lägg till färg',
    'fields.worldColorPalette.contextMenu.duplicateColor': 'Duplicera färg',
    'fields.worldColorPalette.contextMenu.deleteColor': 'Radera färg',
    'fields.worldTemplateLayout.layoutTitle': 'Världens hierarkiska träd',
    'fields.worldTemplateLayout.availableTemplatesTitle': 'Tillgängliga dokumentmallar',
    'fields.worldTemplateLayout.availableTemplatesFilterAriaLabel': 'Filtrera tillgängliga dokumentmallar',
    'fields.worldTemplateLayout.availableTemplatesFilterClearAriaLabel': 'Rensa filter för tillgängliga dokumentmallar',
    'fields.worldTemplateLayout.availableTemplatesFilterPlaceholder': 'Sök...',
    'fields.worldTemplateLayout.emptyFilteredAvailableTemplates': 'Inga dokumentmallar matchar din sökning.',
    'fields.worldTemplateLayout.addGroupButton': 'Lägg till grupp',
    'fields.worldTemplateLayout.defaultNewGroupName': 'Ny grupp',
    'fields.worldTemplateLayout.editGroupTooltip': 'Byt namn på grupp',
    'fields.worldTemplateLayout.editTemplateTooltip': 'Justera mallens smeknamn',
    'fields.worldTemplateLayout.emptyAvailableTemplates': 'Alla dokumentmallar är tilldelade den här världen.',
    'fields.worldTemplateLayout.groupNameErrorRequired': 'Gruppnamn krävs.',
    'fields.worldTemplateLayout.groupRenameInputLabel': 'Namn på gruppen',
    'fields.worldTemplateLayout.placementNicknameHoverOriginalNameLabel': 'Ursprungligt namn',
    'fields.worldTemplateLayout.placementNicknameHoverNicknameLabel': 'Smeknamn',
    'fields.worldTemplateLayout.removeGroupTooltip': 'Ta bort grupp',
    'fields.worldTemplateLayout.removeTemplateTooltip': 'Ta bort dokumentmall',
    'fields.worldTemplateLayout.templateCanonicalNameLabel': 'Dokumentmallnamn',
    'fields.worldTemplateLayout.templateCanonicalNameTooltip': 'För att byta namn på en hel dokumentmall, gå till avsnittet «Dokumentmallar» i den här redigeringsdialogen och justera den där.',
    'fields.worldTemplateLayout.templateNicknameLabel': 'Smeknamn i den här världen',
    'fields.worldTemplateLayout.templateNicknameTooltip': 'Ett smeknamn låter dig snabbt byta namn på en dokumentmall i en specifik värld utan att ändra det riktiga namnet i hela projektet.',
    'fields.worldTemplateLayout.contextMenu.renameGroup': 'Byt namn på grupp',
    'fields.worldTemplateLayout.contextMenu.deleteGroup': 'Radera grupp',
    'fields.worldTemplateLayout.renameDialog.title': 'Byt namn på grupp',
    'fields.worldTemplateLayout.renameDialog.confirmButton': 'Byt namn',
    'fields.documentTemplateName.title': 'Dokumentmallnamn',
    'fields.documentTemplateName.label': 'Dokumentmallnamn',
    'fields.documentTemplateName.errorRequired': 'Minst en översättning av dokumentmalltiteln krävs.',
    'fields.documentTemplateName.fallbackWarningTooltip':
      'Det här fältet saknar översättning för aktuellt språk.\nReserv använd: {fallbackLanguageName}',
    'fields.documentTemplateTitleTranslations.tooltip': 'Redigera översättningar',
    'fields.documentTemplateWorldAppendix.title': 'Världstillägg',
    'fields.documentTemplateWorldAppendix.label': 'Världstillägg',
    'fields.documentTemplateWorldAppendix.tooltip': 'Världstillägg är en kort, unik beskrivning för din dokumentmall när den kopplas till enskilda världar. Det förhindrar förvirring när flera dokumentmallar delar samma namn mellan världar. Tillägget hjälper dig att skilja dem åt med en blick. Det här fältet visas bara på världsfliken när mallar kopplas till världar, ingen annanstans.',
    'fields.documentTemplateIcon.title': 'Ikon',
    'fields.documentTemplateIcon.label': 'Ikon',
    'panels.worlds.title': 'Projektets världar',
    'panels.worlds.addWorldButton': 'Lägg till värld',
    'panels.worlds.defaultNewWorldName': 'Ny värld',
    'panels.worlds.deleteWorldButton': 'Radera värld',
    'panels.worlds.emptyFilteredWorlds': 'Inga världar matchar din sökning.',
    'panels.worlds.filterAriaLabel': 'Filtrera världar',
    'panels.worlds.filterClearAriaLabel': 'Rensa filter för världar',
    'panels.worlds.filterPlaceholder': 'Sök...',
    'panels.worlds.deleteConfirm.confirmDeleteButton': 'Bekräfta radering',
    'panels.worlds.deleteConfirm.message': 'Är du säker på att du vill radera den här världen? Dokument och inställningar kopplade till den kan inte återställas efteråt. De går förlorade för alltid.',
    'panels.worlds.removeDisabledHasDocuments': 'Ta bort dokument från den här världen innan du raderar den.',
    'panels.worlds.removeDisabledLastWorld': 'Ett projekt måste alltid ha minst en värld. Skapa en annan först för att radera den här.',
    'panels.documentTemplates.title': 'Dokumentmallar',
    'panels.documentTemplates.addFirstTemplateButton': 'Lägg till din första mall',
    'panels.documentTemplates.addTemplateButton': 'Lägg till dokumentmall',
    'panels.documentTemplates.defaultNewTemplateName': 'Ny dokumentmall',
    'panels.documentTemplates.deleteTemplateButton': 'Radera mall',
    'panels.documentTemplates.emptyFilteredTemplates': 'Inga dokumentmallar matchar din sökning.',
    'panels.documentTemplates.filterAriaLabel': 'Filtrera dokumentmallar',
    'panels.documentTemplates.filterClearAriaLabel': 'Rensa filter för dokumentmallar',
    'panels.documentTemplates.filterPlaceholder': 'Sök...',
    'panels.documentTemplates.missingTranslationsTabTooltip':
      'Vissa översättningar för det valda språket saknas i den här dokumentmallen.',
    'panels.documentTemplates.deleteConfirm.confirmDeleteButton': 'Bekräfta radering',
    'panels.documentTemplates.deleteConfirm.message': 'Är du säker på att du vill radera den här dokumentmallen? Alla fält kopplade till den här mallen i andra mallar slutar fungera. Dessutom slutar anslutna dokument visa sina data om några fylldes i med den här mallen. Den här raderingen kan ha oavsiktliga bieffekter.',
    'panels.documentTemplates.removeDisabledHasDocuments': 'Ta bort dokument som använder den här mallen innan du raderar den.'
  },

  fi: {
    title: 'Projektiasetukset',
    closeButton: 'Sulje tallentamatta',
    saveButton: 'Tallenna asetukset',
    'saveErrors.tooltipIntro': 'Tallennus epäonnistui. Seuraavat virheet löytyivät:',
    'saveErrors.bulletWorldNameRequired': 'Maailman nimi vaaditaan kohteelle «{worldLabel}».',
    'saveErrors.bulletDuplicatePalette': 'Paletissa «{worldLabel}» löytyi päällekkäisiä värejä.',
    'saveErrors.bulletDocumentTemplateNameRequired': 'Asiakirjamallin nimi vaaditaan kohteelle «{templateLabel}».',
    'saveErrors.bulletWorldTemplateGroupNameRequired': 'Malliryhmän nimi vaaditaan kohteelle «{worldLabel}».',
    'saveErrors.bulletWorldTemplateDuplicateDocumentTemplate': 'Päällekkäinen asiakirjamalli «{templateLabel}» maailmassa «{worldLabel}».',
    'categories.generalSettings.title': 'Yleiset asetukset',
    'categories.worldsSettings.title': 'Maailmat',
    'categories.documentTemplatesSettings.title': 'Asiakirjamallit',
    'fields.projectName.title': 'Projektin nimi',
    'fields.projectName.label': 'Projektin nimi',
    'fields.projectName.errorRequired': 'Projektin nimi vaaditaan.',
    'fields.worldName.title': 'Maailman nimi',
    'fields.worldName.label': 'Maailman nimi',
    'fields.worldName.errorRequired': 'Maailman nimi vaaditaan.',
    'fields.worldColor.title': 'Väri',
    'fields.worldColor.label': 'Maailman väri',
    'fields.worldColor.tooltip': 'Tämä väri määrittää, miltä maailmasi näyttää eri paikoissa projektissa — kuvakkeet, teksti ja vastaava käyttöliittymä.',
    'fields.worldColorPalette.label': 'Maailman väripaletti',
    'fields.worldColorPalette.tooltipIntro': 'Väripaletti antaa sinun määrittää etukäteen värejä, joita myöhemmin käytetään koko projektissa ilman, että valitset niitä manuaalisesti joka kerta. Tämä mahdollistaa johdonmukaisuuden asiakirjojen välillä tarvittaessa.',
    'fields.worldColorPalette.tooltipRightClickIntro': 'Lisätoimintoja on saatavilla, kun napsautat yksittäisiä värejä hiiren oikealla painikkeella:',
    'fields.worldColorPalette.tooltipRightClickDeletion': 'Poisto',
    'fields.worldColorPalette.tooltipRightClickDuplication': 'Monistus',
    'fields.worldColorPalette.addButton': 'Lisää väri',
    'fields.worldColorPalette.contextMenu.duplicateColor': 'Monista väri',
    'fields.worldColorPalette.contextMenu.deleteColor': 'Poista väri',
    'fields.worldTemplateLayout.layoutTitle': 'Maailman hierarkkinen puu',
    'fields.worldTemplateLayout.availableTemplatesTitle': 'Saatavilla olevat asiakirjamallit',
    'fields.worldTemplateLayout.availableTemplatesFilterAriaLabel': 'Suodata saatavilla olevat asiakirjamallit',
    'fields.worldTemplateLayout.availableTemplatesFilterClearAriaLabel': 'Tyhjennä saatavilla olevien asiakirjamallien suodatin',
    'fields.worldTemplateLayout.availableTemplatesFilterPlaceholder': 'Hae...',
    'fields.worldTemplateLayout.emptyFilteredAvailableTemplates': 'Yksikään asiakirjamalli ei vastaa hakuasi.',
    'fields.worldTemplateLayout.addGroupButton': 'Lisää ryhmä',
    'fields.worldTemplateLayout.defaultNewGroupName': 'Uusi ryhmä',
    'fields.worldTemplateLayout.editGroupTooltip': 'Nimeä ryhmä uudelleen',
    'fields.worldTemplateLayout.editTemplateTooltip': 'Säädä mallin lempinimeä',
    'fields.worldTemplateLayout.emptyAvailableTemplates': 'Kaikki asiakirjamallit on liitetty tähän maailmaan.',
    'fields.worldTemplateLayout.groupNameErrorRequired': 'Ryhmän nimi vaaditaan.',
    'fields.worldTemplateLayout.groupRenameInputLabel': 'Ryhmän nimi',
    'fields.worldTemplateLayout.placementNicknameHoverOriginalNameLabel': 'Alkuperäinen nimi',
    'fields.worldTemplateLayout.placementNicknameHoverNicknameLabel': 'Lempinimi',
    'fields.worldTemplateLayout.removeGroupTooltip': 'Poista ryhmä',
    'fields.worldTemplateLayout.removeTemplateTooltip': 'Poista asiakirjamalli',
    'fields.worldTemplateLayout.templateCanonicalNameLabel': 'Asiakirjamallin nimi',
    'fields.worldTemplateLayout.templateCanonicalNameTooltip': 'Jos haluat nimetä koko asiakirjamallin uudelleen, siirry tämän muokkausikkunan osioon «Asiakirjamallit» ja muokkaa sitä siellä.',
    'fields.worldTemplateLayout.templateNicknameLabel': 'Lempinimi tässä maailmassa',
    'fields.worldTemplateLayout.templateNicknameTooltip': 'Lempinimen avulla voit nopeasti nimetä asiakirjamallin uudelleen tietyssä maailmassa muuttamatta sen oikeaa nimeä koko projektissa.',
    'fields.worldTemplateLayout.contextMenu.renameGroup': 'Nimeä ryhmä uudelleen',
    'fields.worldTemplateLayout.contextMenu.deleteGroup': 'Poista ryhmä',
    'fields.worldTemplateLayout.renameDialog.title': 'Nimeä ryhmä uudelleen',
    'fields.worldTemplateLayout.renameDialog.confirmButton': 'Nimeä uudelleen',
    'fields.documentTemplateName.title': 'Asiakirjamallin nimi',
    'fields.documentTemplateName.label': 'Asiakirjamallin nimi',
    'fields.documentTemplateName.errorRequired': 'Vähintään yksi asiakirjamallin otsikon käännös vaaditaan.',
    'fields.documentTemplateName.fallbackWarningTooltip':
      'Tältä kentältä puuttuu nykyisen kielen käännös.\nVaralla käytetty: {fallbackLanguageName}',
    'fields.documentTemplateTitleTranslations.tooltip': 'Muokkaa käännöksiä',
    'fields.documentTemplateWorldAppendix.title': 'Maailmaliite',
    'fields.documentTemplateWorldAppendix.label': 'Maailmaliite',
    'fields.documentTemplateWorldAppendix.tooltip': 'Maailmaliite on lyhyt, yksilöllinen kuvaus asiakirjamallillesi, kun se yhdistetään yksittäisiin maailmoihin. Se estää sekaannusta, kun useat asiakirjamallit jakavat saman nimen eri maailmoissa. Liite auttaa erottamaan ne yhdellä silmäyksellä. Tämä kenttä näkyy vain maailma-välilehdellä, kun malleja yhdistetään maailmoihin, ei muualla.',
    'fields.documentTemplateIcon.title': 'Kuvake',
    'fields.documentTemplateIcon.label': 'Kuvake',
    'panels.worlds.title': 'Projektin maailmat',
    'panels.worlds.addWorldButton': 'Lisää maailma',
    'panels.worlds.defaultNewWorldName': 'Uusi maailma',
    'panels.worlds.deleteWorldButton': 'Poista maailma',
    'panels.worlds.emptyFilteredWorlds': 'Yksikään maailma ei vastaa hakuasi.',
    'panels.worlds.filterAriaLabel': 'Suodata maailmat',
    'panels.worlds.filterClearAriaLabel': 'Tyhjennä maailmojen suodatin',
    'panels.worlds.filterPlaceholder': 'Hae...',
    'panels.worlds.deleteConfirm.confirmDeleteButton': 'Vahvista poisto',
    'panels.worlds.deleteConfirm.message': 'Haluatko varmasti poistaa tämän maailman? Siihen liittyviä asiakirjoja ja asetuksia ei voi palauttaa myöhemmin. Ne katoavat pysyvästi.',
    'panels.worlds.removeDisabledHasDocuments': 'Poista asiakirjat tästä maailmasta ennen sen poistamista.',
    'panels.worlds.removeDisabledLastWorld': 'Projektissa on aina oltava vähintään yksi maailma. Luo ensin toinen maailma ennen tämän poistamista.',
    'panels.documentTemplates.title': 'Asiakirjamallit',
    'panels.documentTemplates.addFirstTemplateButton': 'Lisää ensimmäinen mallisi',
    'panels.documentTemplates.addTemplateButton': 'Lisää asiakirjamalli',
    'panels.documentTemplates.defaultNewTemplateName': 'Uusi asiakirjamalli',
    'panels.documentTemplates.deleteTemplateButton': 'Poista malli',
    'panels.documentTemplates.emptyFilteredTemplates': 'Yksikään asiakirjamalli ei vastaa hakuasi.',
    'panels.documentTemplates.filterAriaLabel': 'Suodata asiakirjamallit',
    'panels.documentTemplates.filterClearAriaLabel': 'Tyhjennä asiakirjamallien suodatin',
    'panels.documentTemplates.filterPlaceholder': 'Hae...',
    'panels.documentTemplates.missingTranslationsTabTooltip':
      'Joitakin valitun kielen käännöksiä puuttuu tästä asiakirjamallista.',
    'panels.documentTemplates.deleteConfirm.confirmDeleteButton': 'Vahvista poisto',
    'panels.documentTemplates.deleteConfirm.message': 'Haluatko varmasti poistaa tämän asiakirjamallin? Kaikki tähän malliin liittyvät kentät muissa malleissa lakkaavat toimimasta. Lisäksi kaikki liitetyt asiakirjat lakkaavat näyttämästä tietojaan, jos niihin on täytetty tietoja tällä mallilla. Tällä poistolla voi olla odottamattomia sivuvaikutuksia.',
    'panels.documentTemplates.removeDisabledHasDocuments': 'Poista tätä mallia käyttävät asiakirjat ennen sen poistamista.'
  },

  el: {
    title: 'Ρυθμίσεις έργου',
    closeButton: 'Κλείσιμο χωρίς αποθήκευση',
    saveButton: 'Αποθήκευση ρυθμίσεων',
    'saveErrors.tooltipIntro': 'Δεν είναι δυνατή η αποθήκευση. Βρέθηκαν τα ακόλουθα σφάλματα:',
    'saveErrors.bulletWorldNameRequired': 'Το όνομα κόσμου απαιτείται για «{worldLabel}».',
    'saveErrors.bulletDuplicatePalette': 'Βρέθηκαν διπλότυπα χρώματα στην παλέτα του «{worldLabel}».',
    'saveErrors.bulletDocumentTemplateNameRequired': 'Το όνομα προτύπου εγγράφου απαιτείται για «{templateLabel}».',
    'saveErrors.bulletWorldTemplateGroupNameRequired': 'Το όνομα ομάδας προτύπων απαιτείται για «{worldLabel}».',
    'saveErrors.bulletWorldTemplateDuplicateDocumentTemplate': 'Διπλότυπο πρότυπο εγγράφου «{templateLabel}» στον «{worldLabel}».',
    'categories.generalSettings.title': 'Γενικές ρυθμίσεις',
    'categories.worldsSettings.title': 'Κόσμοι',
    'categories.documentTemplatesSettings.title': 'Πρότυπα εγγράφων',
    'fields.projectName.title': 'Όνομα έργου',
    'fields.projectName.label': 'Όνομα έργου',
    'fields.projectName.errorRequired': 'Το όνομα έργου απαιτείται.',
    'fields.worldName.title': 'Όνομα κόσμου',
    'fields.worldName.label': 'Όνομα κόσμου',
    'fields.worldName.errorRequired': 'Το όνομα κόσμου απαιτείται.',
    'fields.worldColor.title': 'Χρώμα',
    'fields.worldColor.label': 'Χρώμα κόσμου',
    'fields.worldColor.tooltip': 'Αυτό το χρώμα καθορίζει πώς εμφανίζεται ο κόσμος σας σε διάφορα σημεία του έργου — εικονίδια, κείμενο και παρόμοια διεπαφή.',
    'fields.worldColorPalette.label': 'Παλέτα χρωμάτων κόσμου',
    'fields.worldColorPalette.tooltipIntro': 'Η παλέτα χρωμάτων σάς επιτρέπει να ορίσετε εκ των προτέρων χρώματα που θα χρησιμοποιούνται αργότερα σε όλο το έργο χωρίς να τα επιλέγετε χειροκίνητα κάθε φορά. Αυτό επιτρέπει συνέπεια μεταξύ εγγράφων όταν απαιτείται.',
    'fields.worldColorPalette.tooltipRightClickIntro': 'Περισσότερες ενέργειες είναι διαθέσιμες με δεξί κλικ σε μεμονωμένα χρώματα:',
    'fields.worldColorPalette.tooltipRightClickDeletion': 'Διαγραφή',
    'fields.worldColorPalette.tooltipRightClickDuplication': 'Αντιγραφή',
    'fields.worldColorPalette.addButton': 'Προσθήκη χρώματος',
    'fields.worldColorPalette.contextMenu.duplicateColor': 'Αντιγραφή χρώματος',
    'fields.worldColorPalette.contextMenu.deleteColor': 'Διαγραφή χρώματος',
    'fields.worldTemplateLayout.layoutTitle': 'Ιεραρχικό δέντρο κόσμου',
    'fields.worldTemplateLayout.availableTemplatesTitle': 'Διαθέσιμα πρότυπα εγγράφων',
    'fields.worldTemplateLayout.availableTemplatesFilterAriaLabel': 'Φιλτράρισμα διαθέσιμων προτύπων εγγράφων',
    'fields.worldTemplateLayout.availableTemplatesFilterClearAriaLabel': 'Εκκαθάριση φίλτρου διαθέσιμων προτύπων εγγράφων',
    'fields.worldTemplateLayout.availableTemplatesFilterPlaceholder': 'Αναζήτηση...',
    'fields.worldTemplateLayout.emptyFilteredAvailableTemplates': 'Κανένα πρότυπο εγγράφου δεν ταιριάζει με την αναζήτησή σας.',
    'fields.worldTemplateLayout.addGroupButton': 'Προσθήκη ομάδας',
    'fields.worldTemplateLayout.defaultNewGroupName': 'Νέα ομάδα',
    'fields.worldTemplateLayout.editGroupTooltip': 'Μετονομασία ομάδας',
    'fields.worldTemplateLayout.editTemplateTooltip': 'Προσαρμογή ψευδωνύμου προτύπου',
    'fields.worldTemplateLayout.emptyAvailableTemplates': 'Όλα τα πρότυπα εγγράφων έχουν ανατεθεί σε αυτόν τον κόσμο.',
    'fields.worldTemplateLayout.groupNameErrorRequired': 'Το όνομα ομάδας απαιτείται.',
    'fields.worldTemplateLayout.groupRenameInputLabel': 'Όνομα της ομάδας',
    'fields.worldTemplateLayout.placementNicknameHoverOriginalNameLabel': 'Αρχικό όνομα',
    'fields.worldTemplateLayout.placementNicknameHoverNicknameLabel': 'Ψευδώνυμο',
    'fields.worldTemplateLayout.removeGroupTooltip': 'Αφαίρεση ομάδας',
    'fields.worldTemplateLayout.removeTemplateTooltip': 'Αφαίρεση προτύπου εγγράφου',
    'fields.worldTemplateLayout.templateCanonicalNameLabel': 'Όνομα προτύπου εγγράφου',
    'fields.worldTemplateLayout.templateCanonicalNameTooltip': 'Για να μετονομάσετε ολόκληρο ένα πρότυπο εγγράφου, μεταβείτε στην ενότητα «Πρότυπα εγγράφων» αυτού του διαλόγου επεξεργασίας και προσαρμόστε το εκεί.',
    'fields.worldTemplateLayout.templateNicknameLabel': 'Ψευδώνυμο μέσα σε αυτόν τον κόσμο',
    'fields.worldTemplateLayout.templateNicknameTooltip': 'Ένα ψευδώνυμο σάς επιτρέπει να μετονομάσετε γρήγορα ένα πρότυπο εγγράφου μέσα σε έναν συγκεκριμένο κόσμο χωρίς να αλλάξετε το πραγματικό του όνομα σε όλο το έργο.',
    'fields.worldTemplateLayout.contextMenu.renameGroup': 'Μετονομασία ομάδας',
    'fields.worldTemplateLayout.contextMenu.deleteGroup': 'Διαγραφή ομάδας',
    'fields.worldTemplateLayout.renameDialog.title': 'Μετονομασία ομάδας',
    'fields.worldTemplateLayout.renameDialog.confirmButton': 'Μετονομασία',
    'fields.documentTemplateName.title': 'Όνομα προτύπου εγγράφου',
    'fields.documentTemplateName.label': 'Όνομα προτύπου εγγράφου',
    'fields.documentTemplateName.errorRequired': 'Απαιτείται τουλάχιστον μία μετάφραση τίτλου προτύπου εγγράφου.',
    'fields.documentTemplateName.fallbackWarningTooltip':
      'Αυτό το πεδίο δεν έχει μετάφραση για την τρέχουσα γλώσσα.\nΧρησιμοποιείται εφεδρική: {fallbackLanguageName}',
    'fields.documentTemplateTitleTranslations.tooltip': 'Επεξεργασία μεταφράσεων',
    'fields.documentTemplateWorldAppendix.title': 'Προσάρτημα κόσμου',
    'fields.documentTemplateWorldAppendix.label': 'Προσάρτημα κόσμου',
    'fields.documentTemplateWorldAppendix.tooltip': 'Το προσάρτημα κόσμου είναι μια σύντομη, μοναδική περιγραφή για το πρότυπο εγγράφου σας όταν συνδέεται με μεμονωμένους κόσμους. Αποτρέπει σύγχυση όταν πολλά πρότυπα εγγράφων μοιράζονται το ίδιο όνομα μεταξύ κόσμων. Το προσάρτημα σάς βοηθά να τα ξεχωρίζετε με μια ματιά. Αυτό το πεδίο εμφανίζεται μόνο στην καρτέλα κόσμου κατά τη σύζευξη προτύπων με κόσμους, πουθενά αλλού.',
    'fields.documentTemplateIcon.title': 'Εικονίδιο',
    'fields.documentTemplateIcon.label': 'Εικονίδιο',
    'panels.worlds.title': 'Κόσμοι του έργου',
    'panels.worlds.addWorldButton': 'Προσθήκη κόσμου',
    'panels.worlds.defaultNewWorldName': 'Νέος κόσμος',
    'panels.worlds.deleteWorldButton': 'Διαγραφή κόσμου',
    'panels.worlds.emptyFilteredWorlds': 'Κανένας κόσμος δεν ταιριάζει με την αναζήτησή σας.',
    'panels.worlds.filterAriaLabel': 'Φιλτράρισμα κόσμων',
    'panels.worlds.filterClearAriaLabel': 'Εκκαθάριση φίλτρου κόσμων',
    'panels.worlds.filterPlaceholder': 'Αναζήτηση...',
    'panels.worlds.deleteConfirm.confirmDeleteButton': 'Επιβεβαίωση διαγραφής',
    'panels.worlds.deleteConfirm.message': 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτόν τον κόσμο; Τα έγγραφα και οι ρυθμίσεις που συνδέονται με αυτόν δεν μπορούν να ανακτηθούν μετά. Θα χαθούν για πάντα.',
    'panels.worlds.removeDisabledHasDocuments': 'Αφαιρέστε τα έγγραφα από αυτόν τον κόσμο πριν τον διαγράψετε.',
    'panels.worlds.removeDisabledLastWorld': 'Ένα έργο πρέπει να έχει πάντα τουλάχιστον έναν κόσμο. Δημιουργήστε πρώτα άλλον για να διαγράψετε αυτόν.',
    'panels.documentTemplates.title': 'Πρότυπα εγγράφων',
    'panels.documentTemplates.addFirstTemplateButton': 'Προσθέστε το πρώτο σας πρότυπο',
    'panels.documentTemplates.addTemplateButton': 'Προσθήκη προτύπου εγγράφου',
    'panels.documentTemplates.defaultNewTemplateName': 'Νέο πρότυπο εγγράφου',
    'panels.documentTemplates.deleteTemplateButton': 'Διαγραφή προτύπου',
    'panels.documentTemplates.emptyFilteredTemplates': 'Κανένα πρότυπο εγγράφου δεν ταιριάζει με την αναζήτησή σας.',
    'panels.documentTemplates.filterAriaLabel': 'Φιλτράρισμα προτύπων εγγράφων',
    'panels.documentTemplates.filterClearAriaLabel': 'Εκκαθάριση φίλτρου προτύπων εγγράφων',
    'panels.documentTemplates.filterPlaceholder': 'Αναζήτηση...',
    'panels.documentTemplates.missingTranslationsTabTooltip':
      'Μερικές από τις μεταφράσεις για την επιλεγμένη γλώσσα λείπουν από αυτό το πρότυπο εγγράφου.',
    'panels.documentTemplates.deleteConfirm.confirmDeleteButton': 'Επιβεβαίωση διαγραφής',
    'panels.documentTemplates.deleteConfirm.message': 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το πρότυπο εγγράφου; Όλα τα πεδία που συνδέονται με αυτό το πρότυπο σε άλλα πρότυπα θα σταματήσουν να λειτουργούν. Επίσης, όλα τα συνδεδεμένα έγγραφα θα σταματήσουν να εμφανίζουν τα δεδομένα τους αν κάποια συμπληρώθηκαν με αυτό το πρότυπο. Αυτή η διαγραφή μπορεί να έχει ανεπιθύμητες παρενέργειες.',
    'panels.documentTemplates.removeDisabledHasDocuments': 'Αφαιρέστε τα έγγραφα που χρησιμοποιούν αυτό το πρότυπο πριν το διαγράψετε.'
  },

  ru: {
    title: 'Настройки проекта',
    closeButton: 'Закрыть без сохранения',
    saveButton: 'Сохранить настройки',
    'saveErrors.tooltipIntro': 'Не удалось сохранить. Обнаружены следующие ошибки:',
    'saveErrors.bulletWorldNameRequired': 'Для «{worldLabel}» требуется имя мира.',
    'saveErrors.bulletDuplicatePalette': 'В палитре «{worldLabel}» найдены повторяющиеся цвета.',
    'saveErrors.bulletDocumentTemplateNameRequired': 'Для «{templateLabel}» требуется имя шаблона документа.',
    'saveErrors.bulletWorldTemplateGroupNameRequired': 'Для «{worldLabel}» требуется имя группы шаблонов.',
    'saveErrors.bulletWorldTemplateDuplicateDocumentTemplate': 'Дубликат шаблона документа «{templateLabel}» в «{worldLabel}».',
    'categories.generalSettings.title': 'Общие настройки',
    'categories.worldsSettings.title': 'Миры',
    'categories.documentTemplatesSettings.title': 'Шаблоны документов',
    'fields.projectName.title': 'Имя проекта',
    'fields.projectName.label': 'Имя проекта',
    'fields.projectName.errorRequired': 'Имя проекта обязательно.',
    'fields.worldName.title': 'Имя мира',
    'fields.worldName.label': 'Имя мира',
    'fields.worldName.errorRequired': 'Имя мира обязательно.',
    'fields.worldColor.title': 'Цвет',
    'fields.worldColor.label': 'Цвет мира',
    'fields.worldColor.tooltip': 'Этот цвет определяет, как ваш мир отображается в разных местах проекта — значки, текст и подобный интерфейс.',
    'fields.worldColorPalette.label': 'Палитра цветов мира',
    'fields.worldColorPalette.tooltipIntro': 'Палитра цветов позволяет заранее задать цвета, которые затем будут использоваться по всему проекту без ручного выбора каждый раз. Это обеспечивает согласованность между документами при необходимости.',
    'fields.worldColorPalette.tooltipRightClickIntro': 'Дополнительные действия доступны при щелчке правой кнопкой мыши по отдельным цветам:',
    'fields.worldColorPalette.tooltipRightClickDeletion': 'Удаление',
    'fields.worldColorPalette.tooltipRightClickDuplication': 'Дублирование',
    'fields.worldColorPalette.addButton': 'Добавить цвет',
    'fields.worldColorPalette.contextMenu.duplicateColor': 'Дублировать цвет',
    'fields.worldColorPalette.contextMenu.deleteColor': 'Удалить цвет',
    'fields.worldTemplateLayout.layoutTitle': 'Иерархическое дерево мира',
    'fields.worldTemplateLayout.availableTemplatesTitle': 'Доступные шаблоны документов',
    'fields.worldTemplateLayout.availableTemplatesFilterAriaLabel': 'Фильтровать доступные шаблоны документов',
    'fields.worldTemplateLayout.availableTemplatesFilterClearAriaLabel': 'Очистить фильтр доступных шаблонов документов',
    'fields.worldTemplateLayout.availableTemplatesFilterPlaceholder': 'Поиск...',
    'fields.worldTemplateLayout.emptyFilteredAvailableTemplates': 'Ни один шаблон документа не соответствует вашему запросу.',
    'fields.worldTemplateLayout.addGroupButton': 'Добавить группу',
    'fields.worldTemplateLayout.defaultNewGroupName': 'Новая группа',
    'fields.worldTemplateLayout.editGroupTooltip': 'Переименовать группу',
    'fields.worldTemplateLayout.editTemplateTooltip': 'Изменить псевдоним шаблона',
    'fields.worldTemplateLayout.emptyAvailableTemplates': 'Все шаблоны документов назначены этому миру.',
    'fields.worldTemplateLayout.groupNameErrorRequired': 'Имя группы обязательно.',
    'fields.worldTemplateLayout.groupRenameInputLabel': 'Имя группы',
    'fields.worldTemplateLayout.placementNicknameHoverOriginalNameLabel': 'Исходное имя',
    'fields.worldTemplateLayout.placementNicknameHoverNicknameLabel': 'Псевдоним',
    'fields.worldTemplateLayout.removeGroupTooltip': 'Удалить группу',
    'fields.worldTemplateLayout.removeTemplateTooltip': 'Удалить шаблон документа',
    'fields.worldTemplateLayout.templateCanonicalNameLabel': 'Имя шаблона документа',
    'fields.worldTemplateLayout.templateCanonicalNameTooltip': 'Чтобы переименовать весь шаблон документа, перейдите в раздел «Шаблоны документов» этого диалога редактирования и измените его там.',
    'fields.worldTemplateLayout.templateNicknameLabel': 'Псевдоним в этом мире',
    'fields.worldTemplateLayout.templateNicknameTooltip': 'Псевдоним позволяет быстро переименовать шаблон документа в конкретном мире, не меняя его настоящее имя во всём проекте.',
    'fields.worldTemplateLayout.contextMenu.renameGroup': 'Переименовать группу',
    'fields.worldTemplateLayout.contextMenu.deleteGroup': 'Удалить группу',
    'fields.worldTemplateLayout.renameDialog.title': 'Переименовать группу',
    'fields.worldTemplateLayout.renameDialog.confirmButton': 'Переименовать',
    'fields.documentTemplateName.title': 'Имя шаблона документа',
    'fields.documentTemplateName.label': 'Имя шаблона документа',
    'fields.documentTemplateName.errorRequired': 'Требуется хотя бы один перевод названия шаблона документа.',
    'fields.documentTemplateName.fallbackWarningTooltip':
      'Для этого поля отсутствует перевод на текущий язык.\nИспользуется резервный: {fallbackLanguageName}',
    'fields.documentTemplateTitleTranslations.tooltip': 'Редактировать переводы',
    'fields.documentTemplateWorldAppendix.title': 'Приложение мира',
    'fields.documentTemplateWorldAppendix.label': 'Приложение мира',
    'fields.documentTemplateWorldAppendix.tooltip': 'Приложение мира — это краткое уникальное описание вашего шаблона документа при сопоставлении с отдельными мирами. Оно предотвращает путаницу, когда несколько шаблонов документов имеют одно имя в разных мирах. Приложение помогает отличать их с первого взгляда. Это поле появляется только на вкладке мира при сопоставлении шаблонов с мирами и нигде больше.',
    'fields.documentTemplateIcon.title': 'Значок',
    'fields.documentTemplateIcon.label': 'Значок',
    'panels.worlds.title': 'Миры проекта',
    'panels.worlds.addWorldButton': 'Добавить мир',
    'panels.worlds.defaultNewWorldName': 'Новый мир',
    'panels.worlds.deleteWorldButton': 'Удалить мир',
    'panels.worlds.emptyFilteredWorlds': 'Ни один мир не соответствует вашему запросу.',
    'panels.worlds.filterAriaLabel': 'Фильтровать миры',
    'panels.worlds.filterClearAriaLabel': 'Очистить фильтр миров',
    'panels.worlds.filterPlaceholder': 'Поиск...',
    'panels.worlds.deleteConfirm.confirmDeleteButton': 'Подтвердить удаление',
    'panels.worlds.deleteConfirm.message': 'Вы уверены, что хотите удалить этот мир? Документы и настройки, связанные с ним, нельзя будет восстановить. Они будут потеряны навсегда.',
    'panels.worlds.removeDisabledHasDocuments': 'Удалите документы из этого мира перед его удалением.',
    'panels.worlds.removeDisabledLastWorld': 'В проекте всегда должен быть хотя бы один мир. Сначала создайте другой, чтобы удалить этот.',
    'panels.documentTemplates.title': 'Шаблоны документов',
    'panels.documentTemplates.addFirstTemplateButton': 'Добавить первый шаблон',
    'panels.documentTemplates.addTemplateButton': 'Добавить шаблон документа',
    'panels.documentTemplates.defaultNewTemplateName': 'Новый шаблон документа',
    'panels.documentTemplates.deleteTemplateButton': 'Удалить шаблон',
    'panels.documentTemplates.emptyFilteredTemplates': 'Ни один шаблон документа не соответствует вашему запросу.',
    'panels.documentTemplates.filterAriaLabel': 'Фильтровать шаблоны документов',
    'panels.documentTemplates.filterClearAriaLabel': 'Очистить фильтр шаблонов документов',
    'panels.documentTemplates.filterPlaceholder': 'Поиск...',
    'panels.documentTemplates.missingTranslationsTabTooltip':
      'Некоторые переводы для выбранного языка отсутствуют в этом шаблоне документа.',
    'panels.documentTemplates.deleteConfirm.confirmDeleteButton': 'Подтвердить удаление',
    'panels.documentTemplates.deleteConfirm.message': 'Вы уверены, что хотите удалить этот шаблон документа? Все поля, связанные с этим шаблоном в других шаблонах, перестанут работать. Кроме того, все связанные документы перестанут показывать свои данные, если они были заполнены с использованием этого шаблона. Это удаление может иметь непредвиденные последствия.',
    'panels.documentTemplates.removeDisabledHasDocuments': 'Удалите документы, использующие этот шаблон, перед его удалением.'
  },

  uk: {
    title: 'Параметри проекту',
    closeButton: 'Закрити без збереження',
    saveButton: 'Зберегти налаштування',
    'saveErrors.tooltipIntro': 'Не вдалося зберегти. Виявлено такі помилки:',
    'saveErrors.bulletWorldNameRequired': 'Для «{worldLabel}» потрібна назва світу.',
    'saveErrors.bulletDuplicatePalette': 'У палітрі «{worldLabel}» знайдено повторювані кольори.',
    'saveErrors.bulletDocumentTemplateNameRequired': 'Для «{templateLabel}» потрібна назва шаблону документа.',
    'saveErrors.bulletWorldTemplateGroupNameRequired': 'Для «{worldLabel}» потрібна назва групи шаблонів.',
    'saveErrors.bulletWorldTemplateDuplicateDocumentTemplate': 'Дублікат шаблону документа «{templateLabel}» у «{worldLabel}».',
    'categories.generalSettings.title': 'Загальні налаштування',
    'categories.worldsSettings.title': 'Світи',
    'categories.documentTemplatesSettings.title': 'Шаблони документів',
    'fields.projectName.title': 'Назва проекту',
    'fields.projectName.label': 'Назва проекту',
    'fields.projectName.errorRequired': 'Назва проекту обов\'язкова.',
    'fields.worldName.title': 'Назва світу',
    'fields.worldName.label': 'Назва світу',
    'fields.worldName.errorRequired': 'Назва світу обов\'язкова.',
    'fields.worldColor.title': 'Колір',
    'fields.worldColor.label': 'Колір світу',
    'fields.worldColor.tooltip': 'Цей колір визначає, як ваш світ відображається в різних місцях проекту — піктограми, текст і подібний інтерфейс.',
    'fields.worldColorPalette.label': 'Палітра кольорів світу',
    'fields.worldColorPalette.tooltipIntro': 'Палітра кольорів дозволяє заздалегідь задати кольори, які згодом використовуватимуться в усьому проекті без ручного вибору щоразу. Це забезпечує узгодженість між документами, коли це потрібно.',
    'fields.worldColorPalette.tooltipRightClickIntro': 'Додаткові дії доступні при клацанні правою кнопкою миші окремих кольорів:',
    'fields.worldColorPalette.tooltipRightClickDeletion': 'Видалення',
    'fields.worldColorPalette.tooltipRightClickDuplication': 'Дублювання',
    'fields.worldColorPalette.addButton': 'Додати колір',
    'fields.worldColorPalette.contextMenu.duplicateColor': 'Дублювати колір',
    'fields.worldColorPalette.contextMenu.deleteColor': 'Видалити колір',
    'fields.worldTemplateLayout.layoutTitle': 'Ієрархічне дерево світу',
    'fields.worldTemplateLayout.availableTemplatesTitle': 'Доступні шаблони документів',
    'fields.worldTemplateLayout.availableTemplatesFilterAriaLabel': 'Фільтрувати доступні шаблони документів',
    'fields.worldTemplateLayout.availableTemplatesFilterClearAriaLabel': 'Очистити фільтр доступних шаблонів документів',
    'fields.worldTemplateLayout.availableTemplatesFilterPlaceholder': 'Пошук...',
    'fields.worldTemplateLayout.emptyFilteredAvailableTemplates': 'Жоден шаблон документа не відповідає вашому запиту.',
    'fields.worldTemplateLayout.addGroupButton': 'Додати групу',
    'fields.worldTemplateLayout.defaultNewGroupName': 'Нова група',
    'fields.worldTemplateLayout.editGroupTooltip': 'Перейменувати групу',
    'fields.worldTemplateLayout.editTemplateTooltip': 'Налаштувати псевдонім шаблону',
    'fields.worldTemplateLayout.emptyAvailableTemplates': 'Усі шаблони документів призначено цьому світу.',
    'fields.worldTemplateLayout.groupNameErrorRequired': 'Назва групи обов\'язкова.',
    'fields.worldTemplateLayout.groupRenameInputLabel': 'Назва групи',
    'fields.worldTemplateLayout.placementNicknameHoverOriginalNameLabel': 'Початкова назва',
    'fields.worldTemplateLayout.placementNicknameHoverNicknameLabel': 'Псевдонім',
    'fields.worldTemplateLayout.removeGroupTooltip': 'Видалити групу',
    'fields.worldTemplateLayout.removeTemplateTooltip': 'Видалити шаблон документа',
    'fields.worldTemplateLayout.templateCanonicalNameLabel': 'Назва шаблону документа',
    'fields.worldTemplateLayout.templateCanonicalNameTooltip': 'Щоб перейменувати весь шаблон документа, перейдіть до розділу «Шаблони документів» цього діалогового вікна редагування та змініть його там.',
    'fields.worldTemplateLayout.templateNicknameLabel': 'Псевдонім у цьому світі',
    'fields.worldTemplateLayout.templateNicknameTooltip': 'Псевдонім дозволяє швидко перейменувати шаблон документа в конкретному світі, не змінюючи його справжню назву в усьому проекті.',
    'fields.worldTemplateLayout.contextMenu.renameGroup': 'Перейменувати групу',
    'fields.worldTemplateLayout.contextMenu.deleteGroup': 'Видалити групу',
    'fields.worldTemplateLayout.renameDialog.title': 'Перейменувати групу',
    'fields.worldTemplateLayout.renameDialog.confirmButton': 'Перейменувати',
    'fields.documentTemplateName.title': 'Назва шаблону документа',
    'fields.documentTemplateName.label': 'Назва шаблону документа',
    'fields.documentTemplateName.errorRequired': 'Потрібен принаймні один переклад назви шаблону документа.',
    'fields.documentTemplateName.fallbackWarningTooltip':
      'Для цього поля відсутній переклад поточною мовою.\nВикористовується резервний: {fallbackLanguageName}',
    'fields.documentTemplateTitleTranslations.tooltip': 'Редагувати переклади',
    'fields.documentTemplateWorldAppendix.title': 'Додаток світу',
    'fields.documentTemplateWorldAppendix.label': 'Додаток світу',
    'fields.documentTemplateWorldAppendix.tooltip': 'Додаток світу — це короткий унікальний опис вашого шаблону документа, коли він поєднується з окремими світами. Це запобігає плутанині, коли кілька шаблонів документів мають однакову назву в різних світах. Додаток допомагає відрізнити їх з першого погляду. Це поле з’являється лише на вкладці світу під час поєднання шаблонів зі світами, більше ніде.',
    'fields.documentTemplateIcon.title': 'Піктограма',
    'fields.documentTemplateIcon.label': 'Піктограма',
    'panels.worlds.title': 'Світи проекту',
    'panels.worlds.addWorldButton': 'Додати світ',
    'panels.worlds.defaultNewWorldName': 'Новий світ',
    'panels.worlds.deleteWorldButton': 'Видалити світ',
    'panels.worlds.emptyFilteredWorlds': 'Жоден світ не відповідає вашому запиту.',
    'panels.worlds.filterAriaLabel': 'Фільтрувати світи',
    'panels.worlds.filterClearAriaLabel': 'Очистити фільтр світів',
    'panels.worlds.filterPlaceholder': 'Пошук...',
    'panels.worlds.deleteConfirm.confirmDeleteButton': 'Підтвердити видалення',
    'panels.worlds.deleteConfirm.message': 'Ви впевнені, що хочете видалити цей світ? Документи та налаштування, пов’язані з ним, не можна буде відновити. Вони будуть втрачені назавжди.',
    'panels.worlds.removeDisabledHasDocuments': 'Видаліть документи з цього світу перед його видаленням.',
    'panels.worlds.removeDisabledLastWorld': 'У проекті завжди має бути принаймні один світ. Спочатку створіть інший, щоб видалити цей.',
    'panels.documentTemplates.title': 'Шаблони документів',
    'panels.documentTemplates.addFirstTemplateButton': 'Додайте свій перший шаблон',
    'panels.documentTemplates.addTemplateButton': 'Додати шаблон документа',
    'panels.documentTemplates.defaultNewTemplateName': 'Новий шаблон документа',
    'panels.documentTemplates.deleteTemplateButton': 'Видалити шаблон',
    'panels.documentTemplates.emptyFilteredTemplates': 'Жоден шаблон документа не відповідає вашому запиту.',
    'panels.documentTemplates.filterAriaLabel': 'Фільтрувати шаблони документів',
    'panels.documentTemplates.filterClearAriaLabel': 'Очистити фільтр шаблонів документів',
    'panels.documentTemplates.filterPlaceholder': 'Пошук...',
    'panels.documentTemplates.missingTranslationsTabTooltip':
      'Деякі переклади для вибраної мови відсутні в цьому шаблоні документа.',
    'panels.documentTemplates.deleteConfirm.confirmDeleteButton': 'Підтвердити видалення',
    'panels.documentTemplates.deleteConfirm.message': 'Ви впевнені, що хочете видалити цей шаблон документа? Усі поля, пов’язані з цим шаблоном в інших шаблонах, перестануть працювати. Крім того, усі пов’язані документи перестануть показувати свої дані, якщо їх було заповнено за допомогою цього шаблону. Це видалення може мати непередбачені наслідки.',
    'panels.documentTemplates.removeDisabledHasDocuments': 'Видаліть документи, що використовують цей шаблон, перед його видаленням.'
  }
}

export const SMALL_LOCALE_STRINGS = {
  nb: {
    faProjectSettings: {
      bridgeMissing: 'Prosjektinnstillinger er ikke tilgjengelig i dette miljøet.',
      loadError: 'Det oppstod en feil ved lasting av prosjektinnstillinger. Se DevTools for detaljer.',
      saveError: 'Det oppstod en feil ved lagring av prosjektinnstillinger. Se DevTools for detaljer.',
      saveMismatchLog: 'Avvik i prosjektinnstillinger etter lagring',
      saveSuccess: 'Prosjektinnstillinger lagret.'
    },
    faColorPickerInput: {
      appendToWorldPaletteDuplicateTooltip: 'Denne fargen finnes allerede i verdens palett.',
      appendToWorldPaletteTooltip: 'Legg til denne fargen i verdens palett.'
    },
    faIconPickerInput: {
      emptyResultsMessage: 'Ingen ikoner samsvarer med søket ditt.',
      searchPlaceholder: 'Søk etter ikoner',
      triggerTooltipClick: 'Klikk for å velge ikon',
      triggerTooltipCurrentIcon: 'Gjeldende ikon: {iconName}'
    },
    projectOverview: {
      noActiveProjectName: 'Ingen prosjekt lastet',
      projectOverviewFor: 'Prosjektoversikt for'
    },
    logFullActivityPayload: {
      title: 'Logg full aktivitetsnyttelast',
      description:
        'Hvis dette er aktivert, logger aktiviteten fullstendige nyttelaster. Dette kan være nyttig ved dyp feilsøking som krever presis logging av resultater.',
      tags: 'feilsøking, feilretting, DevTools, nyttelast, aktivitet, logging'
    },
    faActionManager: {
      labels: {
        openProjectSettingsDialog: 'Åpne prosjektinnstillinger',
        saveProjectSettings: 'Lagre prosjektinnstillinger'
      }
    },
    socialContactButtons: {
      buttonReddit: {
        label: 'Reddit'
      }
    }
  },
  sv: {
    faProjectSettings: {
      bridgeMissing: 'Projektinställningar är inte tillgängliga i den här miljön.',
      loadError: 'Ett fel uppstod vid inläsning av projektinställningar. Se DevTools för detaljer.',
      saveError: 'Ett fel uppstod vid sparande av projektinställningar. Se DevTools för detaljer.',
      saveMismatchLog: 'Avvikelse i projektinställningar efter sparande',
      saveSuccess: 'Projektinställningar sparades.'
    },
    faColorPickerInput: {
      appendToWorldPaletteDuplicateTooltip: 'Den här färgen finns redan i världens palett.',
      appendToWorldPaletteTooltip: 'Lägg till den här färgen i världens palett.'
    },
    faIconPickerInput: {
      emptyResultsMessage: 'Inga ikoner matchar din sökning.',
      searchPlaceholder: 'Sök ikoner',
      triggerTooltipClick: 'Klicka för att välja ikon',
      triggerTooltipCurrentIcon: 'Aktuell ikon: {iconName}'
    },
    projectOverview: {
      noActiveProjectName: 'Inget projekt laddat',
      projectOverviewFor: 'Projektöversikt för'
    },
    logFullActivityPayload: {
      title: 'Logga fullständig aktivitetsnyttolast',
      description:
        'Om detta är aktiverat loggar aktiviteten fullständiga nyttolaster. Det kan vara användbart vid djup felsökning som kräver exakt loggning av resultat.',
      tags: 'felsökning, felsökning av problem, DevTools, nyttolast, aktivitet, loggning'
    },
    faActionManager: {
      labels: {
        openProjectSettingsDialog: 'Öppna projektinställningar',
        saveProjectSettings: 'Spara projektinställningar'
      }
    },
    socialContactButtons: {
      buttonReddit: {
        label: 'Reddit'
      }
    }
  },
  fi: {
    faProjectSettings: {
      bridgeMissing: 'Projektiasetukset eivät ole käytettävissä tässä ympäristössä.',
      loadError: 'Projektiasetusten lataamisessa tapahtui virhe. Katso lisätiedot DevToolsista.',
      saveError: 'Projektiasetusten tallentamisessa tapahtui virhe. Katso lisätiedot DevToolsista.',
      saveMismatchLog: 'Projektiasetusten ristiriita tallennuksen jälkeen',
      saveSuccess: 'Projektiasetukset tallennettu onnistuneesti.'
    },
    faColorPickerInput: {
      appendToWorldPaletteDuplicateTooltip: 'Tämä väri on jo maailman paletissa.',
      appendToWorldPaletteTooltip: 'Lisää tämä väri maailman palettiin.'
    },
    faIconPickerInput: {
      emptyResultsMessage: 'Yksikään kuvake ei vastaa hakuasi.',
      searchPlaceholder: 'Hae kuvakkeita',
      triggerTooltipClick: 'Napsauta valitaksesi kuvakkeen',
      triggerTooltipCurrentIcon: 'Nykyinen kuvake: {iconName}'
    },
    projectOverview: {
      noActiveProjectName: 'Projektia ei ladattu',
      projectOverviewFor: 'Projektin yleiskatsaus:'
    },
    logFullActivityPayload: {
      title: 'Kirjaa täydellinen aktiviteettikuorma',
      description:
        'Jos tämä on käytössä, aktiviteetti kirjaa täydelliset kuormat. Tästä voi olla hyötyä syvässä virheenkorjauksessa, jossa tarvitaan tarkkaa tulosten kirjaamista.',
      tags: 'virheenkorjaus, vianmääritys, DevTools, kuorma, aktiviteetti, kirjaus'
    },
    faActionManager: {
      labels: {
        openProjectSettingsDialog: 'Avaa projektiasetukset',
        saveProjectSettings: 'Tallenna projektiasetukset'
      }
    },
    socialContactButtons: {
      buttonReddit: {
        label: 'Reddit'
      }
    }
  },
  el: {
    faProjectSettings: {
      bridgeMissing: 'Οι ρυθμίσεις έργου δεν είναι διαθέσιμες σε αυτό το περιβάλλον.',
      loadError: 'Προέκυψε σφάλμα κατά τη φόρτωση των ρυθμίσεων έργου. Δείτε τα DevTools για λεπτομέρειες.',
      saveError: 'Προέκυψε σφάλμα κατά την αποθήκευση των ρυθμίσεων έργου. Δείτε τα DevTools για λεπτομέρειες.',
      saveMismatchLog: 'Ασυμφωνία ρυθμίσεων έργου μετά την αποθήκευση',
      saveSuccess: 'Οι ρυθμίσεις έργου αποθηκεύτηκαν με επιτυχία.'
    },
    faColorPickerInput: {
      appendToWorldPaletteDuplicateTooltip: 'Αυτό το χρώμα υπάρχει ήδη στην παλέτα του κόσμου.',
      appendToWorldPaletteTooltip: 'Προσθήκη αυτού του χρώματος στην παλέτα του κόσμου.'
    },
    faIconPickerInput: {
      emptyResultsMessage: 'Κανένα εικονίδιο δεν ταιριάζει με την αναζήτησή σας.',
      searchPlaceholder: 'Αναζήτηση εικονιδίων',
      triggerTooltipClick: 'Κάντε κλικ για να επιλέξετε εικονίδιο',
      triggerTooltipCurrentIcon: 'Τρέχον εικονίδιο: {iconName}'
    },
    projectOverview: {
      noActiveProjectName: 'Δεν έχει φορτωθεί έργο',
      projectOverviewFor: 'Επισκόπηση έργου για'
    },
    logFullActivityPayload: {
      title: 'Καταγραφή πλήρους φορτίου δραστηριότητας',
      description:
        'Εάν είναι ενεργοποιημένο, η δραστηριότητα θα καταγράφει πλήρη φορτία. Αυτό μπορεί να είναι χρήσιμο σε βαθιά αποσφαλμάτωση που απαιτεί ακριβή καταγραφή αποτελεσμάτων.',
      tags: 'αποσφαλμάτωση, αντιμετώπιση προβλημάτων, DevTools, φορτίο, δραστηριότητα, καταγραφή'
    },
    faActionManager: {
      labels: {
        openProjectSettingsDialog: 'Άνοιγμα ρυθμίσεων έργου',
        saveProjectSettings: 'Αποθήκευση ρυθμίσεων έργου'
      }
    },
    socialContactButtons: {
      buttonReddit: {
        label: 'Reddit'
      }
    }
  },
  ru: {
    faProjectSettings: {
      bridgeMissing: 'Настройки проекта недоступны в этой среде.',
      loadError: 'При загрузке настроек проекта произошла ошибка. Подробности см. в DevTools.',
      saveError: 'При сохранении настроек проекта произошла ошибка. Подробности см. в DevTools.',
      saveMismatchLog: 'Несоответствие настроек проекта после сохранения',
      saveSuccess: 'Настройки проекта успешно сохранены.'
    },
    faColorPickerInput: {
      appendToWorldPaletteDuplicateTooltip: 'Этот цвет уже есть в палитре мира.',
      appendToWorldPaletteTooltip: 'Добавить этот цвет в палитру мира.'
    },
    faIconPickerInput: {
      emptyResultsMessage: 'Ни один значок не соответствует вашему запросу.',
      searchPlaceholder: 'Поиск значков',
      triggerTooltipClick: 'Нажмите, чтобы выбрать значок',
      triggerTooltipCurrentIcon: 'Текущий значок: {iconName}'
    },
    projectOverview: {
      noActiveProjectName: 'Проект не загружен',
      projectOverviewFor: 'Обзор проекта для'
    },
    logFullActivityPayload: {
      title: 'Журналировать полную полезную нагрузку активности',
      description:
        'Если включено, активность будет журналировать полные полезные нагрузки. Это может быть полезно при глубокой отладке, требующей точного журналирования результатов.',
      tags: 'отладка, устранение неполадок, DevTools, полезная нагрузка, активность, журналирование'
    },
    faActionManager: {
      labels: {
        openProjectSettingsDialog: 'Открыть настройки проекта',
        saveProjectSettings: 'Сохранить настройки проекта'
      }
    },
    socialContactButtons: {
      buttonReddit: {
        label: 'Reddit'
      }
    }
  },
  uk: {
    faProjectSettings: {
      bridgeMissing: 'Параметри проекту недоступні в цьому середовищі.',
      loadError: 'Під час завантаження параметрів проекту сталася помилка. Докладніше див. у DevTools.',
      saveError: 'Під час збереження параметрів проекту сталася помилка. Докладніше див. у DevTools.',
      saveMismatchLog: 'Розбіжність параметрів проекту після збереження',
      saveSuccess: 'Параметри проекту успішно збережено.'
    },
    faColorPickerInput: {
      appendToWorldPaletteDuplicateTooltip: 'Цей колір уже є в палітрі світу.',
      appendToWorldPaletteTooltip: 'Додати цей колір до палітри світу.'
    },
    faIconPickerInput: {
      emptyResultsMessage: 'Жодна піктограма не відповідає вашому запиту.',
      searchPlaceholder: 'Пошук піктограм',
      triggerTooltipClick: 'Натисніть, щоб вибрати піктограму',
      triggerTooltipCurrentIcon: 'Пotочна піктограма: {iconName}'
    },
    projectOverview: {
      noActiveProjectName: 'Проект не завантажено',
      projectOverviewFor: 'Огляд проекту для'
    },
    logFullActivityPayload: {
      title: 'Журналювати повне корисне навантаження активності',
      description:
        'Якщо увімкнено, активність журналюватиме повні корисні навантаження. Це може бути корисно під час глибокої відладки, коли потрібне точне журналювання результатів.',
      tags: 'відладка, усунення несправностей, DevTools, корисне навантаження, активність, журналювання'
    },
    faActionManager: {
      labels: {
        openProjectSettingsDialog: 'Відкрити параметри проекту',
        saveProjectSettings: 'Зберегти параметри проекту'
      }
    },
    socialContactButtons: {
      buttonReddit: {
        label: 'Reddit'
      }
    }
  }
}
