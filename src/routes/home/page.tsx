import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Footer from "@/components/footer";
import MasonryGrid from "@/components/gallery/MasonryGrid";
import { POST_API_URL } from "@/constants";
import type { PaginatedResponse, Post } from "@/types";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const { t } = useTranslation();

  const fetchPosts = useCallback(
    async (cursor: string | null = null) => {
      if (loading || !hasMore) return;

      setLoading(true);
      setError(null);

      try {
        const url = cursor
          ? `${POST_API_URL}/posts?cursor=${encodeURIComponent(cursor)}`
          : `${POST_API_URL}/posts`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PaginatedResponse<Post[]> = await response.json();

        if (data.success && data.data) {
          setPosts((prev) =>
            cursor ? [...prev, ...(data.data || [])] : data.data || [],
          );
          setNextCursor(data.next_cursor);
          setHasMore(data.has_more);
        } else {
          setError("Failed to load posts");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("common.error"));
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [loading, hasMore, t],
  );

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle bidirectional loading
  const handleLoadMore = useCallback(
    (direction: "vertical" | "horizontal") => {
      console.log(`Loading more in ${direction} direction`);
      if (nextCursor && hasMore && !loading) {
        fetchPosts(nextCursor);
      }
    },
    [nextCursor, hasMore, loading, fetchPosts],
  );

  return (
    <div className="min-h-[100dvh] w-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <main className="max-w-360 mx-auto px-4 py-8 lg:px-10">
        {/* Hero Section */}
        <section className="max-w-2xl mx-auto text-center mb-12 animate-fadeIn">
          <h2 className="text-[#1b140d] dark:text-white text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            {t("home.heroTitle")}
          </h2>
          <p className="text-[#9a734c] dark:text-[#c0a080] text-lg font-medium max-w-lg mx-auto leading-relaxed">
            {t("home.heroSubtitle")}
          </p>
        </section>

        {/* Error State */}
        {error && !posts.length && (
          <div className="text-center py-12 text-slate-400">
            <h2 className="text-2xl font-semibold mb-4 text-[#1b140d] dark:text-white">
              {t("home.errorTitle")}
            </h2>
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-red-600 dark:text-red-300 max-w-md mx-auto">
              {error}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!error && posts.length === 0 && !initialLoad && (
          <div className="text-center py-12 text-slate-400">
            <h2 className="text-2xl font-semibold mb-2 text-[#1b140d] dark:text-white">
              {t("home.emptyTitle")}
            </h2>
            <p className="text-[#9a734c] dark:text-[#c0a080]">
              {t("home.emptySubtitle")}
            </p>
          </div>
        )}

        {/* Masonry Grid with Bidirectional Scroll */}
        {!error && (posts.length > 0 || initialLoad) && (
          <MasonryGrid
            posts={posts}
            isLoading={loading}
            onLoadMore={handleLoadMore}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
