export default {
  title: 'Monitor de acción',
  closeButton: 'Cerca',
  emptyState: 'Aún no se han registrado acciones durante esta sesión.',
  columns: {
    action: 'Acción',
    startTime: 'Hora de inicio',
    finishTime: 'Hora de finalización',
    payload: 'Carga útil',
    type: 'Tipo',
    status: 'Estado',
  },
  actionKind: {
    async: 'asíncrono',
    sync: 'Sincronizar',
  },
  status: {
    queued: 'En cola',
    running: 'Correr',
    success: 'Éxito',
    failed: 'Fallido',
  },
  rowClickHint: 'Haga clic izquierdo en una fila de acción para copiar los detalles al portapapeles.',
  payloadPresentAria: 'Esta acción tiene una carga útil.',
  payloadEmptyAria: 'No hay carga útil para esta acción.',
  copy: {
    success: 'Fila de acción copiada al portapapeles',
    successCaption: 'Actividad copiada - {actionId}',
    failed: 'No se pudo copiar la fila de acción al portapapeles.',
  }
}
