import { Result } from 'neverthrow'
import { z } from 'zod'

import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'
import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

interface I_faProjectLocaleTranslationsJsonApiOptions<T> {
  valueMaxLength: number
  jsonMaxLength: number
  storageLimitMessage: string
  normalize: (value: T) => T
  hasTranslation?: (value: T) => boolean
  requiredTranslationMessage?: string
}

function buildFaProjectLocaleTranslationsRecordSchema (valueMaxLength: number) {
  const valueSchema = z.string().max(valueMaxLength)
  return z.object(
    Object.fromEntries(
      FA_USER_SETTINGS_LANGUAGE_CODES.map((code) => {
        return [code, valueSchema.optional()]
      })
    ) as Record<T_faUserSettingsLanguageCode, z.ZodOptional<z.ZodString>>
  ).strict()
}

function parseFaProjectLocaleTranslationsStoredJson<T> (
  rawJson: string,
  recordSchema: ReturnType<typeof buildFaProjectLocaleTranslationsRecordSchema>,
  normalize: (value: T) => T
): T {
  const parsed = Result.fromThrowable(
    () => JSON.parse(rawJson) as unknown,
    () => undefined
  )().unwrapOr(undefined)
  if (parsed === undefined) {
    return {} as T
  }
  const recordResult = recordSchema.safeParse(parsed)
  if (!recordResult.success) {
    return {} as T
  }
  const cleaned = dropUndefinedRecordValues(recordResult.data) as T
  return normalize(cleaned)
}

function serializeFaProjectLocaleTranslationsJson<T> (
  value: T,
  jsonMaxLength: number,
  storageLimitMessage: string,
  normalize: (value: T) => T
): string {
  const normalized = normalize(value)
  const serialized = JSON.stringify(normalized)
  if (serialized.length > jsonMaxLength) {
    throw new Error(storageLimitMessage)
  }
  return serialized
}

function parseFaProjectLocaleTranslationsSnapshot<T> (
  payload: unknown,
  snapshotSchema: { parse: (value: unknown) => Record<string, unknown> },
  normalize: (value: T) => T
): T {
  const parsed = snapshotSchema.parse(payload)
  const cleaned = dropUndefinedRecordValues(parsed) as T
  return normalize(cleaned)
}

function resolveFaProjectLocaleTranslationsSnapshotSchema<T> (
  recordSchema: ReturnType<typeof buildFaProjectLocaleTranslationsRecordSchema>,
  hasTranslation: ((value: T) => boolean) | undefined,
  requiredTranslationMessage: string | undefined
) {
  if (hasTranslation === undefined || requiredTranslationMessage === undefined) {
    return recordSchema
  }
  return recordSchema.superRefine((value, ctx) => {
    const cleaned = dropUndefinedRecordValues(value) as T
    if (!hasTranslation(cleaned)) {
      ctx.addIssue({
        code: 'custom',
        message: requiredTranslationMessage
      })
    }
  })
}

/**
 * Shared parse, serialize, and snapshot checks for per-locale translation JSON columns.
 */
export function createFaProjectLocaleTranslationsJsonApi<T> (
  options: I_faProjectLocaleTranslationsJsonApiOptions<T>
) {
  const recordSchema = buildFaProjectLocaleTranslationsRecordSchema(options.valueMaxLength)
  const snapshotSchema = resolveFaProjectLocaleTranslationsSnapshotSchema(
    recordSchema,
    options.hasTranslation,
    options.requiredTranslationMessage
  )
  const normalize = options.normalize
  const jsonMaxLength = options.jsonMaxLength
  const storageLimitMessage = options.storageLimitMessage
  const parseJson = (rawJson: string): T => {
    return parseFaProjectLocaleTranslationsStoredJson(rawJson, recordSchema, normalize)
  }
  const serializeJson = (value: T): string => {
    return serializeFaProjectLocaleTranslationsJson(
      value,
      jsonMaxLength,
      storageLimitMessage,
      normalize
    )
  }
  const parseSnapshot = (payload: unknown): T => {
    return parseFaProjectLocaleTranslationsSnapshot(payload, snapshotSchema, normalize)
  }
  return {
    parseJson,
    serializeJson,
    snapshotSchema,
    parseSnapshot
  }
}
