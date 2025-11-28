import { useState, useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { createCollectionAsync } from "../store/slices/collectionsSlice";
import supabase from "../supabaseClient";

type Movie = {
  id: number;
  title: string;
  poster_url: string | null;
};

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
  const [moviesDb, setMoviesDb] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);

  const filtered = moviesDb.filter((m) =>
    m.title.toLowerCase().includes(searchMovie.toLowerCase())
  );

  const handleToggleMovie = (movieId: number) => {
    setSelectedMovies((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : prev.length < 6
        ? [...prev, movieId]
        : prev
    );
  };

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoadingMovies(true);
        const { data, error } = await supabase
          .from("movies")
          .select("id, title, poster_url")
          .order("title", { ascending: true });
        if (error) throw error;
        setMoviesDb(data || []);
      } catch (err) {
        console.error("Error loading movies for collections:", err);
      } finally {
        setLoadingMovies(false);
      }
    };
    loadMovies();
  }, []);

  const handleSave = async () => {
    if (!collectionName || selectedMovies.length === 0) return;
    setIsSaving(true);

    try {
      const movies = selectedMovies; // IDs de movies

      await dispatch(
        createCollectionAsync({
          title: collectionName,
          description: "",
          movies,
          isPrivate,
        })
      ).unwrap();

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
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-700">
          <h2 className="text-3xl font-bold text-white">Create a collection</h2>
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition text-3xl"
            disabled={isSaving}
          >
            <i className="bx bx-x" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* INPUT: NAME */}
          <input
            type="text"
            placeholder="Name your collection"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            disabled={isSaving}
            className="w-full px-5 py-3 bg-[#1B1B1F] text-white border border-gray-700 rounded-xl focus:outline-none focus:border-[#FFC267] transition disabled:opacity-50"
          />

          {/* PRIVATE TOGGLE */}
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
              />
              <span className="font-semibold">Private</span>
            </button>
          </div>

          {/* SEARCH MOVIE */}
          <div className="relative">
            <input
              type="text"
              placeholder="Find a movie"
              value={searchMovie}
              onChange={(e) => setSearchMovie(e.target.value)}
              disabled={isSaving}
              className="w-full px-5 py-3 pl-12 bg-[#1B1B1F] text-white border border-gray-700 rounded-xl focus:outline-none focus:border-[#FFC267] transition disabled:opacity-50"
            />
            <i className="bx bx-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          </div>

          {/* MOVIE GRID */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Add movies to the collection
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {loadingMovies && (
                <p className="text-gray-400">Loading movies...</p>
              )}
              {!loadingMovies &&
                filtered.map((movie) => {
                  const selected = selectedMovies.includes(movie.id);
                  return (
                    <div
                      key={movie.id}
                      onClick={() => !isSaving && handleToggleMovie(movie.id)}
                      className={`rounded-xl overflow-hidden border-2 transition-all ${
                        selected
                          ? "border-[#FFC267]"
                          : "border-dashed border-gray-600"
                      } ${
                        isSaving
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }`}
                      style={{ aspectRatio: "2/3" }}
                    >
                      <img
                        src={
                          movie.poster_url ||
                          "https://placehold.co/300x450?text=No+Image"
                        }
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* FOOTER */}
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
