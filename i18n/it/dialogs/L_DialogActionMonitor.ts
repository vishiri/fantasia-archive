export default {
  title: 'Monitoraggio dell\'azione',
  closeButton: 'Vicino',
  emptyState: 'Nessuna azione è stata ancora registrata durante questa sessione.',
  columns: {
    action: 'Azione',
    startTime: 'Ora di inizio',
    finishTime: 'Orario di fine',
    payload: 'Carico utile',
    type: 'Tipo',
    status: 'Stato',
  },
  actionKind: {
    async: 'Asincrono',
    sync: 'Sincronizzazione',
  },
  status: {
    queued: 'In coda',
    running: 'Corsa',
    success: 'Successo',
    failed: 'Fallito',
  },
  rowClickHint: 'Fare clic con il pulsante sinistro del mouse su una riga di azioni per copiare i dettagli negli appunti.',
  payloadPresentAria: 'Questa azione ha un carico utile.',
  payloadEmptyAria: 'Nessun carico utile per questa azione.',
  copy: {
    success: 'Riga di azioni copiata negli appunti',
    successCaption: 'Attività copiata - {actionId}',
    failed: 'Impossibile copiare la riga dell\'azione negli appunti.',
  }
}
