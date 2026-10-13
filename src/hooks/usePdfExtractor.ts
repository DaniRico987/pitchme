import { useCallback, useEffect, useRef, useState } from "react";

interface UsePdfExtractorReturn {
  extractText: (file: File) => Promise<string>;
  isExtracting: boolean;
  error: string | null;
  progress: number; // 0-100
}

export function usePdfExtractor(): UsePdfExtractorReturn {
  const workerRef = useRef<Worker | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const requestIdRef = useRef(0);
  const pendingCallbacksRef = useRef<Map<number, (text: string) => void>>(
    new Map(),
  );
  const pendingRejectsRef = useRef<Map<number, (error: Error) => void>>(
    new Map(),
  );

  useEffect(() => {
    // Create worker
    const worker = new Worker(
      new URL("../workers/pdfExtractor.worker.ts", import.meta.url),
      {
        type: "module",
      },
    );

    worker.onmessage = (
      event: MessageEvent<{ id: number; text?: string; error?: string }>,
    ) => {
      const { id, text, error: workerError } = event.data;

      const resolve = pendingCallbacksRef.current.get(id);
      const reject = pendingRejectsRef.current.get(id);

      pendingCallbacksRef.current.delete(id);
      pendingRejectsRef.current.delete(id);

      if (workerError) {
        reject?.(new Error(workerError));
      } else if (text !== undefined) {
        resolve?.(text);
      }

      // Update progress - simple approximation
      if (pendingCallbacksRef.current.size === 0) {
        setIsExtracting(false);
        setProgress(100);
      }
    };

    worker.onerror = (err) => {
      console.error("PDF Worker error:", err);
      setError("PDF extraction worker failed");
      setIsExtracting(false);
      pendingRejectsRef.current.forEach((reject) =>
        reject(new Error("Worker error")),
      );
      pendingCallbacksRef.current.clear();
      pendingRejectsRef.current.clear();
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const extractText = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const id = ++requestIdRef.current;

      pendingCallbacksRef.current.set(id, resolve);
      pendingRejectsRef.current.set(id, reject);

      setIsExtracting(true);
      setError(null);
      setProgress(10); // Starting

      // Read file as ArrayBuffer
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          setProgress(30); // File read complete
          workerRef.current?.postMessage({ id, fileData: reader.result });
        } else {
          reject(new Error("Failed to read file as ArrayBuffer"));
          setIsExtracting(false);
        }
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
        setIsExtracting(false);
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  return { extractText, isExtracting, error, progress };
}
