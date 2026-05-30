export const FA_DEVTOOLS_AUTOFILL_STDERR_PATTERN =
  /Autofill\.(enable|setAddresses).*wasn't found/

export function shouldSuppressDevtoolsAutofillStderrChunk (chunk: unknown): boolean {
  const asString = (c: unknown): string =>
    typeof c === 'string' ? c : Buffer.isBuffer(c) ? c.toString('utf8') : String(c)
  return FA_DEVTOOLS_AUTOFILL_STDERR_PATTERN.test(asString(chunk))
}
