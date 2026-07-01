// Lightweight global tracker for in-flight API requests, used to drive the
// top loading bar. Any code path that hits the network (our backend, the
// public dictionary API, the translation API, ...) reports here so the UI
// can show a single, consistent loading indicator regardless of which
// component triggered the request.

type Listener = () => void;

let activeCount = 0;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function beginApiRequest() {
  activeCount += 1;
  emit();
}

export function endApiRequest() {
  activeCount = Math.max(0, activeCount - 1);
  emit();
}

export function isApiActive(): boolean {
  return activeCount > 0;
}

export function subscribeApiActivity(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Wrap a promise so the loading bar tracks it for its whole lifetime. */
export async function trackApiRequest<T>(work: () => Promise<T>): Promise<T> {
  beginApiRequest();
  try {
    return await work();
  } finally {
    endApiRequest();
  }
}
