import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ASSETS } from "@/brand.config";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./auth/AuthModal";
import { UserMenu } from "./auth/UserMenu";
import { LanguageSwitcher } from "./language-switcher";

export default function Header() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { t } = useTranslation();

  const navLinks = [
    { to: "/", label: t("nav.gallery"), className: "font-semibold" },
    {
      to: "/photo-wall",
      label: t("nav.photoWall"),
      className: "font-medium text-[#9a734c]",
    },
    {
      to: "/impact",
      label: t("nav.impact"),
      className: "font-medium text-[#9a734c]",
    },
    {
      to: "/transparency",
      label: t("nav.transparency"),
      className: "font-medium text-[#9a734c]",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-solid border-[#f3ede7] dark:border-[#2d241d] bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-360 mx-auto flex items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-3">
              <div className="text-primary flex items-center justify-center">
                <img src={ASSETS.logoUrl} alt="Teletón" className="h-8 w-8" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                {t("common.pixelDog")}
              </h1>
            </a>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(({ to, label, className }) => (
                <Link
                  key={to}
                  className={`text-sm ${className} hover:text-primary transition-colors`}
                  to={to}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9a734c] text-xl">
                search
              </span>
              <input
                className="bg-[#f3ede7] dark:bg-[#2d241d] border-none rounded-full py-2 pl-10 pr-4 text-sm w-48 lg:w-64 focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder={t("nav.searchPlaceholder")}
                type="text"
              />
            </div>

            {isAuthenticated && (
              <Link
                to="/donate"
                className="flex items-center gap-2 bg-primary hover:bg-[#d97b1f] text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">
                  add_circle
                </span>
                <span className="hidden sm:inline">
                  {t("common.donateAndUpload")}
                </span>
              </Link>
            )}

            <LanguageSwitcher />

            {/* Auth section */}
            {isLoading ? (
              <div className="size-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : isAuthenticated ? (
              <UserMenu />
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 bg-primary hover:bg-[#d97b1f] text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">login</span>
                <span className="hidden sm:inline">{t("common.signIn")}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
