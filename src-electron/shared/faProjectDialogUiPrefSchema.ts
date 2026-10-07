import { z } from 'zod'

import { isPlainRecord } from 'app/src-electron/shared/faPlainRecord'

import type {
  I_faProjectDialogUiPrefGetInput,
  I_faProjectDialogUiPrefSetInput
} from 'app/types/I_faProjectDialogUiPrefDomain'

const faProjectDialogUiPrefKeySchema = z.literal('last_selected_world_id')

const faProjectDialogUiPrefGetInputSchema = z.object({
  key: faProjectDialogUiPrefKeySchema
}).strict()

const faProjectDialogUiPrefSetInputSchema = z.object({
  key: faProjectDialogUiPrefKeySchema,
  value: z.string().max(255)
}).strict()

/**
 * Parses IPC get payload for an allowlisted dialog UI preference key.
 */
export function parseFaProjectDialogUiPrefGetInput (
  payload: unknown
): I_faProjectDialogUiPrefGetInput {
  if (!isPlainRecord(payload)) {
    throw new TypeError('Project dialog UI pref get input must be a plain object')
  }
  return faProjectDialogUiPrefGetInputSchema.parse(payload)
}

/**
 * Parses IPC set payload for an allowlisted dialog UI preference key.
 */
export function parseFaProjectDialogUiPrefSetInput (
  payload: unknown
): I_faProjectDialogUiPrefSetInput {
  if (!isPlainRecord(payload)) {
    throw new TypeError('Project dialog UI pref set input must be a plain object')
  }
  return faProjectDialogUiPrefSetInputSchema.parse(payload)
}
