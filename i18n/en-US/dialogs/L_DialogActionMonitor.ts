export default {
  title: 'Action monitor',
  closeButton: 'Close',
  emptyState: 'No actions have been recorded yet during this session.',
  columns: {
    action: 'Action',
    timestamp: 'Time',
    status: 'Status'
  },
  status: {
    queued: 'Queued',
    running: 'Running',
    success: 'Success',
    failed: 'Failed'
  },
  payloadTooltipNone: 'No payload',
  payloadTooltipPrefix: 'Payload:',
  rowClickHint: 'Click a row to copy its JSON to the clipboard.',
  copy: {
    success: 'Action row copied to clipboard.',
    failed: 'Could not copy the action row to the clipboard.'
  }
}
