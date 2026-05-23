export default {
  title: 'Aktionsmonitor',
  closeButton: 'Schließen',
  emptyState: 'Während dieser Sitzung wurden noch keine Aktionen aufgezeichnet.',
  columns: {
    action: 'Aktion',
    startTime: 'Startzeit',
    finishTime: 'Endzeit',
    payload: 'Nutzlast',
    type: 'Typ',
    status: 'Status',
  },
  actionKind: {
    async: 'Asynchron',
    sync: 'Synchronisieren',
  },
  status: {
    queued: 'In der Warteschlange',
    running: 'Läuft',
    success: 'Erfolg',
    failed: 'Fehlgeschlagen',
  },
  rowClickHint: 'Klicken Sie mit der linken Maustaste auf eine Aktionszeile, um Details in die Zwischenablage zu kopieren.',
  payloadPresentAria: 'Diese Aktion hat eine Nutzlast.',
  payloadEmptyAria: 'Keine Nutzlast für diese Aktion.',
  copy: {
    success: 'Aktionszeile in die Zwischenablage kopiert',
    successCaption: 'Aktivität kopiert – {actionId}',
    failed: 'Die Aktionszeile konnte nicht in die Zwischenablage kopiert werden.',
  }
}
