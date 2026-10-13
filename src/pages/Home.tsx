import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useLang } from "../context/LangContext";
import {
  FileText,
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
  Search,
} from "lucide-react";

export function Home() {
  const navigate = useNavigate();
  const { t } = useLang();

  const features = [
    {
      icon: FileText,
      title: t.home.feature1Title,
      desc: t.home.feature1Desc,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Search,
      title: t.home.feature2Title,
      desc: t.home.feature2Desc,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: Zap,
      title: t.home.feature3Title,
      desc: t.home.feature3Desc,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      icon: Shield,
      title: t.home.feature4Title,
      desc: t.home.feature4Desc,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-black flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">PitchMe</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/analyze")}
            >
              {t.nav.analyze}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/history")}
            >
              {t.nav.history}
            </Button>
          </div>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/analyze")}
            >
              {t.nav.analyze}
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section - Compact */}
      <main className="pt-24 pb-12 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 mb-4">
              <span
                className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"
                aria-hidden="true"
              />
              {t.home.badge}
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.2] tracking-tight text-gray-900 mb-4">
              <span className="block">{t.home.headline1}</span>
              <span className="inline-block bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent leading-normal">
                {t.home.headline2}
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base md:text-lg text-gray-500 leading-relaxed mb-8">
              {t.home.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="group w-full sm:w-auto cursor-pointer px-6 py-3.5 text-base"
                onClick={() => navigate("/analyze")}
              >
                {t.home.cta}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 py-3.5 text-base"
                onClick={() => navigate("/analyze")}
              >
                {t.home.secondaryCta}
              </Button>
            </div>

            <p className="mt-4 text-xs text-gray-400">{t.home.subCta}</p>
          </div>

          {/* Preview of Analysis Result - Compact */}
          <div className="relative mb-12">
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-green-500/10 rounded-2xl blur-2xl"
              aria-hidden="true"
            />
            <div className="relative rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-lg">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="text-center lg:text-left">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    {t.home.previewLabel}
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    {t.home.previewTitle}
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto lg:mx-0">
                    {t.home.previewDesc}
                  </p>
                </div>
                <div className="relative w-full lg:w-1/2">
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full bg-red-500"
                          aria-hidden="true"
                        />
                        <div
                          className="w-2.5 h-2.5 rounded-full bg-amber-500"
                          aria-hidden="true"
                        />
                        <div
                          className="w-2.5 h-2.5 rounded-full bg-green-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex items-center gap-0.5">
                        <div className="w-5 h-1 rounded bg-gray-200" />
                        <div className="w-5 h-1 rounded bg-gray-200" />
                        <div className="w-5 h-1 rounded bg-gray-200" />
                      </div>
                    </div>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-green-600">
                        78
                      </div>
                      <div className="mt-1.5 h-1.5 w-3/4 mx-auto rounded-full bg-gray-200">
                        <div
                          className="h-1.5 rounded-full bg-green-600"
                          style={{ width: "78%" }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="text-sm">
                          React, TypeScript, Node.js
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-red-600">
                        <span className="w-3 h-3 rounded-full border border-red-300 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        </span>
                        <span className="text-sm">
                          Kubernetes, AWS, GraphQL
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-600">
                        <Search className="h-3 w-3" />
                        <span className="text-sm">Docker, CI/CD, Testing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features - Compact */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {t.home.featuresTitle}
              </h2>
              <p className="mx-auto max-w-2xl text-gray-500 text-base">
                {t.home.featuresDesc}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                >
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${feature.bg} ${feature.color}`}
                  >
                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works - Compact */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {t.home.howItWorksTitle}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: t.home.step1Title,
                  desc: t.home.step1Desc,
                  icon: FileText,
                },
                {
                  step: "02",
                  title: t.home.step2Title,
                  desc: t.home.step2Desc,
                  icon: Search,
                },
                {
                  step: "03",
                  title: t.home.step3Title,
                  desc: t.home.step3Desc,
                  icon: CheckCircle2,
                },
              ].map((item, index) => (
                <div key={index} className="relative text-center">
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-lg mb-6">
                    {item.step}
                  </div>
                  <div className="pt-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 mb-3">
                      <item.icon
                        className="h-6 w-6 text-gray-700"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                  {index < 2 && (
                    <div
                      className="absolute top-4 left-[calc(50%+2.5rem)] w-full h-0.5 bg-gradient-to-r from-gray-200 to-transparent hidden md:block"
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Stats - Compact */}
          <section className="rounded-2xl bg-black p-6 md:p-10 text-center mb-12">
            <div className="grid grid-cols-2 gap-6 md:gap-12">
              <div>
                <p className="text-3xl md:text-5xl font-bold text-white mb-1">
                  {t.home.stat1Value}
                </p>
                <p className="text-gray-300 text-sm">{t.home.stat1Label}</p>
              </div>
              <div className="border-l border-gray-800 pl-6 md:pl-12">
                <p className="text-3xl md:text-5xl font-bold text-white mb-1">
                  {t.home.stat2Value}
                </p>
                <p className="text-gray-300 text-sm">{t.home.stat2Label}</p>
              </div>
            </div>
          </section>

          {/* Final CTA - Compact */}
          <section className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {t.home.finalCtaTitle}
            </h2>
            <p className="mx-auto max-w-2xl text-gray-500 mb-6 text-base">
              {t.home.finalCtaDesc}
            </p>
            <Button
              size="lg"
              className="cursor-pointer px-6 py-3.5 text-base"
              onClick={() => navigate("/analyze")}
            >
              {t.home.cta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="mx-auto max-w-7xl text-center text-gray-500 text-xs">
          <p>{t.home.footer}</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
