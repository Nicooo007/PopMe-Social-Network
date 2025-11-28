import { useState, useEffect } from "react";
import CollectionsTitle from "../components/CollectionsTitle";
import CollectionCard from "../components/CollectionCard";
import CreateCollection from "./CreateCollection";
import UserCollections from "./UserCollections";
import supabase from "../supabaseClient";
import CollectionComments from "../components/CollectionComments";
import {
  getCollections,
  deleteCollection,
  getSavedCollections,
  unsaveCollection,
  saveCollection,
  unlikeCollection,
  likeCollection as likeCollectionAPI,
} from "../services/api";

interface CollectionsPageProps {
  searchQuery: string;
}

export default function CollectionsPage({ searchQuery }: CollectionsPageProps) {
  // STATE
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserCollections, setShowUserCollections] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCollection, setSelectedCollection] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) setCurrentUserId(data.user.id);
    };
    loadUser();
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

  useEffect(() => {
    loadCollections();
  }, []);

  // EFFECT: cargar colecciones guardadas
  useEffect(() => {
    const loadSaved = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return;
      const saved = await getSavedCollections(data.user.id);
      setSavedIds(saved.map((s: any) => s.collection.id));
    };
    loadSaved();
  }, []);

  // DETAIL MODAL
  const openDetail = (collection: any) => {
    setSelectedCollection(collection);
  };

  // LIKE / UNLIKE
  const handleLike = async (id: number, liked: boolean) => {
    const collection = collections.find((c: any) => c.id === id);
    if (!collection) return;

    try {
      if (!liked) {
        const { likes } = await likeCollectionAPI(id, collection.likes);
        setCollections((prev: any[]) =>
          prev.map((c) => (c.id === id ? { ...c, likes } : c))
        );
      } else {
        const { likes } = await unlikeCollection(id, collection.likes);
        setCollections((prev: any[]) =>
          prev.map((c) => (c.id === id ? { ...c, likes } : c))
        );
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  // SAVE / UNSAVE
  const handleToggleSave = async (collectionId: number) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      console.error("No authenticated user");
      return;
    }
    const userId = data.user.id;

    const saved = await getSavedCollections(userId);
    const row = saved.find((s: any) => s.collection.id === collectionId);

    try {
      if (!row) {
        await saveCollection(collectionId);
        setSavedIds((prev) => [...prev, collectionId]);
      } else {
        await unsaveCollection(row.id);
        setSavedIds((prev) => prev.filter((id) => id !== collectionId));
      }
    } catch (e) {
      console.error("Error toggling save:", e);
    }
  };

  // DELETE
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCollection(deleteTarget.id);
      setCollections((prev: any[]) =>
        prev.filter((c) => c.id !== deleteTarget.id)
      );
      setDeleteTarget(null);
    } catch (e) {
      console.error("Error deleting collection:", e);
    }
  };

  // CAMBIO DE IMÁGENES
  // const handleImageChange = (id: number) => {
  //   setCollections((prev) =>
  //     prev.map((c) => {
  //       if (c.id === id && c.movies.length > 0) {
  //         const next = [...c.movies.slice(1), c.movies[0]];
  //         return { ...c, movies: next };
  //       }
  //       return c;
  //     })
  //   );
  // };

  // FILTRO POR BUSCADOR
  const filteredCollections = collections.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // VISTAS ESPECIALES
  if (showUserCollections) {
    return <UserCollections onBack={() => setShowUserCollections(false)} />;
  }

  if (showCreateModal) {
    return (
      <CreateCollection
        onBack={() => {
          setShowCreateModal(false);
          loadCollections(); // recargar después de crear
        }}
      />
    );
  }

  // RENDER PRINCIPAL
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC267] mx-auto" />
            <p className="text-gray-400 mt-4">Loading collections...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCollections.map((collection) => (
              <div key={collection.id} className="relative group">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(collection)}
                  className="absolute top-4 right-4 z-20 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center
               transition-transform transition-colors duration-200
               group-hover:scale-110 group-hover:bg-red-600
               hover:scale-110 hover:bg-red-600"
                >
                  ×
                </button>

                <CollectionCard
                  collection={collection}
                  onLike={(liked) => handleLike(collection.id, liked)}
                  onImageClick={() => openDetail(collection)}
                  isSaved={
                    currentUserId && collection.createdBy !== currentUserId
                      ? savedIds.includes(collection.id)
                      : false
                  }
                  onSave={
                    currentUserId && collection.createdBy !== currentUserId
                      ? () => handleToggleSave(collection.id)
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCollections.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No collections found 😢</p>
          </div>
        )}
      </div>

      {/* MODAL DETALLE */}
      {selectedCollection && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#26242E] rounded-3xl w-full max-w-4xl p-8 relative">
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

            <div className="flex justify-center mb-6">
              <div
                className="w-64 h-96 rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => {
                  setSelectedCollection((prev: any) => {
                    if (!prev) return prev;
                    const movies = prev.movies as string[];
                    if (movies.length <= 1) return prev;
                    const next = [...movies.slice(1), movies[0]];
                    return { ...prev, movies: next };
                  });
                }}
              >
                <img
                  src={selectedCollection.movies[0]}
                  alt="Poster"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <CollectionComments collectionId={selectedCollection.id} />
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#26242E] rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete collection</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{deleteTarget.title}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
