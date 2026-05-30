import type { z } from 'zod'

import { faProjectOpenInputSchema } from 'app/src-electron/shared/faProjectOpenInputSchema'

/** Parsed renderer IPC payload for project open. */
export type I_faProjectOpenInputParsed = z.infer<typeof faProjectOpenInputSchema>
