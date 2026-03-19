import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // The AuthContext handles token extraction from URL fragment
    // This component just shows a loading state and redirects
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t("auth.signingIn")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t("auth.pleaseWait")}
        </p>
      </div>
    </div>
  );
}
