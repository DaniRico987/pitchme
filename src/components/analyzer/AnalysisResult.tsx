import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { useLang } from "../../context/LangContext";
import type { AnalysisResult as AnalysisResultType } from "../../types";

type AnalysisResultProps = {
	result: AnalysisResultType;
};

export function AnalysisResult({ result }: AnalysisResultProps) {
	const [openSectionIndex, setOpenSectionIndex] = useState(0);
	const { t } = useLang();

	const scoreColorClass =
		result.score < 40
			? "text-red-600"
			: result.score < 70
				? "text-amber-500"
				: "text-green-600";

	const progressColorClass =
		result.score < 40
			? "bg-red-600"
			: result.score < 70
				? "bg-amber-500"
				: "bg-green-600";

	const normalizedScore = Math.max(0, Math.min(100, result.score));

	return (
		<div className="space-y-4">
			<div className="rounded-2xl bg-gray-50 p-6">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1">
						<p className={`text-5xl font-bold ${scoreColorClass}`}>{normalizedScore}</p>
						<div className="mt-4 h-2 w-full rounded-full bg-gray-200">
							<div
								className={`h-2 rounded-full transition-all duration-700 ${progressColorClass}`}
								style={{ width: `${normalizedScore}%` }}
							/>
						</div>
					</div>

					<div className="pt-1 text-right">
						<p className="text-lg font-medium text-gray-900">{result.scoreLabel}</p>
						<p className="text-sm text-gray-500">{t.analyze.scoreLabel}</p>
					</div>
				</div>
			</div>

			<div className="space-y-3">
				{result.sections.map((section, index) => {
					const isOpen = openSectionIndex === index;

					return (
						<div key={`${section.title}-${index}`} className="rounded-2xl border border-gray-200">
							<button
								type="button"
								onClick={() => setOpenSectionIndex(isOpen ? -1 : index)}
								className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
							>
								<div className="flex items-center gap-3">
									<Badge type={section.type} />
									<p className="font-medium text-gray-900">{section.title}</p>
								</div>

								<ChevronDown
									className={`h-4 w-4 text-gray-500 transition-transform ${
										isOpen ? "rotate-180" : "rotate-0"
									}`}
								/>
							</button>

							<div
								className={`overflow-hidden transition-all duration-300 ${
									isOpen ? "max-h-96" : "max-h-0"
								}`}
							>
								<div className="px-4 pb-4">
									<p className="text-sm text-gray-600">{section.summary}</p>

									<ul className="mt-3 space-y-2">
										{section.suggestions.map((suggestion, suggestionIndex) => (
											<li
												key={`${section.title}-suggestion-${suggestionIndex}`}
												className="flex items-start gap-2 text-sm text-gray-700"
											>
												<ArrowRight size={14} className="mt-0.5 shrink-0 text-gray-500" />
												<span>{suggestion}</span>
											</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
