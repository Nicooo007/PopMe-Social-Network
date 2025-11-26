import { useState, useEffect } from "react";
import CollectionsTitle from "../components/CollectionsTitle";
import CollectionCard from "../components/CollectionCard";
import CreateCollection from "./CreateCollection";
import UserCollections from "./UserCollections";
import { getCollections, likeCollection as likeCollectionAPI } from "../services/api";

interface CollectionsPageProps {
  searchQuery: string;
}

export default function CollectionsPage({ searchQuery }: CollectionsPageProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserCollections, setShowUserCollections] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
      console.error("Error loading collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: number) => {
    const collection = collections.find(c => c.id === id);
    if (!collection) return;

    try {
      await likeCollectionAPI(id, collection.likes);
      setCollections(prev =>
        prev.map(c => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
      );
    } catch (error) {
      console.error("Error liking collection:", error);
    }
  };

  const handleImageChange = (id: number) => {
    setCollections((prev) =>
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

  const filteredCollections = collections.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showUserCollections) {
    return <UserCollections onBack={() => setShowUserCollections(false)} />;
  }

  if (showCreateModal) {
    return (
      <CreateCollection
        onBack={() => {
          setShowCreateModal(false);
          loadCollections(); // Recargar después de crear
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#1B1B1F] text-white px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <CollectionsTitle />
          <p className="text-gray-400 mt-2">
            Find movie's collections that inspire you made by the community
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 mb-12">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-3 border-2 border-dashed border-[#FFC267] text-[#FFC267] rounded-lg hover:bg-[#FFC267] hover:bg-opacity-10 transition-all font-medium"
          >
            Create a collection
          </button>

          <button
            onClick={() => setShowUserCollections(true)}
            className="px-8 py-3 bg-[#FFC267] text-[#1B1B1F] rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            View your collections
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC267] mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading collections...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onLike={() => handleLike(collection.id)}
                onImageClick={() => handleImageChange(collection.id)}
              />
            ))}
          </div>
        )}

        {!loading && filteredCollections.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No collections found 😢</p>
          </div>
        )}
      </div>
    </div>
  );
  
}
