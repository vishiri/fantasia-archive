import { expect, test } from 'vitest'

import type { I_faActionHistoryEntry } from 'app/types/I_faActionManagerDomain'

import {
  buildDialogActionMonitorColumns,
  buildDialogActionMonitorRowClipboardJson,
  buildDialogActionMonitorStatusBadge,
  DIALOG_ACTION_MONITOR_COLUMN_NAMES,
  formatDialogActionMonitorActionKind,
  formatDialogActionMonitorTimestamp,
  hasDialogActionMonitorPayload
} from '../dialogActionMonitorTable'

/**
 * buildDialogActionMonitorColumns
 * Returns one column descriptor per registered column name, with sortable disabled.
 */
test('Test that buildDialogActionMonitorColumns returns one descriptor per registered column name', () => {
  const cols = buildDialogActionMonitorColumns()
  expect(cols).toHaveLength(DIALOG_ACTION_MONITOR_COLUMN_NAMES.length)
  for (const name of DIALOG_ACTION_MONITOR_COLUMN_NAMES) {
    const match = cols.find((col) => col.name === name)
    expect(match).toBeDefined()
    expect(match?.sortable).toBe(false)
  }
})

/**
 * buildDialogActionMonitorColumns
 * Keeps name order aligned with row fields for the six-column action monitor table.
 */
test('Test that buildDialogActionMonitorColumns maps names to id startedAt finishedAt payloadPreview kind status fields', () => {
  const cols = buildDialogActionMonitorColumns()
  expect(cols.map((col) => col.name)).toEqual([...DIALOG_ACTION_MONITOR_COLUMN_NAMES])
  expect(cols.map((col) => col.field)).toEqual([
    'id',
    'startedAt',
    'finishedAt',
    'payloadPreview',
    'kind',
    'status'
  ])
})

/**
 * formatDialogActionMonitorTimestamp
 * Returns an empty string when the timestamp is undefined or NaN.
 */
test('Test that formatDialogActionMonitorTimestamp returns empty string for undefined input', () => {
  expect(formatDialogActionMonitorTimestamp(undefined)).toBe('')
})

test('Test that formatDialogActionMonitorTimestamp returns empty string for NaN input', () => {
  expect(formatDialogActionMonitorTimestamp(Number.NaN)).toBe('')
})

/**
 * formatDialogActionMonitorTimestamp
 * Returns an 'HH:MM:SS' string for valid numeric timestamps.
 */
test('Test that formatDialogActionMonitorTimestamp returns the HH:MM:SS wall-clock format for valid numbers', () => {
  const date = new Date(2024, 5, 15, 13, 27, 42)
  const formatted = formatDialogActionMonitorTimestamp(date.getTime())
  expect(formatted).toBe('13:27:42')
})

/**
 * formatDialogActionMonitorActionKind
 * Maps execution kind to the localized sync and async labels.
 */
test('Test that formatDialogActionMonitorActionKind maps sync to the sync i18n key', () => {
  expect(formatDialogActionMonitorActionKind('sync')).toBe('dialogs.actionMonitor.actionKind.sync')
})

test('Test that formatDialogActionMonitorActionKind maps async to the async i18n key', () => {
  expect(formatDialogActionMonitorActionKind('async')).toBe('dialogs.actionMonitor.actionKind.async')
})

/**
 * buildDialogActionMonitorStatusBadge
 * Maps every status value to a deterministic badge descriptor.
 */
test('Test that buildDialogActionMonitorStatusBadge maps success to a positive check icon', () => {
  const badge = buildDialogActionMonitorStatusBadge('success')
  expect(badge.icon).toBe('mdi-check')
  expect(badge.colorClass).toBe('text-positive')
  expect(badge.isSpinner).toBe(false)
})

test('Test that buildDialogActionMonitorStatusBadge maps failed to a negative close icon', () => {
  const badge = buildDialogActionMonitorStatusBadge('failed')
  expect(badge.icon).toBe('mdi-close')
  expect(badge.colorClass).toBe('text-negative')
  expect(badge.isSpinner).toBe(false)
})

test('Test that buildDialogActionMonitorStatusBadge maps running to the spinner branch', () => {
  const badge = buildDialogActionMonitorStatusBadge('running')
  expect(badge.icon).toBe('')
  expect(badge.isSpinner).toBe(true)
})

test('Test that buildDialogActionMonitorStatusBadge maps queued to a blue timer-sand icon', () => {
  const badge = buildDialogActionMonitorStatusBadge('queued')
  expect(badge.icon).toBe('mdi-timer-sand-empty')
  expect(badge.isSpinner).toBe(false)
  expect(badge.colorClass).toBe('fa-text-status-queued')
})

/**
 * hasDialogActionMonitorPayload
 * True only when payloadPreview is a non-empty string.
 */
test('Test that hasDialogActionMonitorPayload is false when preview is missing', () => {
  const entry: I_faActionHistoryEntry = {
    enqueuedAt: 1,
    id: 'closeApp',
    kind: 'sync',
    status: 'queued',
    uid: 'no-payload'
  }
  expect(hasDialogActionMonitorPayload(entry)).toBe(false)
})

test('Test that hasDialogActionMonitorPayload is false when preview is empty or whitespace', () => {
  const empty: I_faActionHistoryEntry = {
    enqueuedAt: 1,
    id: 'closeApp',
    kind: 'sync',
    payloadPreview: '',
    status: 'queued',
    uid: 'empty-payload'
  }
  expect(hasDialogActionMonitorPayload(empty)).toBe(false)
  const whitespace: I_faActionHistoryEntry = {
    ...empty,
    payloadPreview: '   ',
    uid: 'ws-payload'
  }
  expect(hasDialogActionMonitorPayload(whitespace)).toBe(false)
})

test('Test that hasDialogActionMonitorPayload is true when preview has non-whitespace content', () => {
  const entry: I_faActionHistoryEntry = {
    enqueuedAt: 1,
    id: 'closeApp',
    kind: 'sync',
    payloadPreview: '{"reason":"menu"}',
    status: 'queued',
    uid: 'has-payload'
  }
  expect(hasDialogActionMonitorPayload(entry)).toBe(true)
})

/**
 * buildDialogActionMonitorRowClipboardJson
 * Should return pretty-printed JSON of every entry field, with payloadPreview re-parsed into 'payload' when valid.
 */
test('Test that buildDialogActionMonitorRowClipboardJson includes parsed payload alongside payloadPreview', () => {
  const entry: I_faActionHistoryEntry = {
    enqueuedAt: 1_700_000_000_000,
    finishedAt: 1_700_000_001_000,
    id: 'languageSwitch',
    kind: 'async',
    payloadPreview: '{"code":"de","priorCode":"en-US"}',
    startedAt: 1_700_000_000_500,
    status: 'success',
    uid: 'uid-success'
  }
  const json = buildDialogActionMonitorRowClipboardJson(entry)
  const parsed = JSON.parse(json) as Record<string, unknown>
  expect(parsed.uid).toBe('uid-success')
  expect(parsed.id).toBe('languageSwitch')
  expect(parsed.status).toBe('success')
  expect(parsed.payloadPreview).toBe('{"code":"de","priorCode":"en-US"}')
  expect(parsed.payload).toEqual({
    code: 'de',
    priorCode: 'en-US'
  })
  expect(json.includes('\n')).toBe(true)
})

test('Test that buildDialogActionMonitorRowClipboardJson omits payload field when payloadPreview is missing', () => {
  const entry: I_faActionHistoryEntry = {
    enqueuedAt: 1,
    id: 'closeApp',
    kind: 'sync',
    status: 'queued',
    uid: 'no-payload'
  }
  const parsed = JSON.parse(buildDialogActionMonitorRowClipboardJson(entry)) as Record<string, unknown>
  expect(parsed.payload).toBeUndefined()
  expect(parsed.payloadPreview).toBeUndefined()
})

test('Test that buildDialogActionMonitorRowClipboardJson keeps payloadPreview when it is not valid JSON', () => {
  const entry: I_faActionHistoryEntry = {
    enqueuedAt: 1,
    id: 'closeApp',
    kind: 'sync',
    payloadPreview: 'not-json',
    status: 'queued',
    uid: 'broken-payload'
  }
  const parsed = JSON.parse(buildDialogActionMonitorRowClipboardJson(entry)) as Record<string, unknown>
  expect(parsed.payload).toBeUndefined()
  expect(parsed.payloadPreview).toBe('not-json')
})

test('Test that buildDialogActionMonitorRowClipboardJson treats empty payloadPreview as missing', () => {
  const entry: I_faActionHistoryEntry = {
    enqueuedAt: 1,
    id: 'closeApp',
    kind: 'sync',
    payloadPreview: '',
    status: 'queued',
    uid: 'empty-payload'
  }
  const parsed = JSON.parse(buildDialogActionMonitorRowClipboardJson(entry)) as Record<string, unknown>
  expect(parsed.payload).toBeUndefined()
  expect('payloadPreview' in parsed).toBe(false)
})
