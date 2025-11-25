import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar/sidebar";
import { useState } from "react";
import HomePage from "./pages/HomePage";
import CollectionsPage from "./pages/Collections";
<<<<<<< HEAD
=======
import { getPosts } from "./services/api";
import "./index.css"; // Tailwind global

interface PostData {
  id: number;
  userName: string;
  userHandle: string;
  userImage: string;
  movieTitle: string;
  year: number;
  rating: number;
  reviewText: string;
  movieImage: string;
  likes: number;
  comments: any[];
}
>>>>>>> feature/post-interactions

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
<<<<<<< HEAD

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#1B1B1F] text-white">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <header className="sticky top-0 z-10 bg-[#26242E] shadow-lg">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-[#AA0235] hover:text-[#FFC267] transition"
              >
                <i className="bx bx-menu text-3xl"></i>
              </button>
              <h1 className="text-3xl font-bold text-[#AA0235] flex-1 text-center">
                🎬 PopMe Social Network
              </h1>
              <div className="w-8"></div>
            </div>
=======
  const [activePage, setActivePage] = useState("Home");
  const [collectionsSearch, setCollectionsSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getPosts();
      setPosts(data);
      setFilteredPosts(data);
    } catch (err) {
      console.error("Error al cargar posts desde API:", err);

      fetch("/data/postData.json")
        .then((res) => res.json())
        .then((data) => {
          const postsWithLikes = data.map((post: any) => ({
            ...post,
            likes: post.likes || Math.floor(Math.random() * 200),
            comments: post.comments || [],
          }));
          setPosts(postsWithLikes);
          setFilteredPosts(postsWithLikes);
        })
        .catch((err) => console.error("Error al cargar JSON local:", err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    const lower = term.toLowerCase();
    const filtered = posts.filter((post) =>
      post.movieTitle.toLowerCase().includes(lower)
    );
    setFilteredPosts(filtered);
  };

  return (
    <div className="min-h-screen bg-[#1B1B1F] text-white">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectMenu={setActivePage}
      />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#26242E] shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#AA0235] hover:text-[#FFC267] transition"
            >
              <i className="bx bx-menu text-3xl"></i>
            </button>

            <h1 className="text-3xl font-bold text-[#AA0235] flex-1 text-center">
              🎬 PopMe Social Network
            </h1>

            <div className="w-8"></div>
          </div>

          {/* Buscadores */}
          {activePage === "Home" && <SearchBar onSearch={handleSearch} />}

          {activePage === "Collections" && (
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search"
                  value={collectionsSearch}
                  onChange={(e) => setCollectionsSearch(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-[#1B1B1F] text-white border border-gray-700 rounded-full focus:outline-none focus:border-[#FFC267] transition"
                />
                <i className="bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* Página Home */}
        {activePage === "Home" && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC267] mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading posts...</p>
              </div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Post
                  key={post.id}
                  id={post.id}
                  username={post.userName}
                  handle={post.userHandle}
                  movieTitle={post.movieTitle}
                  year={post.year}
                  review={post.reviewText}
                  rating={post.rating}
                  poster={post.movieImage}
                  popcornUrl="https://cdn-icons-png.flaticon.com/512/4221/4221419.png"
                  initialLikes={post.likes}
                  initialComments={post.comments?.length || 0}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No se encontraron resultados 😢
                </p>
              </div>
            )}
>>>>>>> feature/post-interactions
          </div>
        </header>

<<<<<<< HEAD
        <main className="max-w-4xl mx-auto px-6 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/collections" element={<CollectionsPage searchQuery="" />} />
            {/* Las otras rutas se agregarán cuando estén listas */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
=======
        {/* Página Collections */}
        {activePage === "Collections" && (
          <CollectionsPage searchQuery={collectionsSearch} />
        )}
      </main>
    </div>
>>>>>>> feature/post-interactions
  );
}