import type { Pinia, StoreGeneric, storeToRefs } from 'pinia'

/** Injected Pinia storeToRefs (managers pass the real binding). */
export type T_piniaStoreToRefs = typeof storeToRefs

export type { Pinia, StoreGeneric }
