import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useLang } from "../context/LangContext";

export function Home() {
  const navigate = useNavigate();
  const { t } = useLang();

  return (
    <div className="mx-auto max-w-2xl px-4 pt-24 text-center">
      <div className="inline-flex rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-600">
        {t.home.badge}
      </div>

      <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-gray-900">
        <span className="block">{t.home.headline1}</span>
        <span className="block text-gray-400">{t.home.headline2}</span>
      </h1>

      <p className="mx-auto mt-4 max-w-lg text-center text-lg text-gray-500">
        {t.home.subtitle}
      </p>

      <div className="mx-auto mt-10 grid max-w-sm grid-cols-2 gap-4">
        <div className="rounded-2xl bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{t.home.stat1Value}</p>
          <p className="mt-1 text-xs text-gray-500">{t.home.stat1Label}</p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{t.home.stat2Value}</p>
          <p className="mt-1 text-xs text-gray-500">{t.home.stat2Label}</p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-xs">
        <Button className="cursor-pointer" onClick={() => navigate("/analyze")}>
          {t.home.cta}
        </Button>
      </div>

      <p className="mt-6 text-xs text-gray-400">{t.home.subCta}</p>
    </div>
  );
}

export default Home;
