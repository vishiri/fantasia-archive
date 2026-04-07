
# Guide de recherche avancée

---

## Introduction

Fantasia Archive est livré avec un moteur de recherche assez avancé présent dans la plupart des champs de recherche qui parcourent soit tous, soit au moins un type de document - ce sont par exemple les champs de relations multiples et simples sur chaque page de document et la popup de recherche rapide.

---

## Correspondance et tri de recherche intelligents

La recherche elle-même fonctionne de la manière suivante : Vous pouvez rechercher n'importe quelle quantité de mots et le logiciel les traitera individuellement tant qu'ils sont séparés par un espace.

### La recherche suit ces règles

- **La recherche est insensible à la casse, ce qui signifie que vous pouvez tout taper en MAJUSCULES ou minuscules (ou de toute AuTrE mAnIèRe), cela n'aura pas d'importance**
- **Les mots peuvent être dans n'importe quel ordre**
  - Exemple : `Château sombre effrayant` sera trouvé même si vous tapez `effrayant château sombre`
- **Même des parties de mots donneront une recherche réussie**
  - Exemple : `Château sombre effrayant` sera trouvé même si vous tapez `som âte ayant`
- **Les documents seront triés par priorité selon les règles suivantes :**
  1. **La correspondance directe a la priorité sur tout le reste**
      - Exemple : `Château sombre effrayant` est une correspondance directe pour une recherche contenant `château sombre effrayant`
  2. **La correspondance de mot complet a la priorité sur les fragments**
      - Chaque mot entièrement correspondant compte individuellement ; plus le document a de correspondances complètes, plus il sera haut dans la liste
      - Exemple : `Château sombre effrayant` a 2 correspondances de mots complets de `château sombre âte`
  3. **Les fragments sont en bas de la liste**
      - Chaque fragment correspondant compte individuellement ; plus le document a de fragments, plus il sera haut dans la liste
      - Exemple : `Château sombre effrayant` a 2 correspondances de fragments de `som âte`
- **Il est possible d'inclure les `Autres noms` dans la recherche également, en préfixant `@` devant la chaîne de recherche**
  - Exemple : `@Repaire de vampire` (si votre `Château sombre effrayant` avait un autre nom rempli comme `Repaire de vampire`, la recherche le trouvera de cette façon)

---

## Filtrage

En plus de la fonctionnalité de recherche avancée, Fantasia Archive offre également un filtrage instantané via plusieurs attributs pour affiner davantage les résultats de recherche.

- **NOTE : Toutes les valeurs de filtre suivantes (y compris le filtrage de recherche complète dans la section suivante) prennent en charge la correspondance de n'importe quelle partie du texte de recherche avec n'importe quelle partie du terme de recherche**
  - Exemple : `>nada` correspondra avec `Continent > Amérique du Nord > Canada > Toronto`

### Le filtrage fonctionne de la manière suivante et suit ces règles :

- **Aucun des termes de filtre suivants N'ENTRERA EN CONFLIT avec la recherche de mots normale ; vous pouvez donc les utiliser ensemble**
- **Il est possible d'utiliser une seule instance de filtre de chacun des types de filtres suivants à la fois ; cependant, chaque type de filtre individuel peut également être présent en même temps**
- **Le filtre est insensible à la casse, ce qui signifie que vous pouvez tout taper en MAJUSCULES ou minuscules, cela n'aura pas d'importance**
- **Si votre terme de filtre contenait des espaces, remplacez-les par le symbole `-`**
  - Exemple : Vous souhaitez rechercher une étiquette appelée `Personnages Joueurs`, pour correspondre entièrement à cette étiquette, vous devrez taper `#personnages-joueurs`
- **Le filtre de chemin hiérarchique supprime automatiquement tous les symboles `>` dans le chemin, ce qui entraîne leur omission de la chaîne de filtre**
  - Exemple : Vous souhaitez rechercher un chemin hiérarchique contenant le suivant `France > Île-de-France > Paris`, pour correspondre entièrement à ce chemin hiérarchique, vous devrez taper `>france-île-de-france-paris`
- **Les termes de filtre suivants peuvent être utilisés**
  - `$` - Symbole pour la recherche de type de document
  - `#` - Symbole pour la recherche d'étiquette
  - `>` - Symbole pour la recherche de chemin hiérarchique
  - `^` - Symbole pour la recherche d'interrupteur conditionnel (types et valeurs spécifiques ci-dessous)
    - `^c` - Affiche uniquement les documents avec `Est une catégorie` coché
    - `^d` - Affiche uniquement les documents avec `Est Mort/Parti/Détruit` coché
    - `^f` - Affiche uniquement les documents avec `Est terminé` coché
    - `^m` - Affiche uniquement les documents avec `Est un document mineur` coché qui sont normalement invisibles et filtrés

## Filtrage de recherche complète

Cette fonctionnalité est principalement destinée à ceux qui ont besoin d'une recherche à grande échelle qui peut parcourir n'importe quel champ dans n'importe quel document pour correspondre à n'importe quel champ de valeur presque n'importe où. Le filtrage de recherche complète permet à l'utilisateur de réduire marginalement la recherche en fouillant dans toute la base de données de documents et en identifiant exactement ce qui est nécessaire.

### Quelques mots de prudence

**La recherche complète est un outil très puissant, mais aussi exigeant - plus votre projet grandira, plus il deviendra exigeant. Cela signifie que si vous avez par exemple plus de 2000 documents dans votre projet et que l'algorithme de recherche devra parcourir tous ces documents, alors la recherche complète pourrait prendre quelques secondes pour recharger vos résultats de recherche - veuillez garder cela à l'esprit lors de l'utilisation de cette fonctionnalité : Cela peut potentiellement être BEAUCOUP de données.**

### Le filtrage fonctionne de la manière suivante et suit ces règles

- **La recherche complète peut être utilisée en combinaison avec n'importe quel autre filtre et/ou termes de recherche normaux**
- **Il est possible d'avoir une seule instance de la recherche complète présente dans la recherche à la fois**
- **Le filtre est insensible à la casse, ce qui signifie que vous pouvez tout taper en MAJUSCULES ou minuscules, cela n'aura pas d'importance**
- **Dans le cas de listes et de relations multiples, toutes les valeurs saisies sont converties en une grande ligne de texte pour la recherche**
  - Exemple avec un champ appelé `Devises locales` :
    - Valeurs originales : `Dollar Canadien` `Dollar Américain` `Euro` `Darsek Klingon`
    - Valeurs converties : `dollar-canadien-dollar-américain-euro-darsek-klingon`
- **Les termes de filtre suivants doivent être utilisés à l'intérieur du terme de recherche**
  - `%` - Symbole pour le début de la recherche complète
  - `:` - Symbole pour la division entre le nom du champ et la valeur du champ
- **Il est possible d'utiliser une recherche précise**
  - Le nom du champ et sa valeur peuvent être enveloppés à l'intérieur de limiteurs individuels
  - Exemple pour les deux précis : `%"devises-locales":"une-devise"`
  - Exemple pour nom de champ précis : `%"devises-locales":une-devise`
  - Exemple pour valeur de champ précise : `%devises-locales:"une-devise"`

- **Si votre terme de filtre contenait des espaces, remplacez-les par le symbole `-`**
  - Exemple : Vous souhaitez rechercher un champ appelé `Devises Locales` qui contient `Dollars Canadiens` comme valeur, pour correspondre entièrement à cette étiquette, vous devrez taper `%devises-locales:dollars-canadiens`
- **Il est possible de faire une recherche en texte intégral, en vérifiant tous les champs pour le texte souhaité en procédant comme suit : `%:dollars-canadiens`**
- **Une liste de champs/types de champs avec lesquels la recherche complète ne fonctionne pas :**
  - Le type de champ `Break` (ce sont les grands titres présents tout au long du document)
  - Le type de champ `Tags` (celui-ci est couvert par un filtre d'étiquettes plus sophistiqué)
  - Le type de champ `Switch` (celui-ci ne contient aucune valeur de texte à filtrer et est partiellement couvert par l'option de recherche d'interrupteur)
  - Le champ `Name` (celui-ci est la principale préoccupation de la recherche et la recherche normale est beaucoup plus avancée pour rechercher dans celui-ci)
  - Le champ `Appartient à` (celui-ci est couvert par une recherche de chemin hiérarchique beaucoup plus avancée)
