import { useProgressContext } from '../context/ProgressContext';

export function useProgress() {
  const ctx = useProgressContext();
  return ctx;
}
