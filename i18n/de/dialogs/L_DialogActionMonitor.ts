export default {
  title: 'Aktionsmonitor',
  closeButton: 'Schließen',
  emptyState: 'In dieser Sitzung wurden noch keine Aktionen aufgezeichnet.',
  columns: {
    action: 'Aktion',
    startTime: 'Startzeit',
    finishTime: 'Endzeit',
    payload: 'Nutzlast',
    type: 'Typ',
    status: 'Status'
  },
  actionKind: {
    async: 'Async',
    sync: 'Sync'
  },
  status: {
    queued: 'Wartend',
    running: 'Läuft',
    success: 'Erfolg',
    failed: 'Fehlgeschlagen'
  },
  rowClickHint: 'Linksklick auf eine Aktionszeile, um die Details in die Zwischenablage zu kopieren.',
  payloadPresentAria: 'Diese Aktion hat eine Nutzlast.',
  payloadEmptyAria: 'Keine Nutzlast für diese Aktion.',
  copy: {
    success: 'Aktionszeile in die Zwischenablage kopiert.',
    failed: 'Aktionszeile konnte nicht in die Zwischenablage kopiert werden.'
  }
}
