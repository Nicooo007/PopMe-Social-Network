import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import Post from "../components/Post";
import { getPosts } from "../services/api";

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

export default function HomePage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostData[]>([]);
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
      // Fallback al JSON local si falla la API
      fetch("/data/postData.json")
        .then((res) => res.json())
        .then((data) => {
          const postsWithLikes = data.map((post: any) => ({
            ...post,
            likes: post.likes || Math.floor(Math.random() * 200),
            comments: post.comments || []
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
    <div className="space-y-6">
      <SearchBar onSearch={handleSearch} />
      
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
    </div>
  );
}