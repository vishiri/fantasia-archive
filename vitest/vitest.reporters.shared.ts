/**
 * Terminal reporter list for unit projects. The Vitest 'agent' reporter omits passing file and suite
 * lines (same idea as coverage skipFull) while still printing the final run summary and failures in full.
 * JSON stays second so test-results JSON reports are unchanged.
 */
export const vitestTerminalReporters = ['agent', 'json'] as const
