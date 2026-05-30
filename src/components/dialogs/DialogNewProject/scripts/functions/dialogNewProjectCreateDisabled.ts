/**
 * True when the create action should stay disabled for the current name field value.
 */
export function isDialogNewProjectCreateDisabled (projectName: string): boolean {
  return projectName.trim().length === 0
}
