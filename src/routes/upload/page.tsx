import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PAYMENT_API_URL, POST_API_URL } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import type { APIResponse, Donation, Post } from "@/types";

export default function UploadPage() {
  const { isAuthenticated, accessToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [isLoadingDonation, setIsLoadingDonation] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const sessionId = searchParams.get("session_id");

  const fetchDonation = useCallback(async () => {
    if (!accessToken || !sessionId) {
      setIsLoadingDonation(false);
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
      setIsLoadingDonation(false);
    }
  }, [accessToken, sessionId]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    fetchDonation();
  }, [isAuthenticated, navigate, fetchDonation]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError(t("upload.errorInvalidFile"));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(t("upload.errorFileSize"));
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !donation || !accessToken) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("donationID", donation.id);
      formData.append("description", description);

      const response = await fetch(`${POST_API_URL}/posts/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data: APIResponse<Post> = await response.json();

      if (data.success && data.data) {
        setUploadSuccess(true);
      } else {
        setError(data.error?.message || t("upload.errorUploadFailed"));
      }
    } catch {
      setError(t("upload.errorUploadRetry"));
    } finally {
      setIsUploading(false);
    }
  };

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (uploadSuccess) {
    return (
      <div className="min-h-[100dvh] bg-background-light py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-green-600">
              check_circle
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("upload.successTitle")}
          </h1>
          <p className="text-gray-600 mb-8">
            {t("upload.successSubtitle")}
          </p>

          <div className="space-y-4">
            <Link
              to="/"
              className="block w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all"
            >
              {t("upload.viewGallery")}
            </Link>

            <Link
              to="/donate"
              className="block w-full py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              {t("upload.uploadAnother")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingDonation) {
    return (
      <div className="min-h-[100dvh] bg-background-light py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">{t("upload.checkingDonation")}</p>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-[100dvh] bg-background-light py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-orange-600">
              info
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("upload.donationRequired")}
          </h1>
          <p className="text-gray-600 mb-8">
            {t("upload.donationRequiredDesc")}
          </p>

          <div className="space-y-4">
            <Link
              to="/my-donations"
              className="block w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">volunteer_activism</span>
                {t("myDonations.title")}
              </span>
            </Link>

            <Link
              to="/donate"
              className="block w-full py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">favorite</span>
                {t("common.makeDonation")}
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background-light py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-primary">
              cloud_upload
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("upload.title")}
          </h1>
          <p className="text-gray-600">
            {t("upload.subtitle")}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600">
                check_circle
              </span>
              <span className="text-green-700 font-medium">
                {t("upload.donationActive")}
              </span>
            </div>
            <span className="text-green-700 font-bold">
              {formatAmount(donation.amountCents)}
            </span>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("upload.petPhoto")}
            </label>

            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
                >
                  <span className="material-symbols-outlined text-lg">
                    close
                  </span>
                </button>
              </div>
            ) : (
              <label className="block w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <span className="material-symbols-outlined text-5xl mb-2">
                    add_photo_alternate
                  </span>
                  <p className="font-medium">{t("upload.clickToSelect")}</p>
                  <p className="text-sm">{t("upload.fileTypes")}</p>
                </div>
              </label>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("upload.descriptionLabel")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("upload.descriptionPlaceholder")}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {description.length}/500
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <span className="animate-spin material-symbols-outlined">
                  progress_activity
                </span>
                {t("upload.uploading")}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">cloud_upload</span>
                {t("upload.uploadPhoto")}
              </>
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          {t("upload.agreement")}
        </p>
      </div>
    </div>
  );
}
