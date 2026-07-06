export function isPrimaryMouseButton (event: Pick<MouseEvent, 'button'>): boolean {
  return event.button === 0
}
