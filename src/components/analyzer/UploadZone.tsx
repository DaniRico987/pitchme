import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CheckCircle2, Upload } from "lucide-react";
import { useLang } from "../../context/LangContext";

const pdfjsLib = window["pdfjs-dist/build/pdf"];

type UploadZoneProps = {
	onFileProcessed: (text: string) => void;
	isLoading: boolean;
};

type PdfTextItem = {
	str?: string;
};

type PdfPage = {
	getTextContent: () => Promise<{ items: PdfTextItem[] }>;
};

type PdfDocument = {
	numPages: number;
	getPage: (pageNumber: number) => Promise<PdfPage>;
};

type PdfJsLib = {
	GlobalWorkerOptions: { workerSrc: string };
	getDocument: (source: { data: Uint8Array }) => { promise: Promise<PdfDocument> };
};

declare global {
	interface Window {
		"pdfjs-dist/build/pdf"?: PdfJsLib;
	}
}

async function extractTextFromPdf(file: File, pdfLib: PdfJsLib): Promise<string> {

	const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (reader.result instanceof ArrayBuffer) {
				resolve(reader.result);
			} else {
				reject(new Error("Could not read PDF file."));
			}
		};
		reader.onerror = () => reject(new Error("Failed to read file contents."));
		reader.readAsArrayBuffer(file);
	});

	const pdf = await pdfLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
	const pagesText: string[] = [];

	for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
		const page = await pdf.getPage(pageNumber);
		const textContent = await page.getTextContent();
		const pageText = textContent.items
			.map((item) => item.str ?? "")
			.filter(Boolean)
			.join(" ");
		pagesText.push(pageText);
	}

	return pagesText.join("\n");
}

export function UploadZone({ onFileProcessed, isLoading }: UploadZoneProps) {
	const [fileName, setFileName] = useState<string | null>(null);
	const { t } = useLang();

	useEffect(() => {
		if (!window["pdfjs-dist/build/pdf"]) {
			const script = document.createElement("script");
			script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
			script.onload = () => {
				if (window["pdfjs-dist/build/pdf"]) {
					window["pdfjs-dist/build/pdf"].GlobalWorkerOptions.workerSrc =
						"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
				}
			};
			document.head.appendChild(script);
		} else {
			window["pdfjs-dist/build/pdf"].GlobalWorkerOptions.workerSrc =
				"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
		}
	}, []);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			const file = acceptedFiles[0];
			if (!file || isLoading) {
				return;
			}

			const activePdfJs = window["pdfjs-dist/build/pdf"] ?? pdfjsLib;
			if (!activePdfJs) {
				throw new Error("PDF parser is not loaded yet.");
			}

			const extractedText = await extractTextFromPdf(file, activePdfJs);
			setFileName(file.name);
			onFileProcessed(extractedText);
		},
		[isLoading, onFileProcessed]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { "application/pdf": [".pdf"] },
		maxFiles: 1,
		disabled: isLoading,
	});

	const activeClasses = isDragActive ? "border-black bg-gray-50" : "";
	const disabledClasses = isLoading ? "opacity-60 cursor-not-allowed" : "";

	return (
		<div
			{...getRootProps()}
			className={`border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer transition ${activeClasses} ${disabledClasses}`.trim()}
		>
			<input {...getInputProps()} />

			<div className="flex flex-col items-center gap-3">
				<Upload className="h-6 w-6 text-gray-700" />
				<p className="text-base font-medium text-gray-900">{t.upload.drag}</p>
				<p className="text-sm text-gray-500">{t.upload.sub}</p>

				{fileName ? (
					<div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm text-green-700">
						<CheckCircle2 className="h-4 w-4" />
						<span>{fileName}</span>
					</div>
				) : null}
			</div>
		</div>
	);
}
