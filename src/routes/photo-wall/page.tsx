import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useGrid } from "./grid/hooks";

export default function PhotoWallPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const [jumpInput, setJumpInput] = useState("");
  const { t } = useTranslation();

  const { state, jumpToCell } = useGrid({ canvasRef, minimapRef });

  const handleJump = (e: React.SubmitEvent) => {
    e.preventDefault();
    jumpToCell(jumpInput);
  };

  const progressPct =
    state.viewportProgress.total > 0
      ? Math.round(
          (state.viewportProgress.loaded / state.viewportProgress.total) * 100,
        )
      : 100;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#1a1008]">
      {/* Main canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab"
        style={{ touchAction: "none" }}
      />

      {/* Top-left HUD */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
        {/* Back to home */}
        <Link
          to="/"
          className="bg-black/60 backdrop-blur-sm text-white/70 hover:text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors w-fit"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          {t("common.returnToGallery")}
        </Link>

        {/* Zoom indicator */}
        <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-mono">
          {(state.zoom * 100).toFixed(0)}% &nbsp;·&nbsp;{" "}
          {state.totalPosts.toLocaleString()} {t("photoWall.posts")}
        </div>

        {/* Viewport loading progress */}
        {state.viewportProgress.total > 0 && progressPct < 100 && (
          <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
            <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-white text-xs font-mono">
              {state.viewportProgress.loaded}/{state.viewportProgress.total}
            </span>
          </div>
        )}
      </div>

      {/* Jump to cell */}
      <form
        onSubmit={handleJump}
        className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex gap-2"
      >
        <input
          type="text"
          value={jumpInput}
          onChange={(e) => setJumpInput(e.target.value)}
          placeholder={t("photoWall.jumpPlaceholder")}
          className="bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full w-28 text-center outline-none border border-white/10 focus:border-[#c97b2f] transition-colors font-mono placeholder:text-white/30"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primary-light text-white text-sm px-4 py-1.5 rounded-full font-bold transition-colors"
        >
          {t("photoWall.jumpGo")}
        </button>
      </form>

      {/* Minimap — bottom right */}
      <div className="absolute bottom-4 right-4 z-10 rounded-lg overflow-hidden shadow-lg border border-white/10">
        <canvas ref={minimapRef} width={200} height={200} />
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 z-10 text-white/40 text-xs leading-relaxed select-none">
        {t("photoWall.controlsHint")}
      </div>
    </div>
  );
}
