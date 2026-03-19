import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PAYMENT_API_URL } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import type { APIResponse, CreateDonationResponse } from "@/types";

const PRESET_AMOUNTS = [100, 500, 1000, 2500, 5000];

export default function DonatePage() {
  const { isAuthenticated, accessToken } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [amountCents, setAmountCents] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const handlePresetClick = (amount: number) => {
    setAmountCents(amount);
    setIsCustom(false);
    setCustomAmount("");
    setError(null);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setIsCustom(true);
    setError(null);

    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 1) {
      setAmountCents(Math.round(parsed * 100));
    }
  };

  const handleDonate = async () => {
    if (amountCents < 100) {
      setError(t("donation.minimumDonationError"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${PAYMENT_API_URL}/donations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amountCents,
          currency: "usd",
        }),
      });

      const data: APIResponse<CreateDonationResponse> = await response.json();

      if (data.success && data.data) {
        window.location.href = data.data.checkoutURL;
      } else {
        setError(data.error?.message || t("donation.errorCreateSession"));
      }
    } catch {
      setError(t("donation.errorConnection"));
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-[100dvh] bg-background-light py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-primary">
              favorite
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("donation.title")}
          </h1>
          <p className="text-gray-600">
            {t("donation.subtitle")}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("donation.selectAmount")}
          </h2>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => handlePresetClick(amount)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  amountCents === amount && !isCustom
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {formatAmount(amount)}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("donation.customAmount")}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder={t("donation.enterAmount")}
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className={`w-full pl-8 pr-4 py-3 rounded-xl border-2 transition-all ${
                  isCustom
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 focus:border-primary"
                } outline-none`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{t("donation.minimumDonation")}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t("donation.donationAmount")}</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatAmount(amountCents)}
              </span>
            </div>
          </div>

          <button
            onClick={handleDonate}
            disabled={isLoading || amountCents < 100}
            className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin material-symbols-outlined">
                  progress_activity
                </span>
                {t("donation.processing")}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">lock</span>
                {t("donation.donateAmount", { amount: formatAmount(amountCents) })}
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            {t("donation.securePoweredByStripe")}
          </p>
        </div>

        <div className="mt-8 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">{t("donation.whatHappensNext")}</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>{t("donation.step1")}</p>
            <p>{t("donation.step2")}</p>
            <p>{t("donation.step3")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
