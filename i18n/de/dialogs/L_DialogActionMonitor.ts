export default {
  title: 'Aktionsmonitor',
  closeButton: 'Schließen',
  emptyState: 'In dieser Sitzung wurden noch keine Aktionen aufgezeichnet.',
  columns: {
    action: 'Aktion',
    timestamp: 'Zeit',
    status: 'Status'
  },
  status: {
    queued: 'Wartend',
    running: 'Läuft',
    success: 'Erfolg',
    failed: 'Fehlgeschlagen'
  },
  payloadTooltipNone: 'Keine Nutzlast',
  payloadTooltipPrefix: 'Nutzlast:',
  rowClickHint: 'Klicke auf eine Zeile, um ihr JSON in die Zwischenablage zu kopieren.',
  copy: {
    success: 'Aktionszeile in die Zwischenablage kopiert.',
    failed: 'Aktionszeile konnte nicht in die Zwischenablage kopiert werden.'
  }
}
