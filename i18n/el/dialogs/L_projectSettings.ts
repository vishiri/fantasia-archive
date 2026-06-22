export default {
  title: 'Ρυθμίσεις έργου',
  closeButton: 'Κλείσιμο χωρίς αποθήκευση',
  saveButton: 'Αποθήκευση ρυθμίσεων',
  saveErrors: {
    tooltipIntro: 'Δεν είναι δυνατή η αποθήκευση. Βρέθηκαν τα ακόλουθα σφάλματα:',
    bulletWorldNameRequired: 'Το όνομα κόσμου απαιτείται για «{worldLabel}».',
    bulletDuplicatePalette: 'Βρέθηκαν διπλότυπα χρώματα στην παλέτα του «{worldLabel}».',
    bulletDocumentTemplateNameRequired: 'Το όνομα προτύπου εγγράφου απαιτείται για «{templateLabel}».',
    bulletWorldTemplateGroupNameRequired: 'Το όνομα ομάδας προτύπων απαιτείται για «{worldLabel}».',
    bulletWorldTemplateDuplicateDocumentTemplate: 'Διπλότυπο πρότυπο εγγράφου «{templateLabel}» στον «{worldLabel}».'
  },
  categories: {
    generalSettings: {
      title: 'Γενικές ρυθμίσεις'
    },
    worldsSettings: {
      title: 'Κόσμοι'
    },
    documentTemplatesSettings: {
      title: 'Πρότυπα εγγράφων'
    }
  },
  fields: {
    projectName: {
      title: 'Όνομα έργου',
      label: 'Όνομα έργου',
      errorRequired: 'Το όνομα έργου απαιτείται.'
    },
    worldName: {
      title: 'Όνομα κόσμου',
      label: 'Όνομα κόσμου',
      errorRequired: 'Το όνομα κόσμου απαιτείται.'
    },
    worldColor: {
      title: 'Χρώμα',
      label: 'Χρώμα κόσμου',
      tooltip: 'Αυτό το χρώμα καθορίζει πώς εμφανίζεται ο κόσμος σας σε διάφορα σημεία του έργου — εικονίδια, κείμενο και παρόμοια διεπαφή.'
    },
    worldColorPalette: {
      label: 'Παλέτα χρωμάτων κόσμου',
      tooltipIntro: 'Η παλέτα χρωμάτων σάς επιτρέπει να ορίσετε εκ των προτέρων χρώματα που θα χρησιμοποιούνται αργότερα σε όλο το έργο χωρίς να τα επιλέγετε χειροκίνητα κάθε φορά. Αυτό επιτρέπει συνέπεια μεταξύ εγγράφων όταν απαιτείται.',
      tooltipRightClickIntro: 'Περισσότερες ενέργειες είναι διαθέσιμες με δεξί κλικ σε μεμονωμένα χρώματα:',
      tooltipRightClickDeletion: 'Διαγραφή',
      tooltipRightClickDuplication: 'Αντιγραφή',
      addButton: 'Προσθήκη χρώματος',
      contextMenu: {
        duplicateColor: 'Αντιγραφή χρώματος',
        deleteColor: 'Διαγραφή χρώματος'
      }
    },
    worldTemplateLayout: {
      layoutTitle: 'Ιεραρχικό δέντρο κόσμου',
      availableTemplatesTitle: 'Διαθέσιμα πρότυπα εγγράφων',
      availableTemplatesFilterAriaLabel: 'Φιλτράρισμα διαθέσιμων προτύπων εγγράφων',
      availableTemplatesFilterClearAriaLabel: 'Εκκαθάριση φίλτρου διαθέσιμων προτύπων εγγράφων',
      availableTemplatesFilterPlaceholder: 'Αναζήτηση...',
      emptyFilteredAvailableTemplates: 'Κανένα πρότυπο εγγράφου δεν ταιριάζει με την αναζήτησή σας.',
      addGroupButton: 'Προσθήκη ομάδας',
      defaultNewGroupName: 'Νέα ομάδα',
      editGroupTooltip: 'Μετονομασία ομάδας',
      editTemplateTooltip: 'Προσαρμογή ψευδωνύμου προτύπου',
      emptyAvailableTemplates: 'Όλα τα πρότυπα εγγράφων έχουν ανατεθεί σε αυτόν τον κόσμο.',
      groupNameErrorRequired: 'Το όνομα ομάδας απαιτείται.',
      groupRenameInputLabel: 'Όνομα της ομάδας',
      placementNicknameHoverOriginalNameLabel: 'Αρχικό όνομα',
      placementNicknameHoverNicknameLabel: 'Ψευδώνυμο',
      removeGroupTooltip: 'Αφαίρεση ομάδας',
      removeTemplateTooltip: 'Αφαίρεση προτύπου εγγράφου',
      templateCanonicalNameLabel: 'Όνομα προτύπου εγγράφου',
      templateCanonicalNameTooltip: 'Για να μετονομάσετε ολόκληρο ένα πρότυπο εγγράφου, μεταβείτε στην ενότητα «Πρότυπα εγγράφων» αυτού του διαλόγου επεξεργασίας και προσαρμόστε το εκεί.',
      templateNicknameLabel: 'Ψευδώνυμο μέσα σε αυτόν τον κόσμο',
      templateNicknameTooltip: 'Ένα ψευδώνυμο σάς επιτρέπει να μετονομάσετε γρήγορα ένα πρότυπο εγγράφου μέσα σε έναν συγκεκριμένο κόσμο χωρίς να αλλάξετε το πραγματικό του όνομα σε όλο το έργο.',
      contextMenu: {
        renameGroup: 'Μετονομασία ομάδας',
        deleteGroup: 'Διαγραφή ομάδας'
      },
      renameDialog: {
        title: 'Μετονομασία ομάδας',
        confirmButton: 'Μετονομασία'
      }
    },
    documentTemplateName: {
      title: 'Όνομα προτύπου εγγράφου',
      label: 'Όνομα προτύπου εγγράφου',
      errorRequired: 'Απαιτείται τουλάχιστον μία μετάφραση τίτλου προτύπου εγγράφου.'
    },
    documentTemplateWorldAppendix: {
      title: 'Προσάρτημα κόσμου',
      label: 'Προσάρτημα κόσμου',
      tooltip: 'Το προσάρτημα κόσμου είναι μια σύντομη, μοναδική περιγραφή για το πρότυπο εγγράφου σας όταν συνδέεται με μεμονωμένους κόσμους. Αποτρέπει σύγχυση όταν πολλά πρότυπα εγγράφων μοιράζονται το ίδιο όνομα μεταξύ κόσμων. Το προσάρτημα σάς βοηθά να τα ξεχωρίζετε με μια ματιά. Αυτό το πεδίο εμφανίζεται μόνο στην καρτέλα κόσμου κατά τη σύζευξη προτύπων με κόσμους, πουθενά αλλού.'
    },
    documentTemplateIcon: {
      title: 'Εικονίδιο',
      label: 'Εικονίδιο'
    }
  },
  panels: {
    worlds: {
      title: 'Κόσμοι του έργου',
      addWorldButton: 'Προσθήκη κόσμου',
      defaultNewWorldName: 'Νέος κόσμος',
      deleteWorldButton: 'Διαγραφή κόσμου',
      emptyFilteredWorlds: 'Κανένας κόσμος δεν ταιριάζει με την αναζήτησή σας.',
      filterAriaLabel: 'Φιλτράρισμα κόσμων',
      filterClearAriaLabel: 'Εκκαθάριση φίλτρου κόσμων',
      filterPlaceholder: 'Αναζήτηση...',
      deleteConfirm: {
        confirmDeleteButton: 'Επιβεβαίωση διαγραφής',
        message: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτόν τον κόσμο; Τα έγγραφα και οι ρυθμίσεις που συνδέονται με αυτόν δεν μπορούν να ανακτηθούν μετά. Θα χαθούν για πάντα.'
      },
      removeDisabledHasDocuments: 'Αφαιρέστε τα έγγραφα από αυτόν τον κόσμο πριν τον διαγράψετε.',
      removeDisabledLastWorld: 'Ένα έργο πρέπει να έχει πάντα τουλάχιστον έναν κόσμο. Δημιουργήστε πρώτα άλλον για να διαγράψετε αυτόν.'
    },
    documentTemplates: {
      title: 'Πρότυπα εγγράφων',
      addFirstTemplateButton: 'Προσθέστε το πρώτο σας πρότυπο',
      addTemplateButton: 'Προσθήκη προτύπου εγγράφου',
      defaultNewTemplateName: 'Νέο πρότυπο εγγράφου',
      deleteTemplateButton: 'Διαγραφή προτύπου',
      emptyFilteredTemplates: 'Κανένα πρότυπο εγγράφου δεν ταιριάζει με την αναζήτησή σας.',
      filterAriaLabel: 'Φιλτράρισμα προτύπων εγγράφων',
      filterClearAriaLabel: 'Εκκαθάριση φίλτρου προτύπων εγγράφων',
      filterPlaceholder: 'Αναζήτηση...',
      missingTranslationsTabTooltip: 'Μερικές από τις μεταφράσεις για την επιλεγμένη γλώσσα λείπουν από αυτό το πρότυπο εγγράφου.',
      deleteConfirm: {
        confirmDeleteButton: 'Επιβεβαίωση διαγραφής',
        message: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το πρότυπο εγγράφου; Όλα τα πεδία που συνδέονται με αυτό το πρότυπο σε άλλα πρότυπα θα σταματήσουν να λειτουργούν. Επίσης, όλα τα συνδεδεμένα έγγραφα θα σταματήσουν να εμφανίζουν τα δεδομένα τους αν κάποια συμπληρώθηκαν με αυτό το πρότυπο. Αυτή η διαγραφή μπορεί να έχει ανεπιθύμητες παρενέργειες.'
      },
      removeDisabledHasDocuments: 'Αφαιρέστε τα έγγραφα που χρησιμοποιούν αυτό το πρότυπο πριν το διαγράψετε.'
    }
  }
}
