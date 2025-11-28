// src/components/Feed.tsx
import { useEffect, useState } from "react";
import Post, { type PostType, mapProps } from "./Post";
import { getPosts } from "../services/api";
import supabase from "../supabaseClient";

export default function Feed() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // usuario actual
        const { data, error } = await supabase.auth.getUser();
        if (!error && data.user) {
          setCurrentUserId(data.user.id);
        }

        // posts desde la API
        const dataPosts = await getPosts();
        setPosts(dataPosts);
      } catch (e) {
        console.error("Error loading feed:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDeleteFromFeed = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1e1c24] text-gray-300">
        Loading feed...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#1e1c24] min-h-screen">
      {posts.map((post) => (
        <Post
          key={post.id}
          {...mapProps(post)}
          canDelete={currentUserId === post.userId}
          onDelete={handleDeleteFromFeed}
        />
      ))}

      {posts.length === 0 && (
        <p className="text-center text-gray-400 mt-8">
          No posts yet. Follow people or create your first review.
        </p>
      )}
    </div>
  );
}
