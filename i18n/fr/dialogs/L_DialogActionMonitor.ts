export default {
  title: 'Moniteur d\'actions',
  closeButton: 'Fermer',
  emptyState: 'Aucune action n\'a encore été enregistrée au cours de cette session.',
  columns: {
    action: 'Action',
    startTime: 'Heure de début',
    finishTime: 'Heure de fin',
    payload: 'Charge utile',
    type: 'Taper',
    status: 'Statut',
  },
  actionKind: {
    async: 'Asynchrone',
    sync: 'Synchroniser',
  },
  status: {
    queued: 'En file d\'attente',
    running: 'En cours d\'exécution',
    success: 'Succès',
    failed: 'Échoué',
  },
  rowClickHint: 'Cliquez avec le bouton gauche sur une ligne d\'action pour copier les détails dans le presse-papiers.',
  payloadPresentAria: 'Cette action a une charge utile.',
  payloadEmptyAria: 'Aucune charge utile pour cette action.',
  copy: {
    success: 'Ligne d\'action copiée dans le presse-papiers',
    successCaption: 'Activité copiée - {actionId}',
    failed: 'Impossible de copier la ligne d\'action dans le presse-papiers.',
  }
}
