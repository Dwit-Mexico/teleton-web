import { useTranslation } from "react-i18next";

type PostCardProps = {
  image: string;
  alt: string;
  amountDonated: number;
  className?: string;
};

export default function PostCard({
  image,
  alt,
  amountDonated,
  className = "",
}: PostCardProps) {
  const { t } = useTranslation();

  return (
    <article
      className={`min-w-75 md:min-w-87.5 max-w-100 snap-center h-full flex flex-col ${className}`}
    >
      <div className="relative group rounded-xl overflow-hidden cursor-zoom-in h-full flex-1">
        <img
          alt={alt}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          data-alt={alt}
          src={image}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <div className="flex justify-between items-center text-white">
            <span className="font-bold text-lg">Buddy</span>
            <div className="flex items-center gap-1 bg-primary text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded">
              {t("gallery.donated", { amount: amountDonated?.toFixed(2) })}
            </div>
          </div>
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="bg-white/90 backdrop-blur size-8 rounded-full flex items-center justify-center text-red-500 hover:scale-110 active:scale-90 transition-transform shadow-sm"
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: "FILL 1" }}
            >
              favorite
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
