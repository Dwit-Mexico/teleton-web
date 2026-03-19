import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function DonationCancelPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[100dvh] bg-background-light py-12 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-gray-400">
            close
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("donationCancel.title")}
        </h1>
        <p className="text-gray-600 mb-8">
          {t("donationCancel.subtitle")}
        </p>

        <div className="space-y-4">
          <Link
            to="/donate"
            className="block w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">favorite</span>
              {t("donationCancel.tryAgain")}
            </span>
          </Link>

          <Link
            to="/"
            className="block w-full py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
          >
            {t("common.returnToGallery")}
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700">
            <span className="font-medium">{t("donationCancel.needHelp")}</span> {t("donationCancel.helpMessage")}
          </p>
        </div>
      </div>
    </div>
  );
}
