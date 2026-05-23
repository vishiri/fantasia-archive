# Avansert søkeveiledning

---

## Introduksjon

Fantasia Archive kommer med en ganske avansert søkemotor i de fleste søkefelt som kan søke på tvers av enten alle dokumenttyper eller spesifikke typer – for eksempel multiple og enkeltrelasjonsfeltene på hver dokumentside og hurtigsøk-popupen.

---

## Intelligent søkematching og sortering

Selve søket fungerer som følger: du kan skrive inn et hvilket som helst antall ord, og programvaren vil behandle dem individuelt så lenge de er atskilt med mellomrom.

### Søket følger disse reglene

- **Søket skiller mellom store og små bokstaver, noe som betyr at du kan skrive alt med STORE eller små bokstaver (eller en annen måte), det spiller ingen rolle**
- **Ord kan være i hvilken som helst rekkefølge**
  - Eksempel: "Dark scary castle" vil bli funnet selv om du skriver "scary castle dark"
- **Selv deler av ord kan fortsatt produsere en vellykket match**
  - Eksempel: `Dark scary castle` vil bli funnet selv om du skriver `sca tle ark`
- **Dokumenter er sortert etter prioritet i henhold til følgende regler:**
  1. **Direkte match har prioritet over alt annet**
      - Eksempel: "Dark scary castle" er et direkte samsvar for et søk som inneholder "dark scary castle"
  2. **Fullordsmatch har prioritet over fragmenter**
      - Hvert fullt samsvarende ord teller individuelt; jo flere fullstendige samsvar dokumentet har, jo høyere vil det være i listen
      - Eksempel: "Dark scary castle" har to fulle ord som samsvarer fra "dark scary tle"
  3. **Fragmenter er nederst på listen**
      - Hvert fragment som matches, teller individuelt; jo flere fragmenter dokumentet har, jo høyere vil det være i listen
      - Eksempel: `Dark scary castle` har 2 fragmenttreff fra `sca tle`- **Du kan inkludere "Andre navn" i søket ved å sette "@" foran i søkestrengen**
  - Eksempel: `@Vampire lair` (hvis `Dark scary castle`-dokumentet ditt hadde `Vampire lair` i Andre navn, vil søket finne det på denne måten)

---

## Filtrering

I tillegg til den avanserte søkefunksjonaliteten, tilbyr Fantasia Archive også øyeblikkelig filtrering via flere attributter for ytterligere å begrense søkeresultatene.

- **MERK: Alle de følgende filterverdiene (inkludert fullstendig søk-filtrering i neste seksjon) støtter å matche hvilken som helst del av søketeksten med hvilken som helst del av søkeordet**
  – Eksempel: `>nada` vil samsvare med `Kontinent > Nord-Amerika > Canada > Toronto`

### Filtreringen fungerer på følgende måter og følger disse reglene:

- **Noen av følgende filtertermer VIL IKKE komme i konflikt med det vanlige ordsøket; derfor kan du bruke dem sammen**
- **Du kan bare bruke én forekomst av hver av følgende filtertyper om gangen; forskjellige filtertyper kan imidlertid være aktive sammen**
- **Filteret skiller mellom store og små bokstaver, noe som betyr at du kan skrive alt med store eller små bokstaver, det spiller ingen rolle**
- **Hvis filtertermen inneholdt mellomrom, erstatt dem med "-"-symbolet**
  - Eksempel: Du ønsker å søke etter en tag kalt "Player Characters", for å matche denne taggen fullt ut, må du skrive "#player-characters"
- **Det hierarkiske banefilteret fjerner automatisk alle `>`-symboler fra banen; dette resulterer i utelatelse fra filterstrengen**
  - Eksempel: Du ønsker å søke etter en hierarkisk bane som inneholder følgende `USA > Virginia > Richmond`, for å matche denne hierarkiske banen fullt ut, må du skrive `>usa-virginia-richmond`
- **Følgende filtertermer kan brukes**
  - `$` - Symbol for dokumenttypesøk
  - `#` - Symbol for tag-søk
  - `>` - Symbol for hierarkisk banesøk
  - `^` - Symbol for betinget svitsj-søk (spesifikke typer og verdier nedenfor)- `^c` - Viser kun dokumenter med `Er en kategori` merket av
    - `^d` - Viser kun dokumenter med "Is Dead/Gone/Destroyed" merket av
    - `^f` - Viser kun dokumenter med `Er ferdig` merket av
    - `^m` - Viser kun dokumenter med `Er et mindre dokument` avkrysset, som vanligvis er usynlige og filtrert ut

## Full-søk filtrering

Denne funksjonen er hovedsakelig ment for de som trenger fullskala søk som kan gjennomsøke alle felt i ethvert dokument for å matche verdier nesten hvor som helst i dataene. Full søk-filtrering lar deg begrense resultatene ved å søke i hele dokumentdatabasen og finne det du trenger.

### Noen få ord med forsiktighet

**Fullsøk er et veldig kraftig, men krevende verktøy – jo større prosjektet ditt vokser, desto mer krevende blir det. Hvis du for eksempel har mer enn 2000 dokumenter og søket må gjennomgå dem alle, kan det ta noen sekunder før et fullstendig søk oppdateres. Husk dette: det kan innebære mye data.**

### Filtreringen fungerer på følgende måter og følger disse reglene

- **Det fullstendige søket kan brukes i kombinasjon med andre filtre og/eller vanlige søkeord**
- **Det er mulig å ha bare en enkelt forekomst av fullsøket tilstede i søket samtidig**
- **Filteret skiller mellom store og små bokstaver, noe som betyr at du kan skrive alt med store eller små bokstaver, det spiller ingen rolle**
- **Når det gjelder lister og multirelasjoner, blir alle de angitte verdiene konvertert til én lang tekstlinje for søkenes skyld**
  - Eksempel med et felt kalt "Lokale valutaer":
    - Opprinnelige verdier: `Canadian Dollar` `American Dollar` `Euro` `Klingon Darsek`
    - Konverterte verdier: `kanadisk-dollar-amerikansk-dollar-euro-klingon-darsek`
- **Følgende filtertermer må brukes i søkestrengen**
  - `%` - Symbol for begynnelsen av full søk
  - `:` - Symbol for skillet mellom feltnavnet og feltverdien
- **Det er mulig å bruke presist søk**
  - Både feltnavnet og dets verdi kan pakkes inn i individuelle skilletegn
  - Eksempel for begge nøyaktige: `%"local-currency":"noen-valuta"`
  - Eksempel på nøyaktig feltnavn: `%"local-currency":some-valuta`- Eksempel på nøyaktig feltverdi: `%local-currencies:"some-currency"`

- **Hvis filtertermen inneholdt mellomrom, erstatt dem med "-"-symbolet**
  - Eksempel: Du ønsker å søke etter et felt kalt "Local Currencies" som inneholder "Canadian Dollars" som verdi; for å matche feltet og verdien fullt ut, skriv inn `%local-currencies:canadian-dollars`
- **Det er mulig å gjøre et fulltekstsøk, sjekke alle feltene for ønsket tekst ved å gjøre følgende: `%:canadian-dollars`**
- **En liste over felt/felttyper det fullstendige søket ikke fungerer med:**
  - Felttypen "Break" (dette er de store titlene som finnes i hele dokumentet)
  - Felttypen "Tags" (denne er dekket med et mer sofistikert tag-filter)
  - Felttypen "Switch" (denne inneholder ingen tekstverdier som kan filtreres og er delvis dekket av alternativet for byttesøk)
  - `Navn`-feltet (dette er hovedbekymringen for søket, og det vanlige søket er langt mer avansert for å søke gjennom dette)
  - Feltet "Hører til under" (dette er dekket av et mye mer avansert hierarkisk banesøk)