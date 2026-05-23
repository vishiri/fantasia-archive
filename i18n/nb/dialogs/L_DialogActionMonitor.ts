export default {
  title: 'Handlingsmonitor',
  closeButton: 'Lukke',
  emptyState: 'Ingen handlinger er registrert ennå under denne økten.',
  columns: {
    action: 'Handling',
    startTime: 'Starttid',
    finishTime: 'Slutttid',
    payload: 'Nyttelast',
    type: 'Type',
    status: 'Status',
  },
  actionKind: {
    async: 'Asynkron',
    sync: 'Synkroniser',
  },
  status: {
    queued: 'I kø',
    running: 'Løper',
    success: 'Suksess',
    failed: 'Mislyktes',
  },
  rowClickHint: 'Venstreklikk på en handlingsrad for å kopiere detaljer til utklippstavlen.',
  payloadPresentAria: 'Denne handlingen har en nyttelast.',
  payloadEmptyAria: 'Ingen nyttelast for denne handlingen.',
  copy: {
    success: 'Handlingsrad kopiert til utklippstavlen',
    successCaption: 'Aktivitet kopiert - {actionId}',
    failed: 'Kunne ikke kopiere handlingsraden til utklippstavlen.',
  }
}
