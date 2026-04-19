export default {
  title: 'Moniteur d\'actions',
  closeButton: 'Fermer',
  emptyState: 'Aucune action n\'a encore été enregistrée pendant cette session.',
  columns: {
    action: 'Action',
    startTime: 'Heure de début',
    finishTime: 'Heure de fin',
    payload: 'Charge utile',
    type: 'Type',
    status: 'Statut'
  },
  actionKind: {
    async: 'Async',
    sync: 'Sync'
  },
  status: {
    queued: 'En file',
    running: 'En cours',
    success: 'Succès',
    failed: 'Échec'
  },
  rowClickHint: 'Clic gauche sur une ligne d\'action pour copier les détails dans le presse-papiers.',
  payloadPresentAria: 'Cette action a une charge utile.',
  payloadEmptyAria: 'Aucune charge utile pour cette action.',
  copy: {
    success: 'Ligne d\'action copiée dans le presse-papiers.',
    failed: 'Impossible de copier la ligne d\'action dans le presse-papiers.'
  }
}
