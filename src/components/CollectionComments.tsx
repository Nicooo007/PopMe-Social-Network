import React, { useEffect, useState } from "react";
import { getCollectionComments, addCollectionComment } from "../services/api";

export default function CollectionComments({ collectionId }: { collectionId: number }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getCollectionComments(collectionId);
        setComments(data);
      } catch (e) {
        console.error("Error loading collection comments:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [collectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await addCollectionComment(collectionId, newComment.trim());
      setNewComment("");
      const data = await getCollectionComments(collectionId);
      setComments(data);
    } catch (e) {
      console.error("Error adding collection comment:", e);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Comments</h3>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 rounded-full bg-[#1B1B1F] border border-gray-700 text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-full bg-[#FFC267] text-black font-semibold"
        >
          Post
        </button>
      </form>

      <div className="space-y-3 max-h-48 overflow-y-auto">
        {loading && <p className="text-gray-400 text-sm">Loading comments...</p>}
        {!loading && comments.length === 0 && (
          <p className="text-gray-500 text-sm">No comments yet.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="text-sm">
            <p className="font-semibold">{c.userName} <span className="text-gray-500">{c.userHandle}</span></p>
            <p className="text-gray-200">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
