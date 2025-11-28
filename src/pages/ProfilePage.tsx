// src/pages/ProfilePage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../supabaseClient";
import { motion } from "framer-motion";
import {
  likePost,
  unlikePost,
  deletePost,
  followUser,
  unfollowUser,
} from "../services/api";
import CommentSection from "../components/CommentSection";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string | null;
  profile_image: string | null;
  bio: string | null;
  created_at: string;
}

interface UserPost {
  id: number;
  movie_title: string;
  review_title: string | null;
  review_text: string | null;
  rating: number;
  year: number | null;
  movie_image: string | null;
  likes: number;
  comments_count: number;
  created_at: string;
}

interface Stats {
  reviews: number;
  collections: number;
  saved: number;
  likes: number;
  comments: number;
  followers: number;
  following: number;
}

export default function ProfilePage() {
  const { username: usernameParam } = useParams<{ username?: string }>();

  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [stats, setStats] = useState<Stats>({
    reviews: 0,
    collections: 0,
    saved: 0,
    likes: 0,
    comments: 0,
    followers: 0,
    following: 0,
  });

  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<UserPost | null>(null);
  const [detailLiked, setDetailLiked] = useState(false);
  const [detailLikes, setDetailLikes] = useState(0);
  const [detailLiking, setDetailLiking] = useState(false);

  const [openEditor, setOpenEditor] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newYear, setNewYear] = useState<number | "">("");
  const [newRating, setNewRating] = useState<number>(5);
  const [newReview, setNewReview] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [profileFollowing, setProfileFollowing] = useState(false);
  const [profileFollowLoading, setProfileFollowLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Pre-cargar datos del usuario en editor
  useEffect(() => {
    if (!userData) return;
    setEditName(userData.name ?? "");
    setEditUsername(userData.username);
    setEditEmail(userData.email);
    setEditBio(userData.bio ?? "");
  }, [userData]);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usernameParam]);

  async function loadProfile() {
    try {
      setLoading(true);

      // Usuario autenticado
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      const authUserId =
        !authError && authData.user ? authData.user.id : null;
      setCurrentUserId(authUserId);

      let user: UserProfile | null = null;

      if (usernameParam) {
        // Perfil ajeno por username
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("username", usernameParam)
          .single();

        if (error || !data) {
          setUserData(null);
          setLoading(false);
          return;
        }
        user = data as UserProfile;
      } else {
        // Perfil propio (/profile)
        if (!authUserId) {
          setUserData(null);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUserId)
          .single();

        if (error || !data) {
          setUserData(null);
          setLoading(false);
          return;
        }
        user = data as UserProfile;
      }

      setUserData(user);
      setIsOwnProfile(authUserId === user.id);

      // Posts de este usuario
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const userPosts = (!postsError && postsData
        ? (postsData as UserPost[])
        : []) as UserPost[];

      setPosts(userPosts);

      // Stats
      const reviews = userPosts.length;

      const { count: collectionsCreated } = await supabase
        .from("collections")
        .select("id", { count: "exact", head: true })
        .eq("created_by", user.id);

      const { count: collectionsSaved } = await supabase
        .from("saved_collections")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      const likes =
        userPosts.reduce((acc, p) => acc + ((p.likes as number) ?? 0), 0) ?? 0;

      const { count: commentsCount } = await supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { count: followersCount } = await supabase
        .from("followers")
        .select("id", { count: "exact", head: true })
        .eq("following_id", user.id);

      const { count: followingCount } = await supabase
        .from("followers")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", user.id);

      setStats({
        reviews,
        collections: collectionsCreated ?? 0,
        saved: collectionsSaved ?? 0,
        likes,
        comments: commentsCount ?? 0,
        followers: followersCount ?? 0,
        following: followingCount ?? 0,
      });

      // Estado inicial de follow en perfiles ajenos
      if (authUserId && authUserId !== user.id) {
        const { data: followRow, error: followError } = await supabase
          .from("followers")
          .select("id")
          .eq("follower_id", authUserId)
          .eq("following_id", user.id)
          .maybeSingle();

        if (!followError) {
          setProfileFollowing(!!followRow);
        }
      } else {
        setProfileFollowing(false);
      }
    } catch (err) {
      console.error("Error loading profile", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteFromProfile = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setStats((prev) => ({ ...prev, reviews: Math.max(prev.reviews - 1, 0) }));
  };

  async function handleCreatePost() {
    if (!userData || !isOwnProfile) return;
    if (!newTitle.trim() || !newReview.trim()) return;

    try {
      setCreating(true);

      let imageUrl: string | null = null;

      if (newImage) {
        const ext = newImage.name.split(".").pop();
        const fileName = `${userData.id}/${Date.now()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("post-media")
          .upload(fileName, newImage, { upsert: true });

        if (uploadErr) throw uploadErr;

        const { data } = supabase.storage
          .from("post-media")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      const { error: insertError } = await supabase.from("posts").insert([
        {
          user_id: userData.id,
          movie_title: newTitle,
          review_title: null,
          review_text: newReview,
          rating: newRating,
          year: newYear === "" ? null : newYear,
          movie_image: imageUrl,
        },
      ]);

      if (insertError) throw insertError;

      setOpenCreatePost(false);
      setNewTitle("");
      setNewYear("");
      setNewRating(5);
      setNewReview("");
      setNewImage(null);
      await loadProfile();
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Could not create post.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDetailLike() {
    if (!selectedPost || detailLiking) return;
    try {
      setDetailLiking(true);
      const newLiked = !detailLiked;
      setDetailLiked(newLiked);

      let result;
      if (newLiked) {
        result = await likePost(selectedPost.id, detailLikes);
      } else {
        result = await unlikePost(selectedPost.id, detailLikes);
      }

      setDetailLikes(result.likes);
      setSelectedPost((prev) =>
        prev ? { ...prev, likes: result.likes } : prev
      );
    } catch (err) {
      console.error("Error updating like in modal:", err);
      setDetailLiked(!detailLiked);
    } finally {
      setDetailLiking(false);
    }
  }

  async function saveProfile() {
    if (!userData || !isOwnProfile) return;
    try {
      setSaving(true);

      let imageUrl = userData.profile_image ?? null;

      if (editImage) {
        const ext = editImage.name.split(".").pop();
        const fileName = `${userData.id}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(fileName, editImage, { upsert: true });

        if (!uploadErr) {
          const { data } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);
          imageUrl = data.publicUrl;
        } else {
          console.error("Error uploading avatar", uploadErr);
        }
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({
          name: editName,
          username: editUsername,
          email: editEmail,
          bio: editBio,
          profile_image: imageUrl,
        })
        .eq("id", userData.id);

      if (updateError) {
        console.error("Error updating profile", updateError);
        return;
      }

      setOpenEditor(false);
      await loadProfile();
    } catch (err) {
      console.error("Error saving profile", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white text-xl">
        Loading profile...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-400 text-xl">
        User not found
      </div>
    );
  }

  const bannerText = isOwnProfile
    ? `Hey ${userData.name || userData.username}! This is your profile`
    : `Profile of ${userData.name || userData.username}`;

  return (
    <div className="min-h-screen bg-[#0d0d16] text-white pb-20">
      {/* Banner superior */}
      <motion.div
        className="w-full bg-[#7a002f] py-6 px-10 text-xl font-semibold"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {bannerText}
      </motion.div>

      {/* Header */}
      <motion.section
        className="px-4 md:px-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="w-full bg-[#1a1a28] rounded-3xl px-6 md:px-10 py-8 flex flex-col md:flex-row gap-8 relative">
          {/* Avatar + botón editar (solo propio) */}
          <div className="flex flex-col items-center md:items-start">
            <motion.img
              src={
                userData.profile_image ||
                "https://placehold.co/200x200?text=Avatar"
              }
              alt={userData.username}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#ffdf71]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            />

            {isOwnProfile && (
              <motion.button
                onClick={() => setOpenEditor(true)}
                className="mt-4 px-6 py-2 bg-[#ffdf71] text-black font-semibold rounded-xl hover:bg-[#ffca3a] transition"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Edit Profile
              </motion.button>
            )}
          </div>

          {/* Info usuario */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold">
              {userData.name || userData.username}
            </h1>
            <p className="text-[#ffc46b] text-sm md:text-base">
              @{userData.username}
            </p>

            {userData.bio && (
              <p className="mt-3 text-gray-300 max-w-xl italic">
                {userData.bio}
              </p>
            )}

            <p className="text-xs md:text-sm mt-2 text-gray-400">
              Joined {new Date(userData.created_at).toLocaleDateString("en-US")}
            </p>

            <div className="flex flex-wrap gap-6 mt-4 text-sm md:text-base">
              <span>
                <span className="font-bold">{stats.followers}</span> followers
              </span>
              <span>
                <span className="font-bold">{stats.following}</span> following
              </span>
              <span>
                <span className="font-bold">{stats.reviews}</span> posts
              </span>
            </div>
          </div>

          {/* Botón + crear post (solo propio) */}
          {isOwnProfile && (
            <motion.button
              onClick={() => setOpenCreatePost(true)}
              className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-[#ffdf71] text-black text-2xl font-bold absolute -bottom-6 right-10 shadow-lg hover:bg-[#ffca3a]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              +
            </motion.button>
          )}

          {/* Botón Follow en perfiles ajenos */}
          {!isOwnProfile &&
            currentUserId &&
            currentUserId !== userData.id && (
              <button
                type="button"
                disabled={profileFollowLoading}
                onClick={async () => {
                  try {
                    setProfileFollowLoading(true);
                    if (profileFollowing) {
                      await unfollowUser(userData.id);
                      setProfileFollowing(false);
                      setStats((prev) => ({
                        ...prev,
                        followers: Math.max(prev.followers - 1, 0),
                      }));
                    } else {
                      await followUser(userData.id);
                      setProfileFollowing(true);
                      setStats((prev) => ({
                        ...prev,
                        followers: prev.followers + 1,
                      }));
                    }
                  } catch (err) {
                    console.error("Error updating follow in profile:", err);
                  } finally {
                    setProfileFollowLoading(false);
                  }
                }}
                className={`px-6 py-2 rounded-xl font-semibold absolute top-8 right-10 ${
                  profileFollowing
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-[#ffdf71] text-black hover:bg-[#ffca3a]"
                } disabled:opacity-60`}
              >
                {profileFollowing ? "Following" : "Follow"}
              </button>
            )}
        </div>
      </motion.section>

      {/* Últimos posts */}
      <div className="max-w-5xl mx-auto mt-14">
        <h2 className="text-2xl font-semibold mb-4">Latest posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              className="bg-[#1a1a28] p-6 rounded-3xl cursor-pointer relative"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: 0.1 + index * 0.05,
              }}
              onClick={() => {
                setSelectedPost(post);
                setDetailLiked(false);
                setDetailLikes(post.likes ?? 0);
              }}
            >
              {/* Botón borrar solo en tu propio perfil */}
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm("Delete this post?")) return;
                    try {
                      await deletePost(post.id);
                      handleDeleteFromProfile(post.id);
                    } catch (err) {
                      console.error("Error deleting post from profile:", err);
                      alert("Could not delete post.");
                    }
                  }}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg"
                  title="Delete post"
                >
                  <i className="bx bx-trash" />
                </button>
              )}

              <div className="flex items-center gap-3 mb-4">
                <img
                  src={
                    userData.profile_image ||
                    "https://placehold.co/48x48?text=U"
                  }
                  alt={userData.username}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold">{userData.name}</p>
                  <p className="text-sm text-gray-400">
                    @{userData.username}
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold">{post.movie_title}</h3>
              <p className="text-yellow-400 text-lg mt-1">
                ⭐ {post.rating}/5
              </p>

              {post.review_text && (
                <p className="text-gray-300 mt-3 line-clamp-3">
                  {post.review_text}
                </p>
              )}

              {post.movie_image && (
                <img
                  src={post.movie_image}
                  alt={post.movie_title}
                  className="rounded-xl mt-4 w-full h-64 object-cover"
                />
              )}

              <div className="flex justify-between text-gray-400 mt-4 text-sm">
                <span>{post.likes} likes</span>
                <span>{post.comments_count} comments</span>
              </div>
            </motion.div>
          ))}

          {posts.length === 0 && (
            <p className="text-gray-400">
              You have not posted any reviews yet.
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <motion.div
        className="max-w-5xl mx-auto mt-20"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h2 className="text-2xl font-semibold mb-4">Pop stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <motion.div
            className="bg-[#ffdf71] text-black p-6 rounded-2xl text-center"
            whileHover={{ scale: 1.03 }}
          >
            <h3 className="text-4xl font-bold">{stats.reviews}</h3>
            <p>Movies reviewed</p>
          </motion.div>
          <motion.div
            className="bg-[#d3194a] text-white p-6 rounded-2xl text-center"
            whileHover={{ scale: 1.03 }}
          >
            <h3 className="text-4xl font-bold">{stats.collections}</h3>
            <p>Collections created</p>
          </motion.div>
          <motion.div
            className="bg-[#ffdf71] text-black p-6 rounded-2xl text-center"
            whileHover={{ scale: 1.03 }}
          >
            <h3 className="text-4xl font-bold">{stats.saved}</h3>
            <p>Collections saved</p>
          </motion.div>
          <motion.div
            className="bg-[#d3194a] text-white p-6 rounded-2xl text-center"
            whileHover={{ scale: 1.03 }}
          >
            <h3 className="text-4xl font-bold">{stats.likes}</h3>
            <p>Reviews liked</p>
          </motion.div>
          <motion.div
            className="bg-[#ffdf71] text-black p-6 rounded-2xl text-center"
            whileHover={{ scale: 1.03 }}
          >
            <h3 className="text-4xl font-bold">{stats.comments}</h3>
            <p>Comments</p>
          </motion.div>
        </div>
      </motion.div>

      {/* MODAL EDITOR PERFIL */}
      {openEditor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            className="bg-[#1a1a28] w-full max-w-lg p-8 rounded-3xl shadow-xl text.white"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

            <label className="text-sm opacity-80">Full name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-[#0f0f19] mt-1 mb-4 w-full rounded-xl px-3 py-2 outline-none"
            />

            <label className="text-sm opacity-80">Username</label>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              className="bg-[#0f0f19] mt-1 mb-4 w-full rounded-xl px-3 py-2 outline-none"
            />

            <label className="text-sm opacity-80">Email</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="bg-[#0f0f19] mt-1 mb-4 w-full rounded-xl px-3 py-2 outline-none"
            />

            <label className="text-sm opacity-80">Bio</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="bg-[#0f0f19] w-full h-28 rounded-xl p-3 mt-1 mb-4 outline-none resize-none"
            />

            <label className="text-sm opacity-80">Profile image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setEditImage(e.target.files ? e.target.files[0] : null)
              }
              className="mt-1 mb-4"
            />

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setOpenEditor(false)}
                className="px-5 py-2 rounded-xl bg-gray-600 hover:bg-gray-500"
              >
                Cancel
              </button>
              <motion.button
                onClick={saveProfile}
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-[#ffdf71] text-black font-semibold hover:bg-[#ffca3a] disabled:opacity-60"
                whileHover={{ scale: saving ? 1 : 1.03 }}
                whileTap={{ scale: saving ? 1 : 0.97 }}
              >
                {saving ? "Saving..." : "Save"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL CREAR POST */}
      {openCreatePost && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            className="bg-[#1a1a28] w-full max-w-lg p-8 rounded-3xl shadow-xl text-white"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-bold mb-6">Create new review</h2>

            <label className="text-sm opacity-80">Movie title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-[#0f0f19] mt-1 mb-4 w-full rounded-xl px-3 py-2 outline-none"
            />

            <label className="text-sm opacity-80">Year</label>
            <input
              type="number"
              value={newYear}
              onChange={(e) =>
                setNewYear(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="bg-[#0f0f19] mt-1 mb-4 w-full rounded-xl px-3 py-2 outline-none"
            />

            <label className="text-sm opacity-80">Rating (1–5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={newRating}
              onChange={(e) => setNewRating(Number(e.target.value))}
              className="bg-[#0f0f19] mt-1 mb-4 w-full rounded-xl px-3 py-2 outline-none"
            />

            <label className="text-sm opacity-80">Review</label>
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              className="bg-[#0f0f19] w-full h-28 rounded-xl p-3 mt-1 mb-4 outline-none resize-none"
            />

            <label className="text-sm opacity-80">Poster image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewImage(e.target.files ? e.target.files[0] : null)
              }
              className="mt-1 mb-4"
            />

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setOpenCreatePost(false)}
                className="px-5 py-2 rounded-xl bg-gray-600 hover:bg-gray-500"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleCreatePost}
                disabled={creating}
                className="px-6 py-2 rounded-xl bg-[#ffdf71] text-black font-semibold hover:bg-[#ffca3a] disabled:opacity-60"
                whileHover={{ scale: creating ? 1 : 1.03 }}
                whileTap={{ scale: creating ? 1 : 0.97 }}
              >
                {creating ? "Publishing..." : "Publish"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL DETALLE DE POST */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedPost(null)}
        >
          <motion.div
            className="bg-[#1a1a28] w-full max-w-5xl p-6 md:p-8 rounded-3xl shadow-2xl text-white flex flex-col md:flex-row gap-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* COLUMNA IZQUIERDA: texto + rating + comentarios */}
            <div className="flex-1 flex flex.col">
              {/* header usuario */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={
                    userData.profile_image ||
                    "https://placehold.co/48x48?text=U"
                  }
                  alt={userData.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold text-sm md:text-base">
                    {userData.name}
                  </p>
                  <p className="text-xs text-gray-400">@{userData.username}</p>
                </div>
              </div>

              {/* título + año */}
              <h3 className="text-xl md:text-2xl font-bold">
                {selectedPost.movie_title}
              </h3>
              {selectedPost.year && (
                <p className="text-gray-400 text-sm mt-1">
                  {selectedPost.year}
                </p>
              )}

              {/* rating */}
              <p className="text-yellow-400 text-base mt-2">
                ⭐ {selectedPost.rating}/5
              </p>

              {/* review completa */}
              {selectedPost.review_text && (
                <p className="text-gray-300 mt-3 text-sm md:text-base">
                  {selectedPost.review_text}
                </p>
              )}

              {/* barra de likes/comentarios */}
              <div className="flex items-center gap-6 mt-4 text-sm border-t border-gray-700 pt-3">
                <button
                  type="button"
                  onClick={handleDetailLike}
                  disabled={detailLiking}
                  className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition disabled:opacity-60"
                >
                  <i
                    className={
                      detailLiked
                        ? "bx bxs-heart text-xl"
                        : "bx bx-heart text-xl"
                    }
                  />
                  <span>{detailLikes} likes</span>
                </button>

                <div className="flex items-center gap-2 text-gray-300">
                  <i className="bx bx-comment text-xl" />
                  <span>{selectedPost.comments_count} comments</span>
                </div>
              </div>

              {/* sección de comentarios con input */}
              <div className="mt-4 max-h-64 overflow-y-auto">
                <CommentSection
                  postId={selectedPost.id}
                  onCommentAdded={() => {
                    setSelectedPost((prev) =>
                      prev
                        ? {
                            ...prev,
                            comments_count: prev.comments_count + 1,
                          }
                        : prev
                    );
                  }}
                />
              </div>
            </div>

            {/* COLUMNA DERECHA: imagen */}
            <div className="w-full md:w-72 flex justify-center">
              {selectedPost.movie_image ? (
                <img
                  src={selectedPost.movie_image}
                  alt={selectedPost.movie_title}
                  className="w-full h-64 md:h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="w-full h-64 md:h-full rounded-2xl bg-[#111]/60 flex items-center justify-center text-gray-500 text-sm">
                  No image
                </div>
              )}
            </div>

            {/* botón cerrar en esquina */}
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text.white text-xl"
            >
              ✕
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
