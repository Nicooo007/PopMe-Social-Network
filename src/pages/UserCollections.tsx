import { useEffect, useState } from "react";
import CollectionCard from "../components/CollectionCard";
import { getCollections, likeCollection as likeCollectionAPI } from "../services/api";

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
  movies: string[];
  isPrivate: boolean;
  createdBy: string;
}

export default function UserCollections({ onBack }: UserCollectionsProps) {
  const [userCollections, setUserCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = "currentUser"; // Simula el usuario actual

  useEffect(() => {
    loadUserCollections();
  }, []);

  const loadUserCollections = async () => {
    try {
      setLoading(true);
      const data = await getCollections();
      // Filtrar solo las colecciones del usuario actual
      const filtered = data.filter((c: Collection) => c.createdBy === currentUser);
      setUserCollections(filtered);
    } catch (error) {
      console.error("Error loading user collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: number) => {
    const collection = userCollections.find(c => c.id === id);
    if (!collection) return;

    try {
      await likeCollectionAPI(id, collection.likes);
      setUserCollections(prev =>
        prev.map(c => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
      );
    } catch (error) {
      console.error("Error liking collection:", error);
    }
  };

  const handleImageChange = (id: number) => {
    setUserCollections((prev) =>
      prev.map((c) => {
        if (c.id === id && c.movies.length > 0) {
          const currentIndex = c.movies.indexOf(c.movies[0]);
          const nextIndex = (currentIndex + 1) % c.movies.length;
          const rotatedMovies = [
            ...c.movies.slice(nextIndex),
            ...c.movies.slice(0, nextIndex)
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
            <i className="bx bx-arrow-back text-2xl"></i>
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC267] mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading your collections...</p>
          </div>
        ) : userCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userCollections.map((collection) => (
              <div key={collection.id} className="relative">
                {collection.isPrivate && (
                  <div className="absolute top-4 right-4 z-10 bg-[#AA0235] text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <i className="bx bx-lock-alt mr-1"></i>
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
                    movies: collection.movies
                  }}
                  onLike={() => handleLike(collection.id)}
                  onImageClick={() => handleImageChange(collection.id)}
                  isSaved={false}
                  onSave={() => {}}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <i className="bx bx-collection text-6xl text-gray-600 mb-4"></i>
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
      </div>
    </div>
  );
}