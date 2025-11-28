import { useState, useEffect } from 'react';
import { getComments, addComment } from '../services/api';
import { deleteComment } from '../services/api';

interface Comment {
  id: number;
  userName: string;
  userHandle: string;
  text: string;
  createdAt: string;
}

interface CommentSectionProps {
  postId: number;
  onCommentAdded?: () => void;
  onCommentDeleted?: () => void;
}

export default function CommentSection({ postId, onCommentAdded, onCommentDeleted }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsLoading(true);
    try {
      await addComment({ postId, userName: "...", userHandle: "...", text: newComment });
      setNewComment("");
      await loadComments();
      onCommentAdded?.();              // <- importante
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm("Delete this comment?")) return;

    try {
      // Optimistic UI: borra localmente primero
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      await deleteComment(commentId);

      onCommentDeleted?.();  // avisar al Post
    } catch (error) {
      console.error("Error deleting comment:", error);
      // si quieres, recarga:
      await loadComments();
    }
  };

  return (
    <div className="mt-4 border-t border-gray-700 pt-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 bg-[#1B1B1F] text-white rounded-full border border-gray-700 focus:outline-none focus:border-[#FFC267] transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !newComment.trim()}
            className="px-6 py-2 bg-[#FFC267] text-[#1B1B1F] rounded-full font-semibold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>

      {comments.length > 0 && (
        <div className="mt-4 space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start gap-3 bg-[#1B1B1F] px-4 py-3 rounded-2xl"
            >
              <div className="w-8 h-8 rounded-full bg-[#AA0235] flex items-center justify-center text-sm font-bold">
                {comment.userName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-sm text-white">
                      {comment.userName}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {comment.userHandle}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-500 hover:text-red-500 text-xs"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-gray-200 mt-1">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}