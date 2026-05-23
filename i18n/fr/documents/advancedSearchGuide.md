# Guide de recherche avancée

---

## Introduction

Fantasia Archive est livré avec un moteur de recherche assez avancé dans la plupart des champs de recherche, capable d'effectuer une recherche dans tous les types de documents ou dans des types spécifiques : par exemple, les champs de relation multiples et uniques sur chaque page de document et la fenêtre contextuelle de recherche rapide.

---

## Recherche intelligente de correspondance et de tri

La recherche elle-même fonctionne comme suit : vous pouvez saisir n'importe quel nombre de mots, et le logiciel les traitera individuellement à condition qu'ils soient séparés par des espaces.

### La recherche suit ces règles

- **La recherche n'est pas sensible à la casse, ce qui signifie que vous pouvez tout taper en MAJUSCULES ou en minuscules (ou de toute autre manière), cela n'aura pas d'importance**
- **Les mots peuvent être dans n'importe quel ordre**
  - Exemple : « Château effrayant sombre » sera trouvé même si vous tapez « Château effrayant sombre »
- **Même des parties de mots peuvent toujours produire une correspondance réussie**
  - Exemple : "Dark Scary Castle" sera trouvé même si vous tapez "Sca tle Ark"
- **Les documents sont triés par priorité selon les règles suivantes :**
  1. **La correspondance directe a la priorité sur tout le reste**
      - Exemple : "Dark Scary Castle" correspond directement à une recherche contenant "Dark Scary Castle"
  2. **La correspondance de mots complets a la priorité sur les fragments**
      - Chaque mot parfaitement adapté compte individuellement ; plus le document a de correspondances complètes, plus il sera haut dans la liste
      - Exemple : "Dark Scary Castle" a 2 correspondances de mots complets de "Dark Scary Tle"
  3. **Les fragments sont en bas de la liste**
      - Chaque fragment correspondant compte individuellement ; plus le document contient de fragments, plus il figurera haut dans la liste
      - Exemple : `Dark Scary Castle` a 2 fragments correspondants de `sca tle`- **Vous pouvez inclure `Autres noms` dans la recherche en préfixant `@` à la chaîne de recherche**
  - Exemple : `@Vampire lair` (si votre document `Dark Scary Castle` avait `Vampire lair` dans Autres noms, la recherche le trouvera de cette façon)

---

## Filtrage

En plus de la fonctionnalité de recherche avancée, Fantasia Archive offre également un filtrage instantané via plusieurs attributs pour affiner davantage les résultats de recherche.

- **REMARQUE : Toutes les valeurs de filtre suivantes (y compris le filtrage de recherche complète dans la section suivante) permettent de faire correspondre n'importe quelle partie du texte de recherche avec n'importe quelle partie du terme de recherche**
  - Exemple : `>nada` correspondra à `Continent > Amérique du Nord > Canada > Toronto`

### Le filtrage fonctionne de la manière suivante et suit ces règles :

- **Aucun des termes de filtre suivants n'entrera en conflit avec la recherche de mots normale ; vous pouvez donc les utiliser ensemble**
- **Vous ne pouvez utiliser qu'une seule instance de chacun des types de filtres suivants à la fois ; cependant, différents types de filtres peuvent être actifs ensemble**
- **Le filtre n'est pas sensible à la casse, ce qui signifie que vous pouvez tout taper en MAJUSCULES ou en minuscules, cela n'a pas d'importance**
- **Si votre terme de filtre contenait des espaces, remplacez-les par le symbole `-`**
  - Exemple : Vous souhaitez rechercher un tag appelé `Player Characters`, pour faire correspondre entièrement ce tag, vous devrez taper `#player-characters`
- **Le filtre de chemin hiérarchique supprime automatiquement tous les symboles `>` du chemin ; cela entraîne leur omission de la chaîne de filtre**
  - Exemple : Vous souhaitez rechercher un chemin hiérarchique contenant `USA > Virginia > Richmond`, pour correspondre entièrement à ce chemin hiérarchique, vous devrez taper `>usa-virginia-richmond`
- **Les termes de filtrage suivants peuvent être utilisés**
  - `$` - Symbole pour la recherche de type de document
  - `#` - Symbole pour la recherche de balises
  - `>` - Symbole pour la recherche de chemin hiérarchique
  - `^` - Symbole pour la recherche de commutateur conditionnel (types et valeurs spécifiques ci-dessous)- `^c` - Affiche uniquement les documents avec la case `Est-ce une catégorie` cochée
    - `^d` - Affiche uniquement les documents avec `Is Dead/Gone/Destroyed` coché
    - `^f` - Affiche uniquement les documents avec la case `Est terminé` cochée
    - `^m` - Affiche uniquement les documents avec la case `Est-ce un document mineur` coché, qui sont normalement invisibles et filtrés

## Filtrage de recherche complète

Cette fonctionnalité est principalement destinée à ceux qui ont besoin d'une recherche à grande échelle capable d'explorer n'importe quel champ de n'importe quel document pour faire correspondre les valeurs presque n'importe où dans les données. Le filtrage de recherche complète vous permet d'affiner les résultats en recherchant dans l'ensemble de la base de données de documents et en identifiant ce dont vous avez besoin.

### Quelques mots d'avertissement

**La recherche complète est un outil très puissant mais exigeant : plus votre projet se développe, plus il devient exigeant. Si vous disposez, par exemple, de plus de 2 000 documents et que la recherche doit les parcourir tous, la recherche complète peut prendre quelques secondes pour actualiser vos résultats. Gardez cela à l’esprit : cela peut impliquer beaucoup de données.**

### Le filtrage fonctionne de la manière suivante et suit ces règles

- **La recherche complète peut être utilisée en combinaison avec d'autres filtres et/ou termes de recherche normaux**
- **Il est possible de n'avoir qu'une seule instance de la recherche complète présente à la fois dans la recherche**
- **Le filtre n'est pas sensible à la casse, ce qui signifie que vous pouvez tout taper en MAJUSCULES ou en minuscules, cela n'a pas d'importance**
- **Dans le cas de listes et de relations multiples, toutes les valeurs saisies sont converties en une longue ligne de texte pour des raisons de recherche**
  - Exemple avec un champ appelé `Monnaies locales` :
    - Valeurs originales : `Dollar canadien` `Dollar américain` `Euro` `Klingon Darsek`
    - Valeurs converties : `canadian-dollar-american-dollar-euro-klingon-darsek`
- **Les termes de filtre suivants doivent être utilisés dans la chaîne de recherche**
  - `%` - Symbole pour le début de la recherche complète
  - `:` - Symbole du séparateur entre le nom du champ et la valeur du champ
- **Il est possible d'utiliser une recherche précise**
  - Le nom du champ et sa valeur peuvent être enveloppés dans des délimiteurs individuels
  - Exemple pour les deux précis : `%"local-currencies":"some-currency"`
  - Exemple de nom de champ précis : `%"local-currencies":some-currency`- Exemple de valeur de champ précise : `%local-currencies:"some-currency"`

- **Si votre terme de filtre contenait des espaces, remplacez-les par le symbole `-`**
  - Exemple : Vous souhaitez rechercher un champ appelé « Devises locales » qui contient « Dollars canadiens » comme valeur ; pour faire correspondre entièrement ce champ et cette valeur, tapez « %local-currencies:canadian-dollars »
- **Il est possible d'effectuer une recherche en texte intégral, en vérifiant tous les champs pour le texte souhaité en faisant ce qui suit : `%:canadian-dollars`**
- **Une liste de champs/types de champs avec lesquels la recherche complète ne fonctionne pas :**
  - Le champ de type `Break` (ce sont les gros titres présents tout au long du document)
  - Le type de champ `Tags` (celui-ci est recouvert d'un filtre de tags plus sophistiqué)
  - Le type de champ `Switch` (celui-ci ne contient aucune valeur de texte à filtrer et est partiellement couvert par l'option de recherche de commutateur)
  - Le champ `Nom` (celui-ci est le principal souci de la recherche et la recherche normale est bien plus avancée pour chercher via celui-ci)
  - Le champ `Appartient sous` (celui-ci est couvert par une recherche de chemin hiérarchique beaucoup plus avancée)