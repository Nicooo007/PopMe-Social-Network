import { useEffect, useState } from "react";
import CollectionCard from "../components/CollectionCard";
import { getCollections, likeCollection as likeCollectionAPI } from "../services/api";
import supabase from "../supabaseClient";

interface UserCollectionsProps {
  onBack: () => void;
}

interface Collection {
  id: number;
  title: string;
  author: string;
  description?: string;
  likes: number;
  moviesCount: number;
  movies: string[];      // URLs de posters ya resueltas en getCollections
  isPrivate: boolean;
  createdBy: string;     // uuid del usuario
}

export default function UserCollections({ onBack }: UserCollectionsProps) {
  const [userCollections, setUserCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setCurrentUserId(data.user.id);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadUserCollections(currentUserId);
    }
  }, [currentUserId]);

  const loadUserCollections = async (userId: string) => {
    try {
      setLoading(true);
      const data = (await getCollections()) as Collection[]; // asegúrate de que getCollections devuelva createdBy
      const filtered = data.filter((c) => c.createdBy === userId);
      setUserCollections(filtered);
    } catch (error) {
      console.error("Error loading user collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: number) => {
    const collection = userCollections.find((c) => c.id === id);
    if (!collection) return;

    try {
      await likeCollectionAPI(id, collection.likes);
      setUserCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
      );
    } catch (error) {
      console.error("Error liking collection:", error);
    }
  };

  const handleImageChange = (id: number) => {
    setUserCollections((prev) =>
      prev.map((c) => {
        if (c.id === id && c.movies.length > 0) {
          const nextIndex = 1 % c.movies.length;
          const rotatedMovies = [
            ...c.movies.slice(nextIndex),
            ...c.movies.slice(0, nextIndex),
          ];
          return { ...c, movies: rotatedMovies };
        }
        return c;
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#1B1B1F] text-white px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <i className="bx bx-arrow-back text-2xl" />
            <span>Back to all collections</span>
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Your Collections</h1>
          <p className="text-gray-400">
            Manage your personal movie collections
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC267] mx-auto" />
            <p className="text-gray-400 mt-4">Loading your collections...</p>
          </div>
        ) : userCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userCollections.map((collection) => (
              <div key={collection.id} className="relative">
                {collection.isPrivate && (
                  <div className="absolute top-4 right-4 z-10 bg-[#AA0235] text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <i className="bx bx-lock-alt mr-1" />
                    Private
                  </div>
                )}

                <CollectionCard
                  collection={{
                    id: collection.id,
                    title: collection.title,
                    author: collection.author,
                    moviesCount: collection.moviesCount,
                    likes: collection.likes,
                    movies: collection.movies,
                  }}
                  onLike={() => handleLike(collection.id)}
                  onImageClick={() => handleImageChange(collection.id)}
                  isSaved={false}
                  onSave={() => {}}
                />

                <button
                  type="button"
                  className="absolute inset-0"
                  onClick={() => setSelectedCollection(collection)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <i className="bx bx-collection text-6xl text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg mb-4">
              You haven't created any collections yet
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-[#FFC267] text-[#1B1B1F] rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              Create your first collection
            </button>
          </div>
        )}

        {selectedCollection && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#26242E] rounded-3xl w-full max-w-3xl p-8 relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                onClick={() => setSelectedCollection(null)}
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold mb-2">
                {selectedCollection.title}
              </h2>
              <p className="text-gray-400 mb-4">
                Created by {selectedCollection.author} ·{" "}
                {selectedCollection.moviesCount} movies
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedCollection.movies.map((poster, idx) => (
                  <img
                    key={idx}
                    src={poster}
                    alt={`Movie ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
