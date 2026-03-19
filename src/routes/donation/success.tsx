import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { PAYMENT_API_URL } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import type { APIResponse, Donation } from "@/types";

export default function DonationSuccessPage() {
  const { accessToken } = useAuth();
  const [searchParams] = useSearchParams();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const fetchDonation = async () => {
      if (!accessToken || !sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${PAYMENT_API_URL}/donations/session/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data: APIResponse<Donation> = await response.json();

        if (data.success && data.data) {
          setDonation(data.data);
        }
      } catch {
        console.error("Failed to fetch donation");
      } finally {
        setIsLoading(false);
      }
    };

    // Allow time for the Stripe webhook to be processed before querying
    const timer = setTimeout(fetchDonation, 2000);
    return () => clearTimeout(timer);
  }, [accessToken, sessionId]);

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-[100dvh] bg-background-light py-12 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-green-600">
            check_circle
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("donationSuccess.title")}
        </h1>
        <p className="text-gray-600 mb-8">
          {t("donationSuccess.subtitle")}
        </p>

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : donation ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <p className="text-gray-600 mb-2">{t("donationSuccess.donationAmount")}</p>
            <p className="text-3xl font-bold text-primary">
              {formatAmount(donation.amountCents)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {t("donationSuccess.statusLabel")} <span className="text-green-600 font-medium">{t("donationSuccess.statusCompleted")}</span>
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <p className="text-gray-600">
              {t("donationSuccess.processingMessage")}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <Link
            to={sessionId ? `/upload?session_id=${sessionId}` : "/upload"}
            className="block w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">cloud_upload</span>
              {t("donationSuccess.uploadPhoto")}
            </span>
          </Link>

          <Link
            to="/"
            className="block w-full py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
          >
            {t("common.returnToGallery")}
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          {t("donationSuccess.uploadLater")}
        </p>
      </div>
    </div>
  );
}
