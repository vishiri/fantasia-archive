export default {
  title: 'Moniteur d\'actions',
  closeButton: 'Fermer',
  emptyState: 'Aucune action n\'a encore été enregistrée pendant cette session.',
  columns: {
    action: 'Action',
    timestamp: 'Heure',
    status: 'État'
  },
  status: {
    queued: 'En file',
    running: 'En cours',
    success: 'Succès',
    failed: 'Échec'
  },
  payloadTooltipNone: 'Aucune charge utile',
  payloadTooltipPrefix: 'Charge utile :',
  rowClickHint: 'Cliquez sur une ligne pour copier son JSON dans le presse-papiers.',
  copy: {
    success: 'Ligne d\'action copiée dans le presse-papiers.',
    failed: 'Impossible de copier la ligne d\'action dans le presse-papiers.'
  }
}
