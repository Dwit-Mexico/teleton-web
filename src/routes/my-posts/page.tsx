import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl, POST_API_URL } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import type { APIResponse, ModerationStatus, Post } from "@/types";

const STATUS_CONFIG: Record<
  ModerationStatus,
  { icon: string; className: string; key: string }
> = {
  approved: {
    icon: "check_circle",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    key: "moderationStatus.approved",
  },
  pending: {
    icon: "schedule",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    key: "moderationStatus.pending",
  },
  under_review: {
    icon: "manage_search",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    key: "moderationStatus.underReview",
  },
  rejected: {
    icon: "cancel",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    key: "moderationStatus.rejected",
  },
};

interface EditModalProps {
  post: Post;
  onClose: () => void;
  onSaved: (updated: Post) => void;
}

function EditPostModal({ post, onClose, onSaved }: EditModalProps) {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [description, setDescription] = useState(post.description ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t("upload.errorInvalidFile"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t("upload.errorFileSize"));
      return;
    }
    setSelectedFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!accessToken) return;
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("description", description);
      if (selectedFile) formData.append("image", selectedFile);

      const response = await fetch(`${POST_API_URL}/posts/${post.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const data: APIResponse<Post> = await response.json();
      if (data.success && data.data) {
        onSaved(data.data);
      } else {
        setError(data.error?.message ?? t("upload.errorUploadFailed"));
      }
    } catch {
      setError(t("upload.errorUploadRetry"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-[#2d241d] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-lg font-bold text-[#1b140d] dark:text-white">
            {t("myPosts.editPost")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Image */}
          <div>
            <p className="text-sm font-medium text-[#1b140d] dark:text-white mb-2">
              {t("upload.petPhoto")}
            </p>
            <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-black/20 aspect-square">
              <img
                src={preview ?? getImageUrl(post.pathname)}
                alt={post.description}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 opacity-0 hover:opacity-100 transition-opacity text-white"
              >
                <span className="material-symbols-outlined text-3xl">
                  add_photo_alternate
                </span>
                <span className="text-sm font-medium">
                  {t("myPosts.changeImage")}
                </span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#1b140d] dark:text-white mb-1">
              {t("upload.descriptionLabel")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("upload.descriptionPlaceholder")}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-white/10 dark:bg-black/20 dark:text-white focus:border-primary outline-none transition-all resize-none text-sm"
            />
            <p className="text-xs text-gray-400 text-right">
              {description.length}/500
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-primary hover:bg-[#d97b1f] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="animate-spin material-symbols-outlined text-lg">
                  progress_activity
                </span>
                {t("myPosts.saving")}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">save</span>
                {t("myPosts.saveChanges")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyPostsPage() {
  const { isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    const fetchMyPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${POST_API_URL}/posts/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: APIResponse<Post[]> = await response.json();

        if (data.success && data.data) {
          setPosts(data.data);
        } else {
          setError(data.error?.message || "Failed to load posts");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [authLoading, isAuthenticated, accessToken, t]);

  const handlePostSaved = (updated: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingPost(null);
  };

  return (
    <div className="min-h-[100dvh] bg-background-light dark:bg-background-dark py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1b140d] dark:text-white">
              {t("myPosts.title")}
            </h1>
            <p className="text-[#9a734c] dark:text-[#c0a080] mt-1">
              {t("myPosts.subtitle")}
            </p>
          </div>
          <Link
            to="/donate"
            className="flex items-center gap-2 bg-primary hover:bg-[#d97b1f] text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">
              add_circle
            </span>
            {t("myPosts.newPost")}
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-red-600 dark:text-red-300 mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="bg-white dark:bg-[#2d241d] rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-[#9a734c]/40 mb-4 block">
              photo_library
            </span>
            <h2 className="text-xl font-semibold text-[#1b140d] dark:text-white mb-2">
              {t("myPosts.emptyTitle")}
            </h2>
            <p className="text-[#9a734c] dark:text-[#c0a080] mb-6">
              {t("myPosts.emptySubtitle")}
            </p>
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 bg-primary hover:bg-[#d97b1f] text-white px-6 py-3 rounded-full font-bold transition-all"
            >
              <span className="material-symbols-outlined">favorite</span>
              {t("common.donateAndUpload")}
            </Link>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const status = post.moderationStatus ?? "pending";
              const cfg = STATUS_CONFIG[status];
              const canEdit = status !== "approved";
              return (
                <div
                  key={post.id}
                  className="bg-white dark:bg-[#2d241d] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={getImageUrl(post.pathname)}
                      alt={post.description}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => setEditingPost(post)}
                        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        title={t("myPosts.editPost")}
                      >
                        <span className="material-symbols-outlined text-base">
                          edit
                        </span>
                      </button>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {cfg.icon}
                      </span>
                      {t(cfg.key)}
                    </span>
                    {post.description && (
                      <p className="text-sm text-[#1b140d] dark:text-white line-clamp-2">
                        {post.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={handlePostSaved}
        />
      )}
    </div>
  );
}
