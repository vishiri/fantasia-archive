export default {
  title: 'Action monitor',
  closeButton: 'Close',
  emptyState: 'No actions have been recorded yet during this session.',
  columns: {
    action: 'Action',
    startTime: 'Start time',
    finishTime: 'Finish time',
    payload: 'Payload',
    type: 'Type',
    status: 'Status'
  },
  actionKind: {
    async: 'Async',
    sync: 'Sync'
  },
  status: {
    queued: 'Queued',
    running: 'Running',
    success: 'Success',
    failed: 'Failed'
  },
  rowClickHint: 'Left click on an action row to copy details to the clipboard.',
  payloadPresentAria: 'This action has a payload.',
  payloadEmptyAria: 'No payload for this action.',
  copy: {
    success: 'Action row copied to clipboard.',
    failed: 'Could not copy the action row to the clipboard.'
  }
}
