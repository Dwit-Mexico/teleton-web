import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { Donation } from "@/types";

const statusStyles: Record<string, string> = {
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(cents / 100);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DonationCard({ donation }: { donation: Donation }) {
  const { t } = useTranslation();

  const canUpload =
    donation.status === "completed" && !donation.imageUploaded;

  return (
    <div className="bg-white dark:bg-[#2d241d] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-[#1b140d] dark:text-white">
            {formatAmount(donation.amountCents, donation.currency)}
          </p>
          <p className="text-sm text-[#9a734c] dark:text-[#c0a080] mt-1">
            {formatDate(donation.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {donation.imageUploaded && (
            <span
              className="material-symbols-outlined text-primary"
              title={t("myDonations.photoUploaded")}
              style={{ fontVariationSettings: "FILL 1" }}
            >
              photo_camera
            </span>
          )}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[donation.status] || statusStyles.pending}`}
          >
            {t(`donationStatus.${donation.status}`)}
          </span>
        </div>
      </div>

      {canUpload && (
        <div className="mt-4 pt-4 border-t border-[#f0e6d9] dark:border-[#3d3028]">
          <Link
            to={`/upload?session_id=${donation.stripeSessionID}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary hover:bg-[#d97b1f] text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">
              cloud_upload
            </span>
            {t("myDonations.uploadPhoto")}
          </Link>
        </div>
      )}
    </div>
  );
}
