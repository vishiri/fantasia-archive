export default {
  title: 'Monitor de Ação',
  closeButton: 'Fechar',
  emptyState: 'Nenhuma ação foi registrada ainda durante esta sessão.',
  columns: {
    action: 'Ação',
    startTime: 'Hora de início',
    finishTime: 'Hora de término',
    payload: 'Carga útil',
    type: 'Tipo',
    status: 'Status',
  },
  actionKind: {
    async: 'Assíncrono',
    sync: 'Sincronizar',
  },
  status: {
    queued: 'Na fila',
    running: 'Correndo',
    success: 'Sucesso',
    failed: 'Fracassado',
  },
  rowClickHint: 'Clique com o botão esquerdo em uma linha de ação para copiar os detalhes para a área de transferência.',
  payloadPresentAria: 'Esta ação tem uma carga útil.',
  payloadEmptyAria: 'Nenhuma carga útil para esta ação.',
  copy: {
    success: 'Linha de ação copiada para a área de transferência',
    successCaption: 'Atividade copiada - {actionId}',
    failed: 'Não foi possível copiar a linha de ação para a área de transferência.',
  }
}
