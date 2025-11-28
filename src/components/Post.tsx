// src/components/Post.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { likePost, unlikePost, deletePost, followUser, unfollowUser } from "../services/api";
import StarRating from "./StarRating";
import CommentSection from "./CommentSection";

interface PostProps {
  id: number;
  username: string;
  handle: string;
  userImage?: string | null;
  movieTitle: string;
  year: number;
  review: string;
  rating: number;
  poster: string;
  initialLikes: number;
  initialComments?: number;
  authorId: string;
  canDelete?: boolean;
  onDelete?: (id: number) => void;
}

export interface PostType {
  id: number;
  userId: string;
  userName: string;
  userHandle: string;
  userImage: string | null;
  movieTitle: string;
  year: number;
  reviewText: string;
  rating: number;
  movieImage: string;
  likes: number;
  comments: number;
}

export function mapProps(p: PostType) {
  return {
    id: p.id,
    username: p.userName,
    handle: p.userHandle,
    userImage: p.userImage,
    movieTitle: p.movieTitle,
    year: p.year,
    review: p.reviewText,
    rating: p.rating,
    poster: p.movieImage,  
    initialLikes: p.likes,
    initialComments: p.comments,
    authorId: p.userId,
  };
}

export default function Post({
  id,
  username,
  handle,
  userImage,
  movieTitle,
  year,
  review,
  rating,
  poster,
  initialLikes,
  authorId,
  initialComments = 0,
  canDelete = false,
  onDelete,
}: PostProps) {
  const navigate = useNavigate();

  const [isFollowing, setIsFollowing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(initialComments);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleFollow = async () => {
    if (!authorId) return;

    const newState = !isFollowing;
    setIsFollowing(newState);

    try {
      if (newState) {
        await followUser(authorId);
      } else {
        await unfollowUser(authorId);
      }
    } catch (err) {
      console.error("Error updating follow:", err);
      // revertir estado si falla
      setIsFollowing(!newState);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    const newLikedState = !liked;
    setLiked(newLikedState);

    try {
      if (newLikedState) {
        const result = await likePost(id, likeCount);
        setLikeCount(result.likes);
      } else {
        const result = await unlikePost(id, likeCount);
        setLikeCount(result.likes);
      }
    } catch (error) {
      console.error("Error updating like:", error);
      setLiked(!newLikedState);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => setShowShareMenu(!showShareMenu);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
    setShowShareMenu(false);
  };

  const handleShareTwitter = () => {
    const text = `Check out this review of ${movieTitle}!`;
    const url = `${window.location.origin}/post/${id}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
    setShowShareMenu(false);
  };

  const goToProfile = () => {
    const usernameSlug = handle.startsWith("@") ? handle.slice(1) : handle;
    navigate(`/profile/${usernameSlug}`);
  };

  const handleDeletePost = async () => {
    if (!canDelete) return;
    if (!confirm("Delete this post?")) return;
    try {
      setDeleting(true);
      await deletePost(id);
      onDelete?.(id);
    } catch (e) {
      console.error("Error deleting post:", e);
      setDeleting(false);
    }
  };

  return (
    <div className="bg-[#26242E] rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <div className="flex gap-6">
        <div className="flex-1">
          {/* Header: usuario + follow + delete */}
          <div className="flex justify-between items-start mb-4">
            <button
              type="button"
              onClick={goToProfile}
              className="flex items-center gap-3 text-left"
            >
              {userImage ? (
                <img
                  src={userImage}
                  alt={username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#AA0235]"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#AA0235] to-[#FFC267] p-0.5">
                  <div className="w-full h-full rounded-full bg-[#26242E] flex items-center justify-center">
                    <span className="text-xl font-bold text-[#AA0235]">
                      {username.charAt(0)}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <h2 className="font-semibold text-lg">{username}</h2>
                <p className="text-sm text-gray-400">{handle}</p>
              </div>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleFollow}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${isFollowing
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-[#AA0235] text-white hover:bg-[#8a0228]"
                  }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>

              {canDelete && (
                <button
                  type="button"
                  onClick={handleDeletePost}
                  disabled={deleting}
                  className="text-gray-500 hover:text-red-500 text-xl disabled:opacity-50"
                  title="Delete post"
                >
                  <i className="bx bx-trash" />
                </button>
              )}
            </div>
          </div>

          {/* Contenido del post */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold mb-2 text-[#FFC267]">
              {movieTitle}{" "}
              <span className="text-gray-400 text-xl">({year})</span>
            </h3>
            <p className="text-gray-300 leading-relaxed mb-3">{review}</p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-2">
              <StarRating initialRating={rating} readOnly={true} />
              <span className="text-sm text-gray-400">{rating}/5</span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-6 pt-4 border-t border-gray-700">
            {/* Like */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className="flex items-center gap-2 group disabled:opacity-50"
            >
              <i
                className={
                  "bx text-2xl transition-all " +
                  (liked
                    ? "bxs-heart text-red-500 scale-110"
                    : "bx-heart text-gray-400 group-hover:text-red-500")
                }
              />
              <span className="text-sm text-gray-400">{likeCount}</span>
            </button>

            {/* Comments */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 group"
            >
              <i
                className={
                  "bx text-2xl transition-colors " +
                  (showComments
                    ? "bxs-comment text-[#FFC267]"
                    : "bx-comment text-gray-400 group-hover:text-[#FFC267]")
                }
              />
              <span className="text-sm text-gray-400">{commentCount}</span>
            </button>

            {/* Share */}
            <div className="relative">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 group"
              >
                <i className="bx bx-share text-2xl text-gray-400 group-hover:text-[#FFC267] transition-colors" />
                <span className="text-sm text-gray-400">Share</span>
              </button>

              {showShareMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-[#1B1B1F] rounded-lg shadow-xl border border-gray-700 p-2 min-w-[150px] z-10">
                  <button
                    onClick={handleCopyLink}
                    className="w-full text-left px-3 py-2 hover:bg-[#26242E] rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    <i className="bx bx-link text-lg" />
                    Copy link
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    className="w-full text-left px-3 py-2 hover:bg-[#26242E] rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    <i className="bx bxl-twitter text-lg" />
                    Share on X
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comentarios */}
          {showComments && (
            <div className="mt-4">
              <CommentSection
                postId={id}
                onCommentAdded={() => setCommentCount((prev) => prev + 1)}
                onCommentDeleted={() =>
                  setCommentCount((prev) => Math.max(prev - 1, 0))
                }
              />
            </div>
          )}
        </div>

        {/* Poster */}
        <div className="w-48 h-72 shrink-0 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
          <img
            src={poster}
            alt={movieTitle}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
