/// <reference lib="webworker" />

import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface ExtractRequest {
  id: number;
  fileData: ArrayBuffer;
}

interface ExtractResponse {
  id: number;
  text?: string;
  error?: string;
}

self.onmessage = async (event: MessageEvent<ExtractRequest>) => {
  const { id, fileData } = event.data;

  try {
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(fileData) })
      .promise;
    const pagesText: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? (item.str ?? "") : ""))
        .filter(Boolean)
        .join(" ");
      pagesText.push(pageText);
    }

    const result: ExtractResponse = {
      id,
      text: pagesText.join("\n"),
    };

    self.postMessage(result);
  } catch (error) {
    const result: ExtractResponse = {
      id,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during PDF extraction",
    };
    self.postMessage(result);
  }
};

// Handle cleanup
self.onerror = (error) => {
  console.error("PDF Worker error:", error);
};
