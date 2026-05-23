export default {
  title: 'Fantasia Archive Paramètres',
  saveButton: 'Enregistrer les paramètres',
  closeButton: 'Fermer sans enregistrer',
  settingsSearchPlaceholder: 'Recherchez les paramètres...',
  searchNoResultsTitle: 'Aucune correspondance de recherche',
  searchNoResultsDescription: 'Fantasia n\'a malheureusement trouvé aucun paramètre que vous recherchiez. Essayez peut-être un terme de recherche différent ?',
  appOptionsCategories: {
    accessibility: {
      title: 'Accessibilité',
      tags: 'a11y, lisibilité, visibilité, assistance',
      accessibility: {
        subtitle: 'Accessibilité',
        tags: 'a11y, lisibilité, visibilité, assistance',
      }
    },
    developerSettings: {
      title: 'Paramètres du développeur',
      tags: 'développeur, débogage, diagnostics, interne',
      documentBody: {
        subtitle: 'Corps du document',
        tags: 'identifiant du document, métadonnées de débogage, champs internes',
      }
    },
    documentViewEdit: {
      title: 'Afficher/modifier un document',
      tags: 'page de document, mode d\'affichage, mode d\'édition, lecteur',
      documentBody: {
        subtitle: 'Corps du document',
        tags: 'zone de contenu, champs, lecture, zone d\'édition',
      },
      documentControlBar: {
        subtitle: 'Barre de contrôle des documents',
        tags: 'barre d\'outils, barre supérieure, en-tête, document chrome',
      }
    },
    hierarchicalTree: {
      title: 'Arbre hiérarchique',
      tags: 'barre latérale, plan, navigateur, arborescence du projet',
      iconSettings: {
        subtitle: 'Paramètres des icônes',
        tags: 'icônes d\'action, boutons d\'arborescence, icônes de ligne',
      },
      informationDisplaySettings: {
        subtitle: 'Paramètres d\'affichage des informations',
        tags: 'comptes, nombres, index d\'ordre, affichage des métadonnées',
      },
      tagSettings: {
        subtitle: 'Paramètres des balises',
        tags: 'étiquettes, affichage des balises, regroupement des balises',
      },
      treeBehavior: {
        subtitle: 'Comportement de l\'arbre',
        tags: 'développer, réduire, tout développer, interaction',
      },
      treeSettings: {
        subtitle: 'Paramètres de l\'arborescence',
        tags: 'panneau d\'arborescence, visibilité de la barre latérale, disposition de l\'arborescence',
      }
    },
    openedDocumentsTabs: {
      title: 'Ouvrir les onglets du document',
      tags: 'barre d\'onglets, fichiers ouverts, multitâche',
      tabBehavior: {
        subtitle: 'Comportement des onglets',
        tags: 'changer d\'onglet, bande d\'onglets, comportement de survol',
      }
    },
    popupsFloatingWindows: {
      title: 'Popups et fenêtres flottantes',
      tags: 'boîtes de dialogue, superpositions, modaux, fenêtres',
      floatingWindows: {
        subtitle: 'Fenêtres flottantes',
        tags: 'détacher, fenêtre secondaire, fenêtre multiple',
      },
      quickSearchDialog: {
        subtitle: 'Boîte de dialogue de recherche rapide',
        tags: 'recherche rapide, recherche au clavier, finder',
      },
      universalDialogSettings: {
        subtitle: 'Paramètres de dialogue universels',
        tags: 'toutes les boîtes de dialogue, comportement global des popups',
      }
    },
    visualAccessibility: {
      title: 'Visuels et fonctionnalités à l\'échelle de l\'application',
      tags: 'apparence, interface, global, ui, look and feel',
      applicationExtras: {
        subtitle: 'Suppléments d\'application',
        tags: 'mascotte, peluche, conseils de présentation du projet, extras',
      },
      visualsAppwideFunctionality: {
        subtitle: 'Visuels et fonctionnalités à l\'échelle de l\'application',
        tags: 'thème, chrome, mise en page, options générales',
      }
    },
    welcomeScreen: {
      title: 'Écran de bienvenue',
      tags: 'splash, écran de démarrage, bienvenue, premier lancement, accueil',
      welcomeScreenBehavior: {
        subtitle: 'Comportement de l\'écran de bienvenue',
        tags: 'conseils de démarrage, liens sociaux, intégration, splash',
      }
    }
  },
  appOptions: {
    aggressiveRelationshipFilter: {
      title: 'Sélection de relations agressives',
      description: 'Active le mode de suggestion automatique agressif pour toutes les recherches de relations dans l\'application en mode d\'édition de document. Sans cette option activée, après le filtrage, le premier élément de la liste n\'est pas automatiquement sélectionné. L\'activation de cette fonctionnalité ajoute cette fonctionnalité, permettant une sélection beaucoup plus pratique des documents existants tout en sacrifiant un peu de commodité lors de la création de nouveaux à la volée.',
      tags: 'suggestion automatique, saisie semi-automatique, première correspondance, liste de filtres, sélection existante, recherche de relations',
    },
    allowQuickPopupSameKeyClose: {
      title: 'Fermez les fenêtres contextuelles rapides avec la même clé',
      description: 'Permet de fermer les fenêtres contextuelles de recherche rapide et d\'ajout rapide avec la même combinaison de touches que celle utilisée pour les ouvrir.',
      tags: 'basculer le raccourci, même raccourci clavier, ajout rapide, fermer la fenêtre contextuelle',
    },
    allowWiderScrollbars: {
      title: 'Barres de défilement plus larges',
      description: 'Ce paramètre élargit les barres de défilement de FA et permet donc un défilement manuel par clic directement sur celles-ci pour les appareils qui ne prennent pas en charge le défilement standard (par exemple les souris sans molette de défilement).',
      tags: 'largeur de la barre de défilement, défilement par clic, souris sans molette, trackball, toucher',
    },
    compactDocumentCount: {
      title: 'Masquer le nombre de catégories',
      description: 'Affiche le nombre de documents sans le numéro secondaire par catégorie.',
      tags: 'comptage simplifié, numéro unique, moins d\'encombrement',
    },
    compactTags: {
      title: 'Balises compactes',
      description: 'Détermine si les balises sont affichées sous forme de catégories individuelles ou sous forme d\'une seule catégorie avec chaque balise comme sous-catégorie.',
      tags: 'regroupement de balises, dossier de balises unique, balises imbriquées, hiérarchie de balises',
    },
    darkMode: {
      title: 'Mode sombre',
      description: 'Basculez entre les modes clair et sombre pour l\'application.',
      tags: 'sombre, lumière, thème, thématisation, couleur, couleurs',
    },
    disableCloseAfterSelectQuickSearch: {
      title: 'Arrêter la fermeture après la sélection',
      description: 'Normalement, la recherche rapide se ferme une fois qu\'un élément y est sélectionné. L\'activation de cette fonctionnalité empêche ce comportement, vous permettant d\'ouvrir plusieurs résultats de recherche les uns après les autres.',
      tags: 'rester ouvert, résultats multiples, lot ouvert, recherche rapide reste ouverte',
    },
    disableDocumentControlBar: {
      title: 'Désactiver la barre de contrôle des documents',
      description: 'Si vous souhaitez maximiser votre espace de travail sur le document, vous pouvez désactiver la barre de boutons supérieure avec ce paramètre. Les boutons de contrôle nécessaires seront déplacés vers le haut du corps principal du document, tandis que le reste des fonctionnalités sera accessible via des raccourcis clavier ou via le menu de l\'application en haut à gauche.',
      tags: 'masquer la barre d\'outils, maximiser l\'espace, pleine largeur, en-tête du document',
    },
    disableDocumentControlBarGuides: {
      title: 'Désactiver les guides de documents',
      description: 'Active ou désactive les guides adaptés aux débutants sur la barre de contrôle des documents.',
      tags: 'conseils pour débutants, bannières de didacticiel, marques de coach, aide sur la barre de contrôle',
    },
    disableDocumentCounts: {
      title: 'Masquer entièrement le nombre de documents',
      description: 'Masque toutes les informations sur le nombre de documents dans l’arborescence hiérarchique.',
      tags: 'les totaux sont désactivés, aucun décompte, les statistiques sont masquées',
    },
    disableDocumentToolTips: {
      title: 'Désactiver les info-bulles du document',
      description: 'Si vous n\'aimez pas les info-bulles d\'affichage du document, vous pouvez les désactiver globalement ici.',
      tags: 'texte de survol, aide sur les champs, popover, conseils d\'affichage du document',
    },
    disableQuickSearchCategoryPrecheck: {
      title: 'Ne pas pré-vérifier le filtre de catégorie',
      description: 'Normalement, les catégories sont incluses dans la recherche rapide. L\'activation de cette option inverse ce comportement.',
      tags: 'filtre de catégorie, étendue de recherche, inclure des catégories, filtre par défaut',
    },
    disableSpellCheck: {
      title: 'Désactiver la vérification orthographique',
      description: 'Désactive la vérification orthographique, grammaticale et des mots en mode édition de document.',
      tags: 'orthographe, grammaire, vérification, soulignement rouge, écriture, dictionnaire',
      note: 'Nécessite un redémarrage complet de l\'application pour prendre effet !',
    },
    doNotCollapseTreeOptions: {
      title: 'Empêcher l\'effondrement des sous-niveaux dans l\'arborescence',
      description: 'Empêche la fermeture des sous-catégories de l\'arborescence hiérarchique lorsqu\'une catégorie parent est fermée.',
      tags: 'rappelez-vous les enfants développés, imbriqués ouverts, accordéon, réduits',
    },
    doubleDashDocCount: {
      title: 'Diviseur de comptage prononcé',
      description: 'Ce paramètre ajoute un autre caractère \\\\| entre la catégorie et le nombre de documents dans l\'arborescence hiérarchique.',
      tags: 'canal, délimiteur, séparateur, format de comptage, nombre d\'arbres',
    },
    hideAdvSearchCheatsheetButton: {
      title: 'Masquer le bouton d\'aide sur les relations',
      description: 'Masque le bouton d’aide de l’aide-mémoire de recherche avancée dans les champs de type de relation.',
      tags: 'champ de relation, aide-mémoire, icône d\'aide, sélecteur de lien, recherche avancée',
    },
    hideDeadCrossThrough: {
      title: 'Masquer le barré',
      description: 'Ce paramètre masque l\'effet barré sur les documents morts, disparus ou détruits afin d\'augmenter la visibilité.',
      tags: 'barré, décédé, détruit, disparu, statut du document, barré',
    },
    hideDocumentTitles: {
      title: 'Masquer les titres des documents',
      description: 'Masque les grands titres de section dans la vue du document. Veuillez noter que cela peut entraîner des changements de mise en page relativement sauvages, ce qui peut donner au document un aspect indiscipliné dans certains cas.',
      tags: 'titres de section, groupes de champs, étiquettes de structure de document',
    },
    hideEmptyFields: {
      title: 'Masquer les champs vides',
      description: 'Masque les champs sans aucune valeur renseignée, en mode affichage (non-édition). Veuillez noter que cela peut entraîner des changements de mise en page relativement sauvages, ce qui peut donner au document un aspect indiscipliné dans certains cas.',
      tags: 'champs vides, vue en lecture seule, document compact, changement de mise en page',
    },
    hideHierarchyTree: {
      title: 'Masquer l\'arborescence hiérarchique',
      description: 'Contrôle si l\'arborescence hiérarchique est affichée.',
      tags: 'barre latérale désactivée, navigateur masqué, panneau d\'arborescence, contour masqué',
    },
    hidePlushes: {
      title: 'Masquer la mascotte Fantasia',
      description: 'Cache la Fantasia incroyablement adorable et impressionnante, le petit dragon arcanique. Comment as-tu pu ! :(',
      tags: 'dragon, mascotte, peluche, personnage, décoration, œuf de Pâques',
    },
    hideTooltipsProject: {
      title: 'Masquer les conseils sur l\'aperçu du projet',
      description: 'Masque la carte d’informations sur les trucs et astuces de présentation du projet.',
      tags: 'accueil du projet, carte de tableau de bord, conseils de présentation',
    },
    hideTooltipsStart: {
      title: 'Masquer la fenêtre contextuelle des conseils sur l\'écran de démarrage',
      description: 'Masque la fenêtre contextuelle des trucs et astuces de l’écran de démarrage.',
      tags: 'premier lancement, intégration, splash, conseils de démarrage, astuces',
    },
    hideTreeExtraIcons: {
      title: 'Masquer les icônes supplémentaires',
      description: 'Masque les icônes qui sont normalement affichées pour plus de commodité mais n\'ajoutent pas de fonctionnalités, par exemple l\'icône « Ouvrir le document » à côté d\'un document sans nœuds enfants, qui peut tout aussi bien être ouverte avec un clic gauche normal au lieu de l\'icône.',
      tags: 'icônes redondantes, encombrement, arborescence minimale, actions facultatives',
    },
    hideTreeIconAddUnder: {
      title: 'Masquer l\'icône "Ajouter sous"',
      description: 'Cette option masque l\'icône "Ajouter un nouveau document sous le parent sélectionné".',
      tags: 'ajouter un enfant, nouveau sous, plus sous, créer ci-dessous',
    },
    hideTreeIconEdit: {
      title: 'Masquer l\'icône "Modifier"',
      description: 'Cette option masque l\'icône Modifier la ligne.',
      tags: 'icône de crayon, ligne d\'édition, arbre d\'édition rapide',
    },
    hideTreeIconView: {
      title: 'Masquer l\'icône "Ouvrir"',
      description: 'Cette option masque l\'icône Ouvrir la ligne.',
      tags: 'ouvrir l\'icône, accéder au document, bouton d\'ouverture de ligne',
    },
    hideTreeOrderNumbers: {
      title: 'Masquer les numéros de commande',
      description: 'Masque les numéros de commande personnalisés à gauche des noms.',
      tags: 'index de séquence, ordre manuel, préfixe de rang, gouttière gauche',
    },
    hideRecentProjectTooltip: {
      title: 'Masquer l\'info-bulle « Parcourir les derniers projets »',
      description: 'Masque l’info-bulle sur le curseur Parcourir les derniers projets à côté de Reprendre le dernier projet sur l’écran d’accueil.',
      tags: 'projet, charger, chargement, le plus récent, récent, intro, début, bienvenue, info-bulle, pop-up, info-bulles, pop up',
    },
    hideWelcomeScreenSocials: {
      title: 'Masquer les liens sociaux de l’écran d’accueil',
      description: 'Masque tous les liens sociaux sur l’écran de bienvenue.',
      tags: 'discorde, twitter, liens communautaires, réseaux sociaux, bienvenue',
    },
    skipWelcomeScreen: {
      title: 'Passer l\'écran de bienvenue',
      description: 'Ignore l\'écran d\'accueil et tente de charger le dernier projet directement lors du lancement de l\'application.',
      tags: 'projet, charger, chargement, dernier, récent, intro, début, bienvenue',
    },
    invertCategoryPosition: {
      title: 'Inverser la position de la catégorie',
      description: 'Change les positions des numéros de catégorie et de document.',
      tags: 'échanger des numéros, ordre de comptage, catégorie par rapport au nombre de documents',
    },
    invertTreeSorting: {
      title: 'Inverser le tri personnalisé de l\'arborescence',
      description: 'Trie les documents dans l\'arborescence hiérarchique dans le sens opposé à celui par défaut : du plus élevé au plus bas.',
      tags: 'ordre inverse, ordre personnalisé, sens de tri, ascendant et décroissant',
    },
    limitEditorHeight: {
      title: 'Limiter la hauteur de l\'éditeur de texte',
      description: 'Détermine si l\'éditeur de texte a une hauteur limitée lorsqu\'il n\'est pas en mode plein écran.',
      tags: 'hauteur de la zone de texte, texte long, éditeur d\'extension, éditeur de défilement',
    },
    noProjectName: {
      title: 'Masquer le nom du projet dans l\'arborescence',
      description: 'Détermine si le nom du projet est affiché dans l\'arborescence hiérarchique.',
      tags: 'étiquette racine, arborescence des titres du projet, masquage de l\'en-tête',
    },
    noTags: {
      title: 'Masquer les balises dans l\'arborescence',
      description: 'Détermine si les balises sont affichées dans l\'arborescence hiérarchique.',
      tags: 'étiquettes désactivées, bande de balises, étiquettes d\'arbres, masquer les étiquettes',
    },
    preventAutoScroll: {
      title: 'Empêcher le défilement automatique',
      description: 'Détermine si les documents rappellent leurs positions de défilement et effectuent un défilement automatique lors du basculement entre elles.',
      tags: 'position de défilement, rappelez-vous le défilement, saut vers le haut, commutateur d\'onglet',
    },
    preventFilledNoteBoardPopup: {
      title: 'Empêcher l\'affichage du bloc-notes rempli',
      description: 'Lorsqu\'il est activé, le bloc-notes ne s\'ouvrira pas automatiquement au démarrage de l\'application s\'il contient encore des notes des sessions FA précédentes.',
      tags: 'notes autocollantes, bloc-notes, démarrage, ouverture automatique, rappels',
    },
    preventPreviewsDocuments: {
      title: 'Empêcher les aperçus de documents',
      description: 'Contrôle si les aperçus rapides au survol sont affichés dans la vue du document et dans les champs de relation.',
      tags: 'carte de survol, aperçu, popup relationnel, aperçu en ligne',
    },
    preventPreviewsPopups: {
      title: 'Empêcher les aperçus de documents dans les boîtes de dialogue',
      description: 'Contrôle si les aperçus rapides au survol sont affichés lors de la sélection de documents dans les boîtes de dialogue (par exemple, le sélecteur de documents existants).',
      tags: 'boîte de dialogue de document existant, survol du sélecteur, sélecteur de document, aperçu modal',
    },
    preventPreviewsTabs: {
      title: 'Empêcher les aperçus de documents sur les onglets',
      description: 'Contrôle si les aperçus rapides au survol sont affichés sur les onglets du document dans la barre d\'onglets.',
      tags: 'survol des onglets, aperçu de la bande d\'onglets, aperçu de la barre de titre',
    },
    preventPreviewsTree: {
      title: 'Empêcher les aperçus de documents au survol',
      description: 'Contrôle si les aperçus rapides au survol sont affichés dans l\'arborescence hiérarchique. Lorsque les aperçus au survol restent activés, ils peuvent avoir un impact majeur sur les performances de l\'application.',
      tags: 'survol de l\'arbre, décalage, lent, fps, performances, aperçu de la barre latérale',
      note: 'Peut avoir un impact majeur sur les performances de l’application !',
    },
    showDocumentID: {
      title: 'Afficher les identifiants des documents',
      description: 'Si cette option est activée, le corps du document affichera également la valeur de l\'ID interne du document.',
      tags: 'débogage, identifiant interne, identifiant, outils de développement, dépannage',
    },
    tagsAtTop: {
      title: 'Balises principales dans l\'arborescence',
      description: 'Affiche les balises en haut de l\'arborescence hiérarchique.',
      tags: 'ordre des balises, balises en premier, catégories ci-dessus',
    },
    textShadow: {
      title: 'Ombre du texte',
      description: 'Ce paramètre fait basculer les ombres du texte dans l\'arborescence hiérarchique, les fenêtres contextuelles de recherche de relations et les onglets, permettant ainsi une apparence plus visible du texte sur l\'arrière-plan.',
      tags: 'contraste, lisibilité, ombre, contour, lisibilité, clarté du texte',
    }
  }
}
