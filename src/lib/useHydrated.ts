'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * Returns false during SSR and hydration, then true on the client. This keeps
 * persisted client state from producing hydration mismatches without an effect
 * that synchronously schedules a second render.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
