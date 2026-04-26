import type { Meta, StoryObj } from '@storybook/vue3-vite'

import type { I_faActionHistoryEntry } from 'app/types/I_faActionManagerDomain'

import DialogActionMonitor from '../DialogActionMonitor.vue'

/**
 * Newest-first row order (matches `snapshotActionHistory` sort for the live monitor).
 */
const sampleHistory: I_faActionHistoryEntry[] = [
  {
    enqueuedAt: Date.now() - 1_500,
    id: 'refreshWebContentsAfterLanguage',
    kind: 'sync',
    startedAt: Date.now() - 1_400,
    status: 'running',
    uid: 'storybook-uid-4'
  },
  {
    enqueuedAt: Date.now() - 5_000,
    id: 'closeApp',
    kind: 'sync',
    status: 'queued',
    uid: 'storybook-uid-3'
  },
  {
    enqueuedAt: Date.now() - 7_500,
    finishedAt: Date.now() - 7_000,
    errorMessage: 'Failed to save keybind settings.',
    id: 'saveKeybindSettings',
    kind: 'async',
    payloadPreview: '{"overrides":{}}',
    startedAt: Date.now() - 7_400,
    status: 'failed',
    uid: 'storybook-uid-2'
  },
  {
    enqueuedAt: Date.now() - 10_000,
    finishedAt: Date.now() - 9_000,
    id: 'toggleDeveloperTools',
    kind: 'async',
    startedAt: Date.now() - 9_500,
    status: 'success',
    uid: 'storybook-uid-1'
  },
  {
    enqueuedAt: Date.now() - 10_500,
    finishedAt: Date.now() - 9_800,
    id: 'openActionMonitorDialog',
    kind: 'async',
    startedAt: Date.now() - 10_000,
    status: 'success',
    uid: 'storybook-uid-open-monitor'
  }
]

const meta = {
  component: DialogActionMonitor,
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: '720px'
      },
      description: {
        component:
          'Read-only Action Monitor dialog: newest-first rows from a session action-history snapshot (sync queue and async). Storybook uses directInput plus directHistorySnapshot sample rows from the locale mock. Canvas VRT is skipped because the running-row spinner animates and timestamps change each load.'
      }
    }
  },
  /**
   * Visual capture intentionally skipped: the running spinner animates and 'enqueuedAt' timestamps shift on every render,
   * which would constantly invalidate the screenshot baseline.
   */
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogActionMonitor'
} satisfies Meta<typeof DialogActionMonitor>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directHistorySnapshot: sampleHistory,
    directInput: 'ActionMonitor'
  }
}

export const EmptyState: StoryObj<typeof meta> = {
  args: {
    directHistorySnapshot: [],
    directInput: 'ActionMonitor'
  }
}
