export default {
  title: 'Action Monitor',
  closeButton: 'Nära',
  emptyState: 'Inga åtgärder har registrerats ännu under denna session.',
  columns: {
    action: 'Handling',
    startTime: 'Starttid',
    finishTime: 'Sluttid',
    payload: 'Nyttolast',
    type: 'Typ',
    status: 'Status',
  },
  actionKind: {
    async: 'Asynkron',
    sync: 'Synkronisera',
  },
  status: {
    queued: 'I kö',
    running: 'Spring',
    success: 'Framgång',
    failed: 'Misslyckades',
  },
  rowClickHint: 'Vänsterklicka på en åtgärdsrad för att kopiera detaljer till urklipp.',
  payloadPresentAria: 'Denna åtgärd har en nyttolast.',
  payloadEmptyAria: 'Ingen nyttolast för denna åtgärd.',
  copy: {
    success: 'Åtgärdsraden har kopierats till urklipp',
    successCaption: 'Aktivitet kopierad - {actionId}',
    failed: 'Det gick inte att kopiera åtgärdsraden till urklipp.',
  }
}
