import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

interface Movie {
    id: number;
    title: string;
    description: string;
    release_year: number;
    genre: string;
    rating: number;
    poster_url: string;
}

export default function MoviesPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from("movies")
                    .select("*")
                    .order("release_year", { ascending: false });

                if (error) throw error;
                setMovies(data);
            } catch (err) {
                console.error("Error fetching movies:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    // Insert comment into Supabase
    const submitReview = async () => {
        if (!selectedMovie) return;

        try {
            setSending(true);

            const user = (await supabase.auth.getUser()).data.user;
            if (!user) {
                alert("Debes iniciar sesión para reseñar.");
                return;
            }

            const { error } = await supabase.from("comments").insert({
                movie_id: selectedMovie.id,
                user_id: user.id,
                text: reviewText,
                rating: reviewRating
            });

            if (error) throw error;

            const { error: postError } = await supabase.from("posts").insert([
                {
                    user_id: user.id,
                    movie_title: selectedMovie.title,
                    review_title: null,
                    review_text: reviewText,
                    rating: reviewRating,
                    year: selectedMovie.release_year,
                    movie_image: selectedMovie.poster_url,
                },
            ]);

            if (postError) {
                console.error("Error creando post desde Movies:", postError);
            }

            // Cleanup + close modal
            setReviewText("");
            setReviewRating(5);
            setShowModal(false);

            alert("✔ Reseña enviada correctamente.");
        } catch (err) {
            console.error(err);
            alert("Error enviando la reseña.");
        } finally {
            setSending(false);
        }
    };

    const StarRating = ({
        rating,
        setRating
    }: {
        rating: number;
        setRating: (value: number) => void;
    }) => {
        const [hover, setHover] = useState(0);

        return (
            <div className="flex gap-2 text-3xl mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(star)}
                        className="cursor-pointer transition-all"
                        style={{
                            color:
                                star <= (hover || rating)
                                    ? "#FFC267"
                                    : "#555", // estrellas apagadas
                            transform:
                                star <= hover ? "scale(1.2)" : "scale(1.0)",
                        }}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#1B1B1F] text-white">

            {/* Header */}
            <div className="text-center py-10">
                <h1 className="text-5xl font-bold text-[#FFC267]">Movies</h1>
                <p className="text-gray-300 mt-3 text-lg max-w-xl mx-auto">
                    See all the movies available for you to review and share with your friends
                </p>
            </div>

            {/* Movie Grid */}
            <div className="max-w-6xl mx-auto px-6 pb-16">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC267] mx-auto"></div>
                        <p className="text-gray-400 mt-4">Loading movies...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                        {movies.map((movie) => (
                            <div
                                key={movie.id}
                                className="bg-[#26242E] rounded-3xl overflow-hidden shadow-xl hover:scale-[1.02] transition-all duration-200"
                            >
                                {/* Poster */}
                                <div className="relative">
                                    <img
                                        src={movie.poster_url}
                                        alt={movie.title}
                                        className="w-full h-80 object-cover"
                                    />

                                    {/* Rating badge */}
                                    <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-2">
                                        <span className="text-[#FFC267] font-bold text-lg">★</span>
                                        <span className="font-semibold">{movie.rating}</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-5">
                                    <h2 className="text-2xl font-bold">{movie.title}</h2>
                                    <p className="text-gray-400 text-sm mt-1">Genre: {movie.genre}</p>
                                    <p className="text-gray-300 mt-3 line-clamp-3">{movie.description}</p>
                                    <p className="text-gray-400 mt-2">
                                        <span className="font-semibold">Release:</span> {movie.release_year}
                                    </p>

                                    {/* Review button */}
                                    <button
                                        className="mt-5 w-full bg-[#FFC267] text-black font-semibold py-2 rounded-xl hover:bg-[#e9a952] transition"
                                        onClick={() => {
                                            setSelectedMovie(movie);
                                            setShowModal(true);
                                        }}
                                    >
                                        Review Movie
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ------------------ REVIEW MODAL ------------------ */}
            {showModal && selectedMovie && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

                    <div className="bg-[#26242E] w-full max-w-lg p-8 rounded-3xl shadow-xl">

                        <h2 className="text-3xl font-bold mb-6 text-[#FFC267]">
                            Review: {selectedMovie.title}
                        </h2>

                        {/* ⭐⭐⭐⭐ Rating con estrellas */}
                        <div>
                            <p className="text-gray-300 font-semibold mb-2">Your Rating</p>
                            <StarRating rating={reviewRating} setRating={setReviewRating} />
                        </div>

                        {/* 📝 Comentario */}
                        <label className="block mb-4">
                            <span className="text-gray-300 font-semibold">Your Review</span>
                            <textarea
                                rows={4}
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                className="mt-2 w-full px-4 py-2 rounded-lg bg-[#1B1B1F] border border-gray-600 text-white resize-none"
                                placeholder="Write your thoughts about this movie..."
                            ></textarea>
                        </label>

                        {/* Botones */}
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600"
                                onClick={() => {
                                    setReviewText("");       // limpiar
                                    setReviewRating(0);      // limpiar
                                    setShowModal(false);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                disabled={sending}
                                className="px-4 py-2 rounded-lg bg-[#FFC267] text-black font-semibold hover:bg-[#e9a952] transition disabled:opacity-50"
                                onClick={submitReview}
                            >
                                {sending ? "Sending..." : "Submit Review"}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
