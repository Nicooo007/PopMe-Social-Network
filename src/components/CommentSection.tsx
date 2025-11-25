import { useState, useEffect } from 'react';
import { getComments, addComment } from '../services/api';

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
}

export default function CommentSection({ postId, onCommentAdded }: CommentSectionProps) {
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
      await addComment({
        postId,
        userName: 'Current User',
        userHandle: '@currentuser',
        text: newComment
      });
      setNewComment('');
      await loadComments();
      onCommentAdded?.();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Could not add comment. Make sure the API server is running (npm run dev:all)');
    } finally {
      setIsLoading(false);
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
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 bg-[#1B1B1F] rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#AA0235] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">{comment.userName.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{comment.userName}</span>
                  <span className="text-xs text-gray-400">{comment.userHandle}</span>
                </div>
                <p className="text-sm text-gray-300">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}