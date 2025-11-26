// src/pages/CreateCollection.tsx
import { useState } from "react";
feature/collections
import { useAppDispatch } from "../store/hooks";
import { createCollectionAsync } from "../store/slices/collectionsSlice";

import { createCollection } from "../services/api";
 main

interface CreateCollectionProps {
  onBack: () => void;
}

export default function CreateCollection({ onBack }: CreateCollectionProps) {
  const dispatch = useAppDispatch();
  const [collectionName, setCollectionName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchMovie, setSearchMovie] = useState("");
  const [selectedMovies, setSelectedMovies] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddMovie = (index: number) => {
    if (selectedMovies.includes(index)) {
      setSelectedMovies(selectedMovies.filter(i => i !== index));
    } else if (selectedMovies.length < 6) {
      setSelectedMovies([...selectedMovies, index]);
    }
  };

  const handleSave = async () => {
    if (!collectionName || selectedMovies.length === 0) return;

    setIsSaving(true);

    try {
      const moviePosters = [
        "https://m.media-amazon.com/images/I/71niXI3lxlL._AC_UF894,1000_QL80_.jpg",
        "https://i.pinimg.com/736x/7c/4a/23/7c4a23a434ef5ff58e9c51e29e4fe909.jpg",
        "https://i.pinimg.com/1200x/4c/29/d6/4c29d6753e61511d6369567214af2f53.jpg",
        "https://i.pinimg.com/736x/b7/95/44/b795447414c34b18eddc91fdea0fffef.jpg",
        "https://i.pinimg.com/736x/51/26/08/512608d675fd98fca4105f90ab7d6d5c.jpg",
        "https://i.pinimg.com/736x/61/4e/f2/614ef2b62f2ba21bc75cf0fa7f0c56c5.jpg"
      ];

      const movies = selectedMovies.map(index => moviePosters[index]);

 feature/collections
      await dispatch(createCollectionAsync({

      await createCollection({
 main
        title: collectionName,
        author: "currentUser",
        moviesCount: movies.length,
        movies,
        isPrivate,
        createdBy: "currentUser"
 feature/collections
      })).unwrap();

      });
 main

      alert(`✨ Collection "${collectionName}" created successfully!`);
      onBack();
    } catch (error) {
      console.error("Error creating collection:", error);
      alert("Error creating collection. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-6">
      <div className="bg-[#26242E] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-700">
          <h2 className="text-3xl font-bold text-white">Create a collection</h2>
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition text-3xl"
            disabled={isSaving}
          >
            <i className="bx bx-x"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          <input
            type="text"
            placeholder="Name your collection"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            disabled={isSaving}
            className="w-full px-5 py-3 bg-[#1B1B1F] text-white border border-gray-700 rounded-xl focus:outline-none focus:border-[#FFC267] transition disabled:opacity-50"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              disabled={isSaving}
              className={`flex items-center gap-3 px-5 py-2 rounded-full transition-all disabled:opacity-50 ${
                isPrivate
                  ? "bg-[#AA0235] text-white"
                  : "bg-[#1B1B1F] text-gray-400 border-2 border-gray-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-all ${
                  isPrivate ? "bg-[#FFC267]" : "bg-gray-600"
                }`}
              ></div>
              <span className="font-semibold">Private</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Find a movie"
              value={searchMovie}
              onChange={(e) => setSearchMovie(e.target.value)}
              disabled={isSaving}
              className="w-full px-5 py-3 pl-12 bg-[#1B1B1F] text-white border border-gray-700 rounded-xl focus:outline-none focus:border-[#FFC267] transition disabled:opacity-50"
            />
            <i className="bx bx-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Add movies to the collection
            </h3>

            <div className="grid grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  onClick={() => !isSaving && handleAddMovie(index)}
                  className={`rounded-xl flex items-center justify-center transition-all border-2 border-dashed ${
                    isSaving ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                  style={{
                    aspectRatio: '2/3',
                    background: selectedMovies.includes(index)
                      ? 'linear-gradient(to bottom right, #AA0235, #FFC267)'
                      : '#1B1B1F',
                    borderColor: selectedMovies.includes(index) ? '#FFC267' : '#4B5563'
                  }}
                >
                  {selectedMovies.includes(index) ? (
                    <div className="text-white text-center">
                      <i className="bx bx-check text-5xl"></i>
                      <p className="text-sm mt-2">Movie {index + 1}</p>
                    </div>
                  ) : (
                    <i className="bx bx-plus text-5xl text-[#FFC267]"></i>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-gray-700">
          <button
            onClick={handleSave}
            disabled={!collectionName || selectedMovies.length === 0 || isSaving}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              collectionName && selectedMovies.length > 0 && !isSaving
                ? "bg-[#FFC267] text-[#1B1B1F] hover:bg-opacity-90 shadow-lg"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSaving ? "Saving..." : "Save Collection"}
          </button>
        </div>
      </div>
    </div>
  );
}