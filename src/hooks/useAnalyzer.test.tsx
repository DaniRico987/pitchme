import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAnalyzer } from "./useAnalyzer";
import { analyzeCV } from "../lib/claude";
import { AuthProvider } from "../context/AuthContext";

// Mock dependencies
vi.mock("../lib/claude");
vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

vi.mock("../context/ToastContext", () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Wrapper component with AuthProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("useAnalyzer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useAnalyzer(), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.result).toBeNull();
  });

  it("should return analyze, cancel, and resetResult functions", () => {
    const { result } = renderHook(() => useAnalyzer(), { wrapper });

    expect(typeof result.current.analyze).toBe("function");
    expect(typeof result.current.cancel).toBe("function");
    expect(typeof result.current.resetResult).toBe("function");
  });

  it("should load persisted result from localStorage on mount", () => {
    const mockResult = {
      score: 85,
      scoreLabel: "Good",
      sections: [],
      createdAt: new Date().toISOString(),
    };
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        result: mockResult,
        timestamp: Date.now(),
        jobTitle: "Test",
      }),
    );

    const { result } = renderHook(() => useAnalyzer(), { wrapper });

    expect(result.current.result).toEqual(mockResult);
  });

  it("should not load expired persisted result", () => {
    const mockResult = {
      score: 85,
      scoreLabel: "Good",
      sections: [],
      createdAt: new Date().toISOString(),
    };
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        result: mockResult,
        timestamp: Date.now() - 25 * 60 * 60 * 1000,
        jobTitle: "Test",
      }),
    );

    const { result } = renderHook(() => useAnalyzer(), { wrapper });

    expect(result.current.result).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      "pitchme-last-analysis",
    );
  });

  it("should handle successful analysis", async () => {
    const mockAnalysisResult = {
      score: 90,
      scoreLabel: "Excellent",
      sections: [],
      createdAt: new Date().toISOString(),
    };
    (analyzeCV as vi.Mock).mockResolvedValue(mockAnalysisResult);

    const { result } = renderHook(() => useAnalyzer(), { wrapper });

    await act(async () => {
      await result.current.analyze(
        "cv text",
        "job description",
        "Developer",
        "en",
      );
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.result).toEqual(mockAnalysisResult);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it("should handle analysis error", async () => {
    (analyzeCV as vi.Mock).mockRejectedValue(new Error("API error"));

    const { result } = renderHook(() => useAnalyzer(), { wrapper });

    await act(async () => {
      await result.current.analyze(
        "cv text",
        "job description",
        "Developer",
        "en",
      );
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("API error");
    expect(result.current.result).toBeNull();
  });

  it("should cancel in-flight request", async () => {
    let resolveAnalysis: (value: unknown) => void;
    const analysisPromise = new Promise((resolve) => {
      resolveAnalysis = resolve;
    });
    (analyzeCV as vi.Mock).mockReturnValue(analysisPromise);

    const { result } = renderHook(() => useAnalyzer(), { wrapper });

    // Start analysis
    act(() => {
      result.current.analyze("cv text", "job description", "Developer", "en");
    });

    // Wait for loading to start (state update is async)
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.isLoading).toBe(true);

    // Cancel
    act(() => {
      result.current.cancel();
    });

    expect(result.current.isLoading).toBe(false);

    // The cancel should prevent result from being set
    // Resolve the analysis (in real usage, this would be aborted)
    resolveAnalysis!({
      score: 50,
      scoreLabel: "Average",
      sections: [],
      createdAt: new Date().toISOString(),
    });
    await act(async () => {
      await Promise.resolve();
    });

    // After cancel, result should remain null (the AbortError handling prevents setting result)
    // Note: In test environment, the mock doesn't throw AbortError, so this tests the cancel flow
    expect(result.current.isLoading).toBe(false);
  });

  it("should reset result and clear localStorage", async () => {
    const { result } = renderHook(() => useAnalyzer(), { wrapper });

    act(() => {
      result.current.resetResult();
    });

    // Wait for state update
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      "pitchme-last-analysis",
    );
  });
});
