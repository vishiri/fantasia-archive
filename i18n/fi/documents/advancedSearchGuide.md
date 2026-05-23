# Tarkennettu hakuopas

---

## Johdanto

Fantasia Archive sisältää melko kehittyneen hakukoneen useimmilla hakukentillä, joka voi hakea joko kaikista asiakirjatyypeistä tai tietyistä tyypeistä – esimerkiksi kunkin asiakirjasivun useista ja yksittäisistä suhdekentistä ja pikahaun ponnahdusikkunasta.

---

## Älykäs hakujen haku ja lajittelu

Itse haku toimii seuraavasti: voit syöttää minkä tahansa määrän sanoja, ja ohjelmisto käsittelee ne yksitellen, kunhan ne erotetaan välilyönnillä.

### Haku noudattaa näitä sääntöjä

- **Haku ei välitä kirjainkoolla, mikä tarkoittaa, että voit kirjoittaa kaiken isoilla tai pienillä kirjaimilla (tai millä tahansa muulla tavalla), sillä ei ole väliä**
- **Sanat voivat olla missä tahansa järjestyksessä**
  - Esimerkki: "Pumma pelottava linna" löytyy, vaikka kirjoittaisit "scary castle dark".
- **Jopa sanan osat voivat silti tuottaa onnistuneen osuman**
  - Esimerkki: "Pimeä pelottava linna" löytyy, vaikka kirjoittaisit "sca tle ark"
- **Asiakirjat lajitellaan prioriteetin mukaan seuraavien sääntöjen mukaisesti:**
  1. **Suora vastaavuus on etusijalla kaikkeen muuhun nähden**
      - Esimerkki: "Pimeä pelottava linna" vastaa suoraa hakua, joka sisältää sanan "tumma pelottava linna".
  2. **Täydellä sanahaulla on etusija katkelmiin**
      - Jokainen täysin vastaava sana lasketaan erikseen; mitä enemmän täydellisiä osumia asiakirjalla on, sitä korkeammalle se on luettelossa
      - Esimerkki: "Dark scary castle" sisältää kaksi täyttä sanaa sanasta "dark scary tle"
  3. **Fragmentit ovat luettelon lopussa**
      - Jokainen osuva fragmentti lasketaan erikseen; mitä enemmän fragmentteja asiakirjassa on, sitä korkeammalle se on luettelossa
      - Esimerkki: "Dark scary castle" sisältää kaksi fragmenttiosumaa sanasta "sca tle".- **Voit sisällyttää hakuun "muut nimet" lisäämällä hakumerkkijonon etuliitteeksi "@"**
  - Esimerkki: "@Vampire lair" (jos "Dark scary castle" -dokumentissasi oli "Vampyyripesä" muissa nimissä, haku löytää sen tällä tavalla)

---

## Suodatus

Edistyneen hakutoiminnon lisäksi Fantasia Archive tarjoaa myös välittömän suodatuksen useiden attribuuttien avulla hakutulosten tarkentamiseksi.

- **HUOMAA: Kaikki seuraavat suodatinarvot (mukaan lukien koko haun suodatus seuraavassa osiossa) tukevat minkä tahansa hakutekstin osan yhdistämistä mihin tahansa hakutermin osaan**
  - Esimerkki: ">nada" vastaa sanaa "Manner > Pohjois-Amerikka > Kanada > Toronto".

### Suodatus toimii seuraavilla tavoilla ja noudattaa näitä sääntöjä:

- **Mikään seuraavista suodatintermeistä EI OLE ristiriidassa normaalin sanahaun kanssa; joten voit käyttää niitä yhdessä**
- **Voit käyttää vain yhtä esiintymää jokaisesta seuraavista suodatintyypeistä kerrallaan; eri suodatintyypit voivat kuitenkin olla aktiivisia yhdessä**
- **Suodatin ei välitä kirjainkoosta, mikä tarkoittaa, että voit kirjoittaa kaiken isoilla tai pienillä kirjaimilla, sillä ei ole väliä**
- **Jos suodatintermi sisälsi välilyöntejä, korvaa ne `-` -symbolilla**
  - Esimerkki: haluat etsiä tunnistetta nimeltä "Player Characters", jotta tämä tunniste täsmääsi täysin kirjoittamalla "#player-characters".
- **Hierarkinen polkusuodatin poistaa automaattisesti kaikki `>`-symbolit polusta; tämä johtaa niiden pois jättämiseen suodatinmerkkijonosta**
  - Esimerkki: haluat etsiä hierarkkista polkua, joka sisältää seuraavan "USA > Virginia > Richmond". Vastataksesi täysin tähän hierarkkiseen polkuun, sinun on kirjoitettava ">usa-virginia-richmond".
- **Seuraavia suodatintermejä voidaan käyttää**
  - `$` - Symboli asiakirjatyypin haulle
  - `#` - Tunnistehaun symboli
  - `>` - Hierarkkisen polun haun symboli
  - `^` - Ehdollisen kytkimen haun symboli (tietyt tyypit ja arvot alla)- "^c" - Näyttää vain asiakirjat, joissa "On luokka" on valittuna
    - "^d" - Näyttää vain asiakirjat, joissa "On kuollut/poissa/tuhotettu" on valittuna
    - "^f" - Näyttää vain asiakirjat, joissa "On valmis" on valittuna
    - "^m" - Näyttää vain asiakirjat, joissa "On pieni asiakirja" on valittuna ja jotka ovat yleensä näkymättömiä ja suodatettu pois

## Koko haun suodatus

Tämä ominaisuus on tarkoitettu enimmäkseen niille, jotka tarvitsevat täyden mittakaavan haun, joka voi indeksoida minkä tahansa asiakirjan minkä tahansa kentän löytääkseen arvot lähes kaikkialla tiedoissa. Täyshaun suodatuksen avulla voit rajata tuloksia hakemalla koko asiakirjatietokannasta ja paikantamalla tarvitsemasi tiedot.

### Muutama varoituksen sana

**Täydellinen haku on erittäin tehokas mutta vaativa työkalu – mitä suuremmaksi projektisi kasvaa, sitä vaativammaksi se tulee. Jos sinulla on esimerkiksi yli 2000 dokumenttia ja haun on indeksoitava ne kaikki, täydellinen haku saattaa kestää muutaman sekunnin tulosten päivittämiseen. Pidä tämä mielessä: se voi sisältää paljon dataa.**

### Suodatus toimii seuraavilla tavoilla ja noudattaa näitä sääntöjä

- **Täyttä hakua voidaan käyttää yhdessä muiden suodattimien ja/tai tavallisten hakutermien kanssa**
- **On mahdollista, että haussa on läsnä vain yksi esiintymä koko hausta kerralla**
- **Suodatin ei välitä kirjainkoosta, mikä tarkoittaa, että voit kirjoittaa kaiken isoilla tai pienillä kirjaimilla, sillä ei ole väliä**
- **Listojen ja monisuhteiden tapauksessa kaikki syötetyt arvot muunnetaan yhdeksi pitkäksi tekstiriviksi haun vuoksi**
  - Esimerkki, jossa on kenttä nimeltä Paikalliset valuutat:
    - Alkuperäiset arvot: "Kanadan dollari" "Amerikan dollari" "Euro" "Klingon Darsek"
    - Muunnetut arvot: `kanadan-dollari-amerikan-dollari-euro-klingon-darsek`
- **Seuraavia suodatintermejä tulee käyttää hakumerkkijonon sisällä**
  - `%` - Symboli koko haun alkamiselle
  - `:` - Kentän nimen ja arvon välisen erottimen symboli
- **On mahdollista käyttää tarkkaa hakua**
  - Sekä kentän nimi että sen arvo voidaan kääriä yksittäisten erottimien sisään
  - Esimerkki molemmista tarkoista: `%"local-currencies":"some-currency"`
  - Esimerkki tarkasta kentän nimestä: `%"local-currencies":some-currency'- Esimerkki tarkasta kentän arvosta: `%local-currencies:"some-currency"`

- **Jos suodatintermi sisälsi välilyöntejä, korvaa ne `-` -symbolilla**
  - Esimerkki: haluat etsiä "Paikalliset valuutat" -nimistä kenttää, joka sisältää arvona "Kanadan dollarit". Vastaaksesi kenttää ja arvoa täysin, kirjoita "%local-currencies:canadian-dollars".
- **Voit tehdä täystekstihaun, joka tarkistaa halutun tekstin kaikista kentistä seuraavasti: `%:kanadan dollari`**
- **Luettelo kentistä/kenttätyypeistä, joiden kanssa täysi haku ei toimi:**
  - Break-kentän tyyppi (nämä isot otsikot ovat koko asiakirjassa)
  - Tunnisteet-kenttätyyppi (tämä on peitetty kehittyneemmällä tunnistesuodattimella)
  - Vaihto-kenttätyyppi (tämä kenttä ei sisällä tekstiarvoja tasoitettavaksi, ja se kattaa osittain kytkinhakuvaihtoehdon)
  - "Nimi"-kenttä (tämä on haun tärkein huolenaihe ja tavallinen haku on paljon edistyneempi tämän kentän kautta etsimiseen)
  - Kuuluu alle -kenttä (tämä on paljon kehittyneemmällä hierarkkisella polkuhaulla)