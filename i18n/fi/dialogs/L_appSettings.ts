export default {
  title: 'Fantasia Archive Asetukset',
  saveButton: 'Tallenna asetukset',
  closeButton: 'Sulje tallentamatta',
  settingsSearchPlaceholder: 'Hae asetuksista...',
  searchNoResultsTitle: 'Ei hakua',
  searchNoResultsDescription: 'Fantasia ei valitettavasti löytänyt etsimiäsi asetuksia. Ehkä kokeile toista hakusanaa?',
  appOptionsCategories: {
    accessibility: {
      title: 'Esteettömyys',
      tags: 'a11y, luettavuus, näkyvyys, avustava',
      accessibility: {
        subtitle: 'Esteettömyys',
        tags: 'a11y, luettavuus, näkyvyys, avustava',
      }
    },
    developerSettings: {
      title: 'Kehittäjäasetukset',
      tags: 'kehittäjä, virheenkorjaus, diagnostiikka, sisäinen',
      documentBody: {
        subtitle: 'Asiakirjan runko',
        tags: 'asiakirjan tunnus, virheenkorjauksen metatiedot, sisäiset kentät',
      }
    },
    documentViewEdit: {
      title: 'Sivu: Asiakirjan katselu/muokkaus',
      tags: 'asiakirjan sivu, katselutila, muokkaustila, lukija',
      documentBody: {
        subtitle: 'Asiakirjan runko',
        tags: 'sisältöalue, kentät, lukeminen, muokkausalue',
      },
    },
    hierarchicalTree: {
      title: 'Hierarkkinen puu',
      tags: 'sivupalkki, ääriviivat, navigaattori, projektipuu',
      iconSettings: {
        subtitle: 'Kuvakeasetukset',
        tags: 'toimintokuvakkeet, puupainikkeet, rivikuvakkeet',
      },
      informationDisplaySettings: {
        subtitle: 'Tietonäytön asetukset',
        tags: 'määrät, numerot, tilausindeksi, metatietojen näyttö',
      },
      tagSettings: {
        subtitle: 'Tunnisteen asetukset',
        tags: 'tarrat, tunnisteiden näyttö, tunnisteiden ryhmittely',
      },
      treeBehavior: {
        subtitle: 'Puun käyttäytyminen',
        tags: 'laajentaa, romahtaa, laajentaa kaikkea, vuorovaikutus',
      },
    },

    popupsFloatingWindows: {
      title: 'Ponnahdusikkunat ja kelluvat ikkunat',
      tags: 'valintaikkunat, peittokuvat, modaalit, ikkunat',
      floatingWindows: {
        subtitle: 'Kelluvat ikkunat',
        tags: 'irrota, toissijainen ikkuna, moniikkuna',
      },
      quickSearchDialog: {
        subtitle: 'Pikahaun valintaikkuna',
        tags: 'pikahaku, näppäimistöhaku, Finder',
      },
      universalDialogSettings: {
        subtitle: 'Yleiset valintaikkunaasetukset',
        tags: 'kaikki valintaikkunat, yleinen ponnahdusikkunoiden toiminta',
      }
    },
    visualAccessibility: {
      title: 'Visuaaliset ja sovelluksenlaajuiset toiminnot',
      tags: 'ulkonäkö, käyttöliittymä, globaali, käyttöliittymä, ulkoasu ja tuntuma',
      applicationExtras: {
        subtitle: 'Sovelluksen lisäosat',
        tags: 'maskotti, pehmo, fantasia, extrat',
      },
      appControlBar: {
        subtitle: 'Sovelluksen ohjauspalkki',
        tags: 'työkalupalkki, yläpalkki, otsikko, asiakirjan kromi',
      },
      tabBehavior: {
        subtitle: 'Välilehtien toiminta',
        tags: 'välilehtien vaihtaminen, välilehtinauha, hover käyttäytyminen',
      },
      visualsAppwideFunctionality: {
        subtitle: 'Visuaaliset ja sovelluksenlaajuiset toiminnot',
        tags: 'teema, kromi, asettelu, yleiset vaihtoehdot',
      }
    },
    projectOverview: {
      title: 'Sivu: Projektin yleiskatsaus',
      tags: 'projektin koti, kojelauta, yleiskatsaus, työtila',
      projectOverviewBehavior: {
        subtitle: 'Projektin yleiskatsauksen käyttäytyminen',
        tags: 'vinkit, temput, tiesitkö, yleiskatsauskortti',
      }
    },
    welcomeScreen: {
      title: 'Tervetuloa-näyttö',
      tags: 'splash, aloitusnäyttö, tervetuloa, ensimmäinen käynnistys, koti',
      welcomeScreenBehavior: {
        subtitle: 'Tervetuloa-näytön toiminta',
        tags: 'aloitusvinkit, sosiaaliset linkit, perehdytys, splash',
      }
    }
  },
  appOptions: {
    aggressiveRelationshipFilter: {
      title: 'Aggressiivinen suhteiden valinta',
      description: 'Ottaa käyttöön aggressiivisen automaattisen ehdotustilan kaikille suhdehauille sovelluksessa asiakirjan muokkaustilassa. Jos tämä ei ole käytössä, luettelon ensimmäistä kohtaa ei valita automaattisesti suodatuksen jälkeen. Tämän toiminnon käyttöönotto lisää tätä toimintoa, mikä mahdollistaa olemassa olevien asiakirjojen valinnan huomattavasti helpommin samalla kun uhrataan hieman mukavuudesta luotaessa uusia lennossa.',
      tags: 'automaattinen ehdotus, automaattinen täydennys, ensimmäinen vastaavuus, suodatinluettelo, valitse olemassa oleva, suhdehaku',
    },
    allowQuickPopupSameKeyClose: {
      title: 'Sulje pikaikkunat samalla avaimella',
      description: 'Mahdollistaa pikahaun ja pikalisäyksen ponnahdusikkunoiden sulkemisen samalla näppäinyhdistelmällä, jota käytettiin niiden avaamiseen.',
      tags: 'pikanäppäin, sama pikanäppäin, pikalisäys, hylkää ponnahdusikkuna',
    },
    allowWiderScrollbars: {
      title: 'Leveämmät vierityspalkit',
      description: 'Tämä asetus tekee FA:n vierityspalkeista leveämpiä ja mahdollistaa siten manuaalisen klikkausvierityksen suoraan niissä laitteissa, jotka eivät tue tavallista vieritystä (esimerkiksi hiiret ilman vierityspyörää).',
      tags: 'vierityspalkin leveys, klikkaa vieritys, hiiri ilman pyörää, ohjauspallo, kosketus',
    },
    disableCategoryCount: {
      title: 'Piilota luokkamäärä',
      description: 'Piilota luokanumerot hierarkkisessa puussa',
      tags: 'yksinkertaistettu laskenta, yksi numero, vähemmän sotkua',
    },
    compactTags: {
      title: 'Kompaktit tunnisteet',
      description: 'Määrittää, näytetäänkö tunnisteet yksittäisinä luokkina vai yhtenä kategoriana, jolloin kukin tunniste on alaluokka.',
      tags: 'tunnisteiden ryhmittely, yhden tagin kansio, sisäkkäiset tunnisteet, tunnistehierarkia',
    },
    darkMode: {
      title: 'Tumma tila',
      description: 'Vaihda sovelluksen vaalean ja tumman tilan välillä.',
      tags: 'tumma, vaalea, teema, teema, väri, värit',
    },
    disableCloseAfterSelectQuickSearch: {
      title: 'Lopeta sulkeminen valinnan jälkeen',
      description: 'Normaalisti pikahaku sulkeutuu, kun kohde on valittu siitä. Tämän ominaisuuden ottaminen käyttöön estää tämän toiminnan, jolloin voit avata useita hakutuloksia peräkkäin.',
      tags: 'pitää auki, useita tuloksia, erä auki, pikahaku pysyy auki',
    },
    disableAppControlBar: {
      title: 'Poista sovelluksen ohjauspalkki käytöstä',
      description: 'Jos haluat maksimoida työtilaasi asiakirjassa, voit poistaa yläpainikepalkin käytöstä tällä asetuksella. Tarvittavat ohjauspainikkeet siirretään pääasiakirjan rungon yläosaan, kun taas loput toiminnot ovat käytettävissä näppäinten kautta tai vasemmassa yläkulmassa olevan sovellusvalikon kautta.',
      tags: 'työkalurivi piilota, maksimoi tila, koko leveys, asiakirjan otsikko',
    },
    disableAppControlBarContentButtons: {
      title: 'Disable app control bar content buttons',
      description: 'Toggles the project contents (document search, document creation, etc.) on the app control bar on or off.',
      tags: 'quick search, quick add, document create, content tools, control bar buttons'
    },
    disableAppControlBarFunctionButtons: {
      title: 'Disable app control bar function buttons',
      description: 'Toggles the app functional buttons (noteboards, hierarchical tree toggling, etc.) on the app control bar on or off.',
      tags: 'noteboard, tree toggle, sidebar hide, function tools, control bar buttons'
    },
    disableAppControlBarGuides: {
      title: 'Poista sovelluksen ohjauspalkin oppaat käytöstä',
      description: 'Ottaa käyttöön tai poistaa käytöstä aloittelijoille sopivat oppaat sovelluksen ohjauspalkissa.',
      tags: 'vihjeitä aloittelijoille, opetusbannerit, valmentajan merkit, ohjauspalkin apu',
    },
    disableDocumentCounts: {
      title: 'Piilota asiakirjojen määrä',
      description: 'Piilota asiakirjanumerot hierarkkisessa puussa',
      tags: 'summat, ei laskelmia, tilastot piilotetaan',
    },
    disableDocumentToolTips: {
      title: 'Poista asiakirjan työkaluvihjeet käytöstä',
      description: 'Jos et pidä asiakirjanäkymän työkaluvihjeistä, voit poistaa ne käytöstä maailmanlaajuisesti täällä.',
      tags: 'hover teksti, kenttäohje, ponnahdusikkuna, asiakirjanäkymävinkit',
    },
    disableQuickSearchCategoryPrecheck: {
      title: 'Älä esitarkista luokkasuodatinta',
      description: 'Yleensä luokat sisällytetään pikahakuun. Tämän vaihtoehdon käyttöönotto kumoaa tämän toiminnan.',
      tags: 'luokkasuodatin, haun laajuus, sisällytä luokat, oletussuodatin',
    },
    disableSpellCheck: {
      title: 'Poista oikeinkirjoituksen tarkistus käytöstä',
      description: 'Poistaa käytöstä oikeinkirjoituksen, kieliopin ja sanan tarkistuksen asiakirjan muokkaustilassa.',
      tags: 'oikeinkirjoitus, kielioppi, oikoluku, punainen alleviivaus, kirjoitus, sanakirja',
      note: 'Tarvitsee täyden sovelluksen uudelleenkäynnistyksen, jotta se tulee voimaan!',
    },
    doNotCollapseTreeOptions: {
      title: 'Estä alitason romahtaminen puussa',
      description: 'Estää hierarkkisen puun alaluokkia sulkeutumasta, kun pääluokka suljetaan.',
      tags: 'muista laajennettu, sisäkkäinen auki, harmonikka, romahtaa lapset',
    },
    doubleDashDocCount: {
      title: 'Äännetty lukujakaja',
      description: 'Tämä asetus lisää toisen \\\\|-merkin luokan ja asiakirjamäärän väliin hierarkkisessa puussa.',
      tags: 'putki, erotin, erotin, laskentamuoto, puun määrä',
    },
    hideAdvSearchCheatsheetButton: {
      title: 'Piilota suhteiden ohjepainike',
      description: 'Piilottaa tarkennetun haun huijausarkin ohjepainikkeen suhdetyyppikenttiin.',
      tags: 'suhdekenttä, cheatsheet, ohjekuvake, linkkien valitsin, tarkennettu haku',
    },
    hideDeadCrossThrough: {
      title: 'Piilota yliviivaus',
      description: 'Tämä asetus piilottaa kuolleiden, kadonneiden tai tuhoutuneiden asiakirjojen yliviivausvaikutelman näkyvyyden lisäämiseksi.',
      tags: 'yliviivattu, kuollut, tuhoutunut, poissa, asiakirjan tila, yliviivattu',
    },
    hideDocumentTitles: {
      title: 'Piilota asiakirjojen otsikot',
      description: 'Piilottaa suuret osien otsikot asiakirjanäkymässä. Huomaa, että tämä voi johtaa suhteellisen villiin asettelun siirtymiin, mikä saattaa joissakin tapauksissa saada asiakirjan näyttämään kurittomalta.',
      tags: 'osion otsikot, kenttäryhmät, asiakirjan rakennetarrat',
    },
    hideEmptyFields: {
      title: 'Piilota tyhjät kentät',
      description: 'Piilottaa kentät ilman täytettyä arvoa katselutilassa (ei-muokkaus). Huomaa, että tämä voi johtaa suhteellisen villiin asettelun siirtymiin, mikä saattaa joissakin tapauksissa saada asiakirjan näyttämään kurittomalta.',
      tags: 'tyhjät kentät, vain luku -näkymä, kompakti asiakirja, asettelun muutos',
    },
    hideHierarchyTree: {
      title: 'Hide hierarchical tree',
      description: 'Controls whether the hierarchical tree is shown.',
      tags: 'sidebar off, navigator hidden, tree panel, outline hide'
    },
    hidePlushes: {
      title: 'Piilota Fantasia-maskotti',
      description: 'Piilottaa hämmästyttävän suloisen ja mahtavan Fantasian, pienen arkaanisen lohikäärmeen. Kuinka voisit! :(',
      tags: 'lohikäärme, maskotti, pehmo, hahmo, koriste, pääsiäismuna',
    },
    hideTooltipsProject: {
      title: 'Piilota vinkit projektin yleiskatsaukseen',
      description: 'Piilottaa projektin yleiskatsauksen vihjeitä ja vihjeitä tietokortin.',
      tags: 'projektin koti, kojelautakortti, yleiskuvausvinkit',
    },
    hideTooltipsStart: {
      title: 'Piilota vihjeiden ponnahdusikkuna aloitusnäytössä',
      description: 'Piilottaa aloitusnäytön vinkit ja temput -ponnahdusikkunan.',
      tags: 'ensimmäinen käynnistys, käyttöönotto, splash, käynnistysvinkkejä, temppuja',
    },
    hideTreeIconAddUnder: {
      title: 'Piilota "Lisää alle" -kuvake',
      description: 'Tämä vaihtoehto piilottaa "Lisää uusi asiakirja valitun ylätason alle" -kuvakkeen.',
      tags: 'lisää lapsi, uusi alle, plus alle, luo alle',
    },
    hideTreeIconEdit: {
      title: 'Piilota "Muokkaa"-kuvake',
      description: 'Tämä vaihtoehto piilottaa rivin Muokkaa-kuvakkeen.',
      tags: 'kynäkuvake, muokkaa riviä, pikamuokkauspuu',
    },
    hideTreeIconView: {
      title: 'Piilota "Avaa"-kuvake',
      description: 'Tämä vaihtoehto piilottaa rivin Avaa-kuvakkeen.',
      tags: 'avauskuvake, siirry asiakirjaan, rivin avauspainike',
    },
    hideTreeLines: {
      title: 'Hide tree lines',
      description: 'Hides the structural help-lines in the hierarchy tree.',
      tags: 'lines, helplines, structure, tree, hierarchical, hierarchical tree'
    },
    hideTreeOrderNumbers: {
      title: 'Piilota tilausnumerot',
      description: 'Piilottaa mukautetut tilausnumerot nimien vasemmalla puolella.',
      tags: 'järjestysindeksi, manuaalinen järjestys, arvoetuliite, vasen kouru',
    },
    hideRecentProjectTooltip: {
      title: 'Piilota "Selaa uusimpia projekteja" -työkaluvinkki',
      description: 'Piilottaa työkaluvihjeen Selaa uusimpia projekteja -kohdassa aloitusnäytön Jatka uusinta projektia -kohdan vieressä.',
      tags: 'projekti, lataus, lataus, uusin, viimeisin, johdanto, aloita, tervetuloa, työkaluvinkki, ponnahdusikkuna, työkaluvihjeet, ponnahdusikkuna',
    },
    hideWelcomeScreenSocials: {
      title: 'Piilota tervetulonäytön sosiaaliset linkit',
      description: 'Piilottaa kaikki sosiaaliset linkit Tervetuloa-näytölle.',
      tags: 'discord, twitter, yhteisölinkit, sosiaalinen media, tervetuloa',
    },
    skipWelcomeScreen: {
      title: 'Ohita tervetulonäyttö',
      description: 'Ohittaa tervetulonäytön ja yrittää ladata uusimman projektin suoraan sovelluksen käynnistämisen yhteydessä.',
      tags: 'projekti, lataus, lataus, uusin, viimeisin, intro, aloita, tervetuloa',
    },
    invertCategoryPosition: {
      title: 'Käänteinen kategorian sijainti',
      description: 'Vaihtaa luokan ja asiakirjanumeron paikkaa.',
      tags: 'Vaihda numerot, laskentajärjestys, luokka vs. asiakirjojen määrä',
    },
    limitEditorHeight: {
      title: 'Rajoita tekstieditorin korkeutta',
      description: 'Määrittää, onko tekstieditorilla rajoitettu korkeus, kun se ei ole koko näytön tilassa.',
      tags: 'tekstialueen korkeus, pitkä teksti, laajennuseditori, vierityseditori',
    },
    logFullActivityPayload: {
      title: 'Kirjaa täydellinen aktiviteettikuorma',
      description: 'Jos tämä on käytössä, aktiviteetti kirjaa kaikki hyötykuormat kaikissa tilanteissa (normaalisti se kirjaa vain ei-virhe- ja ei-varoitustilanteissa). Tästä voi olla hyötyä, kun teet syvällistä virheenkorjausta, joka vaatii tarkan tulosten kirjaamisen.',
      tags: 'virheenkorjaus, vianmääritys, DevTools, kuorma, aktiviteetti, kirjaus',
    },
    noProjectName: {
      title: 'Piilota projektin nimi puussa',
      description: 'Määrittää, näkyykö projektin nimi hierarkkisessa puussa ollenkaan.',
      tags: 'juurinimi, projektin otsikkopuu, otsikon piilotus',
    },
    noTags: {
      title: 'Piilota tunnisteet puuhun',
      description: 'Määrittää, näytetäänkö tunnisteita hierarkkisessa puussa ollenkaan.',
      tags: 'tarrat pois, tunnistenauha, puiden etiketit, piilota tarrat',
    },
    preventAutoScroll: {
      title: 'Estä automaattinen vieritys',
      description: 'Määrittää, muistavatko asiakirjat vieritysasemansa ja vierivätkö ne automaattisesti niiden välillä vaihdettaessa.',
      tags: 'vierityskohta, muista vierittää, hypätä ylös, välilehtikytkin',
    },
    preventFilledNoteBoardPopup: {
      title: 'Estä täytetyn muistikirjan näyttäminen',
      description: 'Kun tämä on käytössä, muistitaulu ei avaudu automaattisesti sovelluksen käynnistyksen yhteydessä, kun se sisältää edelleen muistiinpanoja aiemmista FA-istunnoista.',
      tags: 'muistilaput, muistikirja, käynnistys, automaattinen avaus, muistutukset',
    },
    preventPreviewsDocuments: {
      title: 'Estä asiakirjan esikatselu',
      description: 'Määrittää, näytetäänkö pikaesikatselut osoitinnäkymässä ja suhdekentissä.',
      tags: 'hiirikortti, kurkistus, suhdeponnahdusikkuna, upotettu esikatselu',
    },
    preventPreviewsPopups: {
      title: 'Estä asiakirjan esikatselu valintaikkunoissa',
      description: 'Ohjaa, näytetäänkö pikaesikatselut hiirellä, kun valitaan asiakirjoja valintaikkunoissa (esimerkiksi olemassa olevien asiakirjojen valitsin).',
      tags: 'olemassa olevan asiakirjan valintaikkuna, valitsimen hiiri, asiakirjan valitsin, modaalinen esikatselu',
    },
    preventPreviewsTabs: {
      title: 'Estä asiakirjojen esikatselu välilehdillä',
      description: 'Määrittää, näytetäänkö pikaesikatselut välilehtipalkin asiakirjan välilehdillä.',
      tags: 'välilehden hover, välilehtinauhan esikatselu, otsikkopalkin kurkistus',
    },
    preventPreviewsTree: {
      title: 'Estä asiakirjan esikatselu viemällä hiiri',
      description: 'Ohjaa, näytetäänkö pikaesikatselut hierarkkisessa puussa. Kun osoittimen esikatselut pysyvät käytössä, niillä voi olla suuri vaikutus sovelluksen suorituskykyyn.',
      tags: 'puun leijuminen, viive, hidas, fps, suorituskyky, sivupalkin esikatselu',
      note: 'Voi vaikuttaa merkittävästi sovelluksen suorituskykyyn!',
    },
    showDocumentID: {
      title: 'Näytä asiakirjatunnukset',
      description: 'Jos tämä on käytössä, asiakirjan rungossa näkyy myös asiakirjan sisäinen tunnus.',
      tags: 'debug, sisäinen tunnus, tunniste, kehittäjätyökalut, vianetsintä',
    },
    tagsAtTop: {
      title: 'Top tagit puussa',
      description: 'Näyttää tunnisteet hierarkkisen puun yläosassa.',
      tags: 'tunnisteiden järjestys, tunnisteet ensin, luokkien yläpuolella',
    },
    textShadow: {
      title: 'Tekstin varjo',
      description: 'Tämä asetus vaihtaa tekstin varjoja hierarkkisessa puussa, suhdehaun ponnahdusikkunoita ja välilehtiä, mikä mahdollistaa tekstin näkyvän taustaa vasten.',
      tags: 'kontrasti, luettavuus, varjo, ääriviivat, luettavuus, tekstin selkeys',
    }
  }
}
