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
(globalThis as any).fetch = (..._args: any[]) => Promise.resolve(new Response("")) as any;

// Minimal raf mock for framer-motion
if (!(globalThis as any).requestAnimationFrame) {
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16) as unknown as number;
}
if (!(globalThis as any).cancelAnimationFrame) {
  (globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id as unknown as NodeJS.Timeout);
}
