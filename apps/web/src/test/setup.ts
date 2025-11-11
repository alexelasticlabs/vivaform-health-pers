import "@testing-library/jest-dom";

// Mock IntersectionObserver
class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(public callback: IntersectionObserverCallback) {}

  observe() {
    // Immediately trigger the callback with isIntersecting: true
    this.callback(
      [
        {
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          target: document.createElement("div"),
          time: Date.now()
        }
      ],
      this
    );
  }

  disconnect() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

global.IntersectionObserver = IntersectionObserverMock as any;

// Always mock fetch to avoid real network and AbortSignal issues in tests
(globalThis as any).fetch = (_input?: RequestInfo | URL, _init?: RequestInit) => {
  return Promise.resolve(new Response(""));
};

// Loosen Request constructor validation in Node/undici for tests to prevent AbortSignal errors
if (!(globalThis as any).Request || (globalThis as any).Request.name !== 'RequestShim') {
  class RequestShim {
    url: string;
    method: string;
    headers: Headers;
    signal: any;
    constructor(input: any, init?: any) {
      this.url = typeof input === 'string' ? input : input?.url || '';
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers || {});
      this.signal = init?.signal;
    }
  }
  ;(globalThis as any).Request = RequestShim as any;
}

// Minimal raf mock for framer-motion
if (!(globalThis as any).requestAnimationFrame) {
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16) as unknown as number;
}
if (!(globalThis as any).cancelAnimationFrame) {
  (globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id as unknown as NodeJS.Timeout);
}

// Silence console noise from React Query and React warnings
const originalError = console.error;
console.error = (...args: any[]) => {
  if (typeof args[0] === 'string' && /No queryFn was passed|ReactDOMTestUtils|act\(/i.test(args[0])) {
    return; // ignore noisy test warnings
  }
  originalError(...args);
};

// Provide global default queryFn for React Query in tests (used by helpers)
;(globalThis as any).__TEST_DEFAULT_QUERY_FN__ = async () => ({} as any);
