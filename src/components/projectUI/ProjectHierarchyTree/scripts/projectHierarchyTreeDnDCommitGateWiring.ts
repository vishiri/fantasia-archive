import { areProjectHierarchyTreeOrderedDocumentIdsEqual } from '../functions/projectHierarchyTreeOrderedDocumentIdsEqual'

export function projectHierarchyTreeDragCommitEpochMoved (
  epochAtSchedule: number | undefined,
  readProjectContentEpoch: (() => number) | undefined
): boolean {
  if (epochAtSchedule === undefined || readProjectContentEpoch === undefined) {
    return false
  }
  return readProjectContentEpoch() !== epochAtSchedule
}

export function releaseProjectHierarchyTreeDragCommitAfterProjectSwitch (deps: {
  clearDragSessionFlags: () => void
  dragExpandPostCommitGuard: { value: boolean }
  dragExpandUiFrozen: { value: boolean }
}): void {
  deps.dragExpandUiFrozen.value = false
  deps.dragExpandPostCommitGuard.value = false
  deps.clearDragSessionFlags()
}

export async function reindexHierarchySiblingsThenSyncOpenedParent<T> (input: {
  epochAtStart: number
  isProjectReplacementInFlight: () => boolean
  movedDocumentId: string
  parentDocumentId: string | null
  readProjectContentEpoch: () => number
  reindex: () => Promise<T>
  syncOpenedParent: (documentId: string, parentDocumentId: string | null) => void
}): Promise<T> {
  const result = await input.reindex()
  if (input.isProjectReplacementInFlight()) {
    return result
  }
  if (input.readProjectContentEpoch() !== input.epochAtStart) {
    return result
  }
  input.syncOpenedParent(input.movedDocumentId, input.parentDocumentId)
  return result
}

export function releaseProjectHierarchyTreeDragCommitWhenProjectChanged (
  deps: {
    clearDragSessionFlags: () => void
    dragExpandPostCommitGuard: { value: boolean }
    dragExpandUiFrozen: { value: boolean }
    isProjectReplacementInFlight?: () => boolean
    readProjectContentEpoch?: () => number
  },
  epochAtSchedule: number | undefined
): boolean {
  const replacementInFlight = deps.isProjectReplacementInFlight?.() === true
  const epochMoved = projectHierarchyTreeDragCommitEpochMoved(
    epochAtSchedule,
    deps.readProjectContentEpoch
  )
  if (!replacementInFlight && !epochMoved) {
    return false
  }
  releaseProjectHierarchyTreeDragCommitAfterProjectSwitch(deps)
  return true
}

/**
 * Whether drag drop changed parent and/or sibling order vs drag-start snapshot.
 */
export function resolveProjectHierarchyTreeDragCommitGate (input: {
  dragParentDocumentIdAtDragStart: string | null
  dragSiblingOrderSnapshot: {
    orderedDocumentIds: string[]
    parentDocumentId: string | null
  } | null
  dragStartOrder: string[] | null
}): {
    orderChangedFromDragStart: boolean
    parentChangedFromDragStart: boolean
  } {
  const parentChangedFromDragStart = input.dragSiblingOrderSnapshot !== null &&
    input.dragParentDocumentIdAtDragStart !== input.dragSiblingOrderSnapshot.parentDocumentId
  const orderChangedFromDragStart = input.dragSiblingOrderSnapshot !== null &&
    (input.dragStartOrder === null ||
      parentChangedFromDragStart ||
      !areProjectHierarchyTreeOrderedDocumentIdsEqual(
        input.dragSiblingOrderSnapshot.orderedDocumentIds,
        input.dragStartOrder
      ))
  return {
    orderChangedFromDragStart,
    parentChangedFromDragStart
  }
}

type T_dragCommitScheduledFlag = {
  value: boolean
}

const dragCommitSerialByScheduledFlag = new WeakMap<T_dragCommitScheduledFlag, { current: number }>()

/**
 * Bumps the in-flight drag-commit serial for one tree session.
 * A newer drop makes the older finish skip persist, refresh, and flag cleanup.
 */
export function beginProjectHierarchyTreeDragCommitSerial (
  dragCommitScheduled: T_dragCommitScheduledFlag
): number {
  const existing = dragCommitSerialByScheduledFlag.get(dragCommitScheduled)
  const box = existing ?? { current: 0 }
  if (existing === undefined) {
    dragCommitSerialByScheduledFlag.set(dragCommitScheduled, box)
  }
  box.current += 1
  return box.current
}

/**
 * False after beginProjectHierarchyTreeDragCommitSerial runs again for the same flag.
 * Missing box means the caller is not using the serial (direct finalize tests).
 */
export function isProjectHierarchyTreeDragCommitSerialCurrent (
  dragCommitScheduled: T_dragCommitScheduledFlag,
  serial: number
): boolean {
  const box = dragCommitSerialByScheduledFlag.get(dragCommitScheduled)
  if (box === undefined) {
    return true
  }
  return box.current === serial
}

const dragSessionSerialByFrozenFlag = new WeakMap<T_dragCommitScheduledFlag, { current: number }>()

/**
 * Bumps the hierarchy drag session serial.
 * A newer drag makes an older cancel skip restore and flag cleanup.
 */
export function beginProjectHierarchyTreeDragSessionSerial (
  dragExpandUiFrozen: T_dragCommitScheduledFlag
): number {
  const existing = dragSessionSerialByFrozenFlag.get(dragExpandUiFrozen)
  const box = existing ?? { current: 0 }
  if (existing === undefined) {
    dragSessionSerialByFrozenFlag.set(dragExpandUiFrozen, box)
  }
  box.current += 1
  return box.current
}

/**
 * Serial captured when a cancel starts.
 * Zero when no drag has begun on this frozen flag.
 */
export function readProjectHierarchyTreeDragSessionSerial (
  dragExpandUiFrozen: T_dragCommitScheduledFlag
): number {
  const box = dragSessionSerialByFrozenFlag.get(dragExpandUiFrozen)
  if (box === undefined) {
    return 0
  }
  return box.current
}

/**
 * False after beginProjectHierarchyTreeDragSessionSerial runs again.
 * Missing box means the caller is not using the serial (direct cancel tests).
 */
export function isProjectHierarchyTreeDragSessionSerialCurrent (
  dragExpandUiFrozen: T_dragCommitScheduledFlag,
  serial: number
): boolean {
  const box = dragSessionSerialByFrozenFlag.get(dragExpandUiFrozen)
  if (box === undefined) {
    return true
  }
  return box.current === serial
}
