import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getImageUrl } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import type { Post } from "@/types";
import PostCard from "../posts/card";

interface MasonryGridProps {
  posts: Post[];
  isLoading?: boolean;
  onLoadMore?: (direction: "vertical" | "horizontal") => void;
}

export default function MasonryGrid({
  posts,
  isLoading,
  onLoadMore,
}: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isNearBottom } = useScrollDirection(containerRef, 400);
  const [columnCount, setColumnCount] = useState(3);
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  // Update column count based on window width
  useEffect(() => {
    const updateColumnCount = () => {
      if (window.innerWidth < 640) setColumnCount(1);
      else if (window.innerWidth < 1024) setColumnCount(2);
      else setColumnCount(3);
    };

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  // Distribute posts into columns for vertical masonry layout
  const columns = useMemo(() => {
    const cols: Post[][] = Array.from({ length: columnCount }, () => []);

    posts.forEach((post, index) => {
      // In a real masonry, we'd check column heights, but for simplicity
      // and since it's an initial fix, we'll use modulo distribution.
      // We account for the upload card being in the first column.
      const targetCol = index % columnCount;
      cols[targetCol].push(post);
    });

    return cols;
  }, [posts, columnCount]);

  // Trigger loading when near bottom
  useEffect(() => {
    console.debug("Near bottom");
    console.debug(isNearBottom);
    if (!isLoading && onLoadMore && isNearBottom) {
      onLoadMore("vertical");
    }
  }, [isNearBottom, isLoading, onLoadMore]);

  return (
    <div
      ref={containerRef}
      className="w-full h-auto relative overflow-auto max-w-360 max-h-[90svh]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 mx-auto">
        {/* Render Columns */}
        {columns.map((column, colIndex) => (
          <div key={`col-${colIndex}`} className="flex flex-col gap-6">
            {/* Upload Card at the top of the first column */}
            {colIndex === 0 && (
              <Link
                to={isAuthenticated ? "/donate" : "#"}
                className="group relative bg-primary/5 dark:bg-primary/10 border-2 border-dashed border-primary/40 rounded-xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-primary transition-all aspect-3/4 max-w-[400px]"
              >
                <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    cloud_upload
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1b140d] dark:text-white">
                  {t("gallery.shareYourPixelDog")}
                </h3>
                <p className="text-sm text-[#9a734c] dark:text-[#c0a080] mt-2">
                  {isAuthenticated
                    ? t("gallery.uploadAndDonate")
                    : t("gallery.signInToUpload")}
                </p>
              </Link>
            )}

            {column.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <PostCard
                  image={getImageUrl(post.pathname)}
                  alt={post.description || "Post image"}
                  amountDonated={post.amountDonated}
                  className="w-full"
                />
              </motion.div>
            ))}

            {/* Skeleton items at the bottom of each column during loading */}
            {isLoading && (
              <div className="animate-pulse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden aspect-3/4 max-w-[400px]">
                <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
