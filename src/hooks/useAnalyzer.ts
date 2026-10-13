import { useCallback, useRef, useState } from "react";
import { analyzeCV } from "../lib/claude";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import type { AnalysisResult } from "../types";

interface AnalyzeOptions {
  onSuccess?: (result: AnalysisResult) => void;
  onError?: (error: Error) => void;
}

const STORAGE_KEY = "pitchme-last-analysis";

export function useAnalyzer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  // Load persisted result on mount
  const loadPersistedResult = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.result && parsed.timestamp) {
          // Check if result is less than 24 hours old
          const age = Date.now() - parsed.timestamp;
          if (age < 24 * 60 * 60 * 1000) {
            setResult(parsed.result);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Call on mount
  const init = useCallback(() => {
    loadPersistedResult();
  }, [loadPersistedResult]);

  // Initialize once
  const initializedRef = useRef(false);
  if (!initializedRef.current) {
    initializedRef.current = true;
    init();
  }

  const saveAnalysis = useCallback(
    async (
      jobTitle: string,
      jobDescription: string,
      cvText: string,
      analysisResult: AnalysisResult,
    ) => {
      if (!user) {
        console.warn("No user authenticated, skipping save to Supabase");
        return;
      }

      // Try with user_id first, fallback to common alternatives
      const record = {
        user_id: user.id,
        job_title: jobTitle,
        job_description: jobDescription,
        cv_text: cvText,
        result: analysisResult,
        created_at: new Date().toISOString(),
      };

      let insertError;
      const { error: err1 } = await supabase.from("analyses").insert(record);
      insertError = err1;

      // If user_id column doesn't exist, try common alternatives
      if (
        insertError &&
        (insertError.code === "PGRST204" ||
          insertError.message.includes("user_id"))
      ) {
        console.warn("user_id column not found, trying userId...");
        const { error: err2 } = await supabase.from("analyses").insert({
          ...record,
          userId: user.id,
        });
        insertError = err2;
      }

      if (
        insertError &&
        (insertError.code === "PGRST204" ||
          insertError.message.includes("userId"))
      ) {
        console.warn("userId column not found, trying uid...");
        const { error: err3 } = await supabase.from("analyses").insert({
          ...record,
          uid: user.id,
        });
        insertError = err3;
      }

      if (insertError) {
        console.warn(
          "Failed to save analysis to Supabase (non-critical):",
          insertError.message,
        );
        // Don't throw - saving is non-critical
      }
    },
    [user],
  );

  const analyze = useCallback(
    async (
      cvText: string,
      jobDescription: string,
      jobTitle: string,
      lang: string,
      options?: AnalyzeOptions,
    ) => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const analysisResult = await analyzeCV(cvText, jobDescription, lang);

        // Persist result locally (non-blocking)
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              result: analysisResult,
              timestamp: Date.now(),
              jobTitle,
            }),
          );
        } catch {
          // Ignore storage errors
        }

        // Save to Supabase (non-blocking, fire-and-forget)
        saveAnalysis(jobTitle, jobDescription, cvText, analysisResult).catch(
          console.error,
        );

        setResult(analysisResult);
        options?.onSuccess?.(analysisResult);
        showToast("success", "Análisis completado");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return; // Request was cancelled, don't update state
        }

        const message =
          err instanceof Error ? err.message : "Error desconocido";
        setError(message);
        options?.onError?.(err instanceof Error ? err : new Error(message));
        showToast("error", message);
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsLoading(false);
        }
        abortControllerRef.current = null;
      }
    },
    [saveAnalysis, showToast],
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const resetResult = useCallback(() => {
    setResult(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    isLoading,
    error,
    result,
    analyze,
    cancel,
    resetResult,
  };
}
