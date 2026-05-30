import type { z } from 'zod'

import { faProjectCreateInputSchema } from 'app/src-electron/shared/faProjectCreateInputSchema'

/** Parsed renderer IPC payload for project create. */
export type I_faProjectCreateInputParsed = z.infer<typeof faProjectCreateInputSchema>
