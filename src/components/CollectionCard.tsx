// src/components/CollectionCard.tsx
import { useState } from "react";

type Collection = {
  id: number;
  title: string;
  author: string;
  description?: string;
  moviesCount: number;
  likes: number;
  movies: string[]; // URLs de posters (las tres que apilas)
};

type Props = {
  collection: Collection;
  onLike: (liked: boolean) => void | Promise<void>;
  onImageClick: () => void;
  isSaved?: boolean;
  onSave?: () => void | Promise<void>;
};

export default function CollectionCard({
  collection,
  onLike,
  onImageClick,
  isSaved = false,
  onSave,
}: Props) {
  const [liked, setLiked] = useState(false);

  const handleLikeClick = () => {
    onLike(liked);        // le dices al padre si ya estaba likeado
    setLiked(!liked);
  };

  const handleSaveClick = () => {
    if (onSave) onSave();
  };

  return (
    <div className="bg-[#26242E] rounded-2xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300 shadow-xl">
      {/* Stack de películas */}
      <div
        className="relative h-80 cursor-pointer"
        style={{
          background: "linear-gradient(to bottom, rgb(31,41,55), #26242E)",
        }}
        onClick={onImageClick}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {collection.movies.slice(0, 3).map((movie, index) => (
            <div
              key={movie + index}
              className="absolute rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:z-30 hover:scale-110"
              style={{
                width: "180px",
                height: "260px",
                transform: `translateX(${(index - 1) * 45}px) rotate(${
                  (index - 1) * 6
                }deg)`,
                zIndex: 10 + index,
              }}
            >
              <img
                src={movie}
                alt={`Movie ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 border-4 border-white/10 rounded-xl pointer-events-none" />
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-xl font-bold mb-1 text-white">
          {collection.title}
        </h3>
        <p className="text-sm text-gray-400 mb-1">
          Created by {collection.author}
        </p>
        <p className="text-xs text-gray-500 mb-4">
          {collection.moviesCount} movies in this collection
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          {/* Like */}
          <button
            type="button"
            onClick={handleLikeClick}
            className="flex items-center gap-2 group transition-all"
          >
            <i
              className={
                "bx text-2xl transition-all " +
                (liked ? "bxs-heart text-[#FFC267] scale-110" : "bx-heart text-gray-400 group-hover:text-[#FFC267]")
              }
            />
            <span
              className={
                "text-sm font-medium " +
                (liked ? "text-[#FFC267]" : "text-gray-400")
              }
            >
              {collection.likes}
            </span>
          </button>

          {/* Save solo si onSave existe (no en colecciones propias) */}
          {onSave && (
            <button
              type="button"
              onClick={handleSaveClick}
              className={
                "px-4 py-2 rounded-lg font-medium transition-all duration-200 " +
                (isSaved
                  ? "bg-[#FFC267] text-[#1B1B1F] shadow-lg"
                  : "bg-[#1B1B1F] text-gray-400 hover:bg-[#FFC267] hover:text-[#1B1B1F] border border-gray-700")
              }
            >
              {isSaved ? "Saved" : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
