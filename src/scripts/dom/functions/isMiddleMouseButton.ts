export function isMiddleMouseButton (event: Pick<MouseEvent, 'button'>): boolean {
  return event.button === 1
}
