import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { PAYMENT_API_URL } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import type { APIResponse, Donation } from "@/types";
import DonationCard from "./components/donation-card";

export default function MyDonationsPage() {
  const { isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    const fetchDonations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${PAYMENT_API_URL}/donations/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: APIResponse<Donation[]> = await response.json();

        if (data.success && data.data) {
          setDonations(data.data);
        } else {
          setError(data.error?.message || "Failed to load donations");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [authLoading, isAuthenticated, accessToken, t]);

  return (
    <div className="min-h-[100dvh] bg-background-light dark:bg-background-dark py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1b140d] dark:text-white">
              {t("myDonations.title")}
            </h1>
            <p className="text-[#9a734c] dark:text-[#c0a080] mt-1">
              {t("myDonations.subtitle")}
            </p>
          </div>
          <Link
            to="/donate"
            className="flex items-center gap-2 bg-primary hover:bg-[#d97b1f] text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">favorite</span>
            {t("common.donate")}
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-red-600 dark:text-red-300 mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="bg-white dark:bg-[#2d241d] rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && donations.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-[#9a734c]/40 mb-4 block">
              volunteer_activism
            </span>
            <h2 className="text-xl font-semibold text-[#1b140d] dark:text-white mb-2">
              {t("myDonations.emptyTitle")}
            </h2>
            <p className="text-[#9a734c] dark:text-[#c0a080] mb-6">
              {t("myDonations.emptySubtitle")}
            </p>
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 bg-primary hover:bg-[#d97b1f] text-white px-6 py-3 rounded-full font-bold transition-all"
            >
              <span className="material-symbols-outlined">favorite</span>
              {t("common.makeDonation")}
            </Link>
          </div>
        )}

        {!loading && donations.length > 0 && (
          <div className="space-y-4">
            {donations.map((donation) => (
              <DonationCard key={donation.id} donation={donation} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
