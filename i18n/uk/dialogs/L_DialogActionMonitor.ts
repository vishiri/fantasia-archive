export default {
  title: 'Монітор дій',
  closeButton: 'Закрити',
  emptyState: 'Під час цього сеансу ще не було зафіксовано жодних дій.',
  columns: {
    action: 'Дія',
    startTime: 'Час початку',
    finishTime: 'Час закінчення',
    payload: 'Корисне навантаження',
    type: 'Тип',
    status: 'Статус',
  },
  actionKind: {
    async: 'асинхронний',
    sync: 'Синхронізувати',
  },
  status: {
    queued: 'У черзі',
    running: 'Біг',
    success: 'Успіх',
    failed: 'Не вдалося',
  },
  rowClickHint: 'Клацніть лівою кнопкою миші рядок дії, щоб скопіювати деталі в буфер обміну.',
  payloadPresentAria: 'Ця дія має корисне навантаження.',
  payloadEmptyAria: 'Немає корисного навантаження для цієї дії.',
  copy: {
    success: 'Рядок дії скопійовано в буфер обміну',
    successCaption: 'Діяльність скопійовано - {actionId}',
    failed: 'Не вдалося скопіювати рядок дії в буфер обміну.',
  }
}
