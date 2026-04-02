/**
 * Channel names for main ↔ preload DevTools control.
 * Kept in one module so main registration and preload `sendSync` stay aligned.
 */
export const FA_DEVTOOLS_IPC = {
  statusSync: 'fa-devtools-status-sync',
  toggleSync: 'fa-devtools-toggle-sync',
  openSync: 'fa-devtools-open-sync',
  closeSync: 'fa-devtools-close-sync'
} as const
