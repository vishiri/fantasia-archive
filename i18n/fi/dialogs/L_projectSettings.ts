export default {
  title: 'Projektiasetukset',
  closeButton: 'Sulje tallentamatta',
  saveButton: 'Tallenna asetukset',
  saveErrors: {
    tooltipIntro: 'Tallennus epäonnistui. Seuraavat virheet löytyivät:',
    bulletWorldNameRequired: 'Maailman nimi vaaditaan kohteelle «{worldLabel}».',
    bulletDuplicatePalette: 'Paletissa «{worldLabel}» löytyi päällekkäisiä värejä.',
    bulletDocumentTemplateNameRequired: 'Asiakirjamallin nimi vaaditaan kohteelle «{templateLabel}».',
    bulletWorldTemplateGroupNameRequired: 'Malliryhmän nimi vaaditaan kohteelle «{worldLabel}».',
    bulletWorldTemplateDuplicateDocumentTemplate: 'Päällekkäinen asiakirjamalli «{templateLabel}» maailmassa «{worldLabel}».'
  },
  singularPluralMissing: {
    bothIntro: 'Puuttuvia käännöksiä nykyiselle kielelle:',
    singularBullet: 'Yksikkömuoto puuttuu',
    pluralBullet: 'Monikkomuoto puuttuu',
    usingFallback: 'Käytetään varalla olevaa: {fallbackLanguageName}'
  },
  categories: {
    generalSettings: {
      title: 'Yleiset asetukset'
    },
    worldsSettings: {
      title: 'Maailmat'
    },
    documentTemplatesSettings: {
      title: 'Asiakirjamallit'
    }
  },
  fields: {
    projectName: {
      title: 'Projektin nimi',
      label: 'Projektin nimi',
      errorRequired: 'Projektin nimi vaaditaan.'
    },
    worldName: {
      title: 'Maailman nimi',
      label: 'Maailman nimi',
      errorRequired: 'Maailman nimi vaaditaan.'
    },
    worldColor: {
      title: 'Väri',
      label: 'Maailman väri',
      tooltip: 'Tämä väri määrittää, miltä maailmasi näyttää eri paikoissa projektissa — kuvakkeet, teksti ja vastaava käyttöliittymä.'
    },
    worldColorPalette: {
      label: 'Maailman väripaletti',
      tooltipIntro: 'Väripaletti antaa sinun määrittää etukäteen värejä, joita myöhemmin käytetään koko projektissa ilman, että valitset niitä manuaalisesti joka kerta. Tämä mahdollistaa johdonmukaisuuden asiakirjojen välillä tarvittaessa.',
      tooltipRightClickIntro: 'Lisätoimintoja on saatavilla, kun napsautat yksittäisiä värejä hiiren oikealla painikkeella:',
      tooltipRightClickDeletion: 'Poisto',
      tooltipRightClickDuplication: 'Monistus',
      addButton: 'Lisää väri',
      contextMenu: {
        duplicateColor: 'Monista väri',
        deleteColor: 'Poista väri'
      }
    },
    worldTemplateLayout: {
      layoutTitle: 'Maailman hierarkkinen puu',
      availableTemplatesTitle: 'Saatavilla olevat asiakirjamallit',
      availableTemplatesFilterAriaLabel: 'Suodata saatavilla olevat asiakirjamallit',
      availableTemplatesFilterClearAriaLabel: 'Tyhjennä saatavilla olevien asiakirjamallien suodatin',
      availableTemplatesFilterPlaceholder: 'Hae...',
      emptyFilteredAvailableTemplates: 'Yksikään asiakirjamalli ei vastaa hakuasi.',
      addGroupButton: 'Lisää ryhmä',
      defaultNewGroupName: 'Uusi ryhmä',
      editGroupTooltip: 'Nimeä ryhmä uudelleen',
      editTemplateTooltip: 'Säädä mallin lempinimeä',
      emptyAvailableTemplates: 'Kaikki asiakirjamallit on liitetty tähän maailmaan.',
      groupNameErrorRequired: 'Ryhmän nimi vaaditaan.',
      groupRenameInputLabel: 'Ryhmän nimi',
      placementNicknameHoverOriginalNameLabel: 'Alkuperäinen nimi',
      placementNicknameHoverNicknameLabel: 'Lempinimi',
      removeGroupTooltip: 'Poista ryhmä',
      removeTemplateTooltip: 'Poista asiakirjamalli',
      templateCanonicalNameLabel: 'Asiakirjamallin nimi',
      templateCanonicalNameTooltip: 'Jos haluat nimetä koko asiakirjamallin uudelleen, siirry tämän muokkausikkunan osioon «Asiakirjamallit» ja muokkaa sitä siellä.',
      templateNicknameLabel: 'Lempinimi tässä maailmassa',
      templateNicknameTooltip: 'Lempinimen avulla voit nopeasti nimetä asiakirjamallin uudelleen tietyssä maailmassa muuttamatta sen oikeaa nimeä koko projektissa.',
      missingGroupDisplayNameTreeTooltip:
        'Joitakin käännöksiä valitulle kielelle puuttuu tästä ryhmän nimestä.',
      missingPlacementNicknameTreeTooltip:
        'Joitakin käännöksiä valitulle kielelle puuttuu tästä sijoituksen lempinimestä.',
      missingDocumentTemplateTitleTreeTooltip:
        'Joitakin käännöksiä valitulle kielelle puuttuu tästä asiakirjamallin otsikosta.',
      contextMenu: {
        renameGroup: 'Nimeä ryhmä uudelleen',
        deleteGroup: 'Poista ryhmä'
      },
      renameDialog: {
        title: 'Nimeä ryhmä uudelleen',
        confirmButton: 'Nimeä uudelleen'
      }
    },
    documentTemplateName: {
      title: 'Asiakirjamallin nimi',
      label: 'Asiakirjamallin nimi',
      errorRequired: 'Vähintään yksi asiakirjamallin otsikon käännös vaaditaan.'
    },
    documentTemplateWorldAppendix: {
      title: 'Maailmaliite',
      label: 'Maailmaliite',
      tooltip: 'Maailmaliite on lyhyt, yksilöllinen kuvaus asiakirjamallillesi, kun se yhdistetään yksittäisiin maailmoihin. Se estää sekaannusta, kun useat asiakirjamallit jakavat saman nimen eri maailmoissa. Liite auttaa erottamaan ne yhdellä silmäyksellä. Tämä kenttä näkyy vain maailma-välilehdellä, kun malleja yhdistetään maailmoihin, ei muualla.'
    },
    documentTemplateIcon: {
      title: 'Kuvake',
      label: 'Kuvake'
    }
  },
  panels: {
    worlds: {
      title: 'Projektin maailmat',
      addWorldButton: 'Lisää maailma',
      defaultNewWorldName: 'Uusi maailma',
      deleteWorldButton: 'Poista maailma',
      emptyFilteredWorlds: 'Yksikään maailma ei vastaa hakuasi.',
      filterAriaLabel: 'Suodata maailmat',
      filterClearAriaLabel: 'Tyhjennä maailmojen suodatin',
      filterPlaceholder: 'Hae...',
      missingTranslationsTabTooltip: 'Joitakin valitun kielen käännöksiä puuttuu tästä maailmasta.',
      deleteConfirm: {
        confirmDeleteButton: 'Vahvista poisto',
        message: 'Haluatko varmasti poistaa tämän maailman? Siihen liittyviä asiakirjoja ja asetuksia ei voi palauttaa myöhemmin. Ne katoavat pysyvästi.'
      },
      removeDisabledHasDocuments: 'Poista asiakirjat tästä maailmasta ennen sen poistamista.',
      removeDisabledLastWorld: 'Projektissa on aina oltava vähintään yksi maailma. Luo ensin toinen maailma ennen tämän poistamista.'
    },
    documentTemplates: {
      title: 'Asiakirjamallit',
      addFirstTemplateButton: 'Lisää ensimmäinen mallisi',
      addTemplateButton: 'Lisää asiakirjamalli',
      defaultNewTemplateName: 'Uusi asiakirjamalli',
      deleteTemplateButton: 'Poista malli',
      emptyFilteredTemplates: 'Yksikään asiakirjamalli ei vastaa hakuasi.',
      filterAriaLabel: 'Suodata asiakirjamallit',
      filterClearAriaLabel: 'Tyhjennä asiakirjamallien suodatin',
      filterPlaceholder: 'Hae...',
      missingTranslationsTabTooltip: 'Joitakin valitun kielen käännöksiä puuttuu tästä asiakirjamallista.',
      deleteConfirm: {
        confirmDeleteButton: 'Vahvista poisto',
        message: 'Haluatko varmasti poistaa tämän asiakirjamallin? Kaikki tähän malliin liittyvät kentät muissa malleissa lakkaavat toimimasta. Lisäksi kaikki liitetyt asiakirjat lakkaavat näyttämästä tietojaan, jos niihin on täytetty tietoja tällä mallilla. Tällä poistolla voi olla odottamattomia sivuvaikutuksia.'
      },
      removeDisabledHasDocuments: 'Poista tätä mallia käyttävät asiakirjat ennen sen poistamista.'
    }
  }
}
