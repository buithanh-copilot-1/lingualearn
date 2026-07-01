import { useSyncExternalStore } from 'react';
import { isApiActive, subscribeApiActivity } from '../utils/apiActivity';

export function useApiActivity(): boolean {
  return useSyncExternalStore(subscribeApiActivity, isApiActive, () => false);
}
