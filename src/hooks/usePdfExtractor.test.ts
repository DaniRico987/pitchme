import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePdfExtractor } from "./usePdfExtractor";

// Mock Worker class that can be instantiated with `new`
class MockWorker {
  static instances: MockWorker[] = [];

  postMessage = vi.fn();
  terminate = vi.fn();
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;

  constructor() {
    MockWorker.instances.push(this);
  }

  static getLastInstance() {
    return MockWorker.instances[MockWorker.instances.length - 1];
  }

  static reset() {
    MockWorker.instances = [];
  }
}

// Mock FileReader - synchronous for testing
class MockFileReader {
  result: ArrayBuffer | null = null;
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;

  readAsArrayBuffer(): void {
    // Simulate synchronous read for testing
    this.result = new ArrayBuffer(8);
    // Call onload synchronously
    if (this.onload) {
      this.onload({ target: this } as unknown as ProgressEvent<FileReader>);
    }
  }
}

const OriginalWorker = global.Worker;
const OriginalFileReader = global.FileReader;

describe("usePdfExtractor", () => {
  beforeEach(() => {
    MockWorker.reset();
    vi.clearAllMocks();

    // Replace global.Worker with our mock class
    // @ts-expect-error - Mock Worker
    global.Worker = MockWorker;

    // Mock FileReader
    // @ts-expect-error - Mock FileReader
    global.FileReader = MockFileReader;
  });

  afterEach(() => {
    global.Worker = OriginalWorker;
    global.FileReader = OriginalFileReader;
    vi.unstubAllGlobals();
  });

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => usePdfExtractor());

    expect(result.current.isExtracting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(0);
  });

  it("should return extractText function", () => {
    const { result } = renderHook(() => usePdfExtractor());

    expect(typeof result.current.extractText).toBe("function");
  });

  it("should create worker on mount", () => {
    renderHook(() => usePdfExtractor());

    expect(MockWorker.instances.length).toBe(1);
  });

  it("should terminate worker on unmount", () => {
    const { unmount } = renderHook(() => usePdfExtractor());

    unmount();

    const instance = MockWorker.getLastInstance();
    expect(instance?.terminate).toHaveBeenCalledTimes(1);
  });

  it("should handle successful extraction", async () => {
    const { result } = renderHook(() => usePdfExtractor());

    // Create a mock file
    const file = new File(["test content"], "test.pdf", {
      type: "application/pdf",
    });

    // Start extraction - wrap in act to flush state updates
    let extractPromise: Promise<string>;
    await act(async () => {
      extractPromise = result.current.extractText(file);
    });

    // Check isExtracting is true after calling extractText (state flushed)
    expect(result.current.isExtracting).toBe(true);
    expect(result.current.progress).toBe(30); // File read complete

    // Simulate worker response
    await act(async () => {
      const instance = MockWorker.getLastInstance();
      instance?.onmessage?.({
        data: { id: 1, text: "Extracted text content" },
      } as MessageEvent);
    });

    const extractedText = await extractPromise!;

    expect(extractedText).toBe("Extracted text content");
    expect(result.current.isExtracting).toBe(false);
    expect(result.current.progress).toBe(100);
  });

  it("should handle extraction error", async () => {
    const { result } = renderHook(() => usePdfExtractor());

    const file = new File(["test content"], "test.pdf", {
      type: "application/pdf",
    });

    let extractPromise: Promise<string>;
    await act(async () => {
      extractPromise = result.current.extractText(file);
    });

    expect(result.current.isExtracting).toBe(true);

    await act(async () => {
      const instance = MockWorker.getLastInstance();
      instance?.onmessage?.({
        data: { id: 1, error: "Extraction failed" },
      } as MessageEvent);
    });

    await expect(extractPromise!).rejects.toThrow("Extraction failed");
    expect(result.current.isExtracting).toBe(false);
  });

  it("should handle worker error", async () => {
    const { result } = renderHook(() => usePdfExtractor());

    const file = new File(["test content"], "test.pdf", {
      type: "application/pdf",
    });

    let extractPromise: Promise<string>;
    await act(async () => {
      extractPromise = result.current.extractText(file);
    });

    expect(result.current.isExtracting).toBe(true);

    await act(async () => {
      const instance = MockWorker.getLastInstance();
      instance?.onerror?.(
        new ErrorEvent("error", { error: new Error("Worker error") }),
      );
    });

    await expect(extractPromise!).rejects.toThrow("Worker error");
    expect(result.current.error).toBe("PDF extraction worker failed");
    expect(result.current.isExtracting).toBe(false);
  });
});
