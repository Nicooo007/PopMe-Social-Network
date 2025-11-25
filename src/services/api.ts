const API_URL = 'http://localhost:3001';

// ============ POSTS ============
export const getPosts = async () => {
  const response = await fetch(`${API_URL}/posts`);
  return response.json();
};

export const likePost = async (postId: number, currentLikes: number) => {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ likes: currentLikes + 1 })
  });
  return response.json();
};

export const unlikePost = async (postId: number, currentLikes: number) => {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ likes: Math.max(0, currentLikes - 1) })
  });
  return response.json();
};

// ============ COMMENTS ============
export const getComments = async (postId: number) => {
  const response = await fetch(`${API_URL}/comments?postId=${postId}`);
  return response.json();
};

export const addComment = async (comment: {
  postId: number;
  userName: string;
  userHandle: string;
  text: string;
}) => {
  const response = await fetch(`${API_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...comment,
      createdAt: new Date().toISOString()
    })
  });
  return response.json();
};

export const deleteComment = async (commentId: number) => {
  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: 'DELETE'
  });
  return response.json();
};

// ============ COLLECTIONS ============
export const getCollections = async () => {
  const response = await fetch(`${API_URL}/collections`);
  return response.json();
};

export const createCollection = async (collection: {
  title: string;
  author: string;
  description?: string;
  moviesCount: number;
  movies: string[];
  isPrivate: boolean;
  createdBy: string;
}) => {
  const response = await fetch(`${API_URL}/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...collection,
      likes: 0,
      createdAt: new Date().toISOString()
    })
  });
  return response.json();
};

export const likeCollection = async (collectionId: number, currentLikes: number) => {
  const response = await fetch(`${API_URL}/collections/${collectionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ likes: currentLikes + 1 })
  });
  return response.json();
};

export const deleteCollection = async (collectionId: number) => {
  const response = await fetch(`${API_URL}/collections/${collectionId}`, {
    method: 'DELETE'
  });
  return response.json();
};

// ============ SAVED COLLECTIONS ============
export const saveCollection = async (collectionId: number, userId: string) => {
  const response = await fetch(`${API_URL}/savedCollections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collectionId,
      userId,
      savedAt: new Date().toISOString()
    })
  });
  return response.json();
};

export const unsaveCollection = async (savedId: number) => {
  const response = await fetch(`${API_URL}/savedCollections/${savedId}`, {
    method: 'DELETE'
  });
  return response.json();
};

export const getSavedCollections = async (userId: string) => {
  const response = await fetch(`${API_URL}/savedCollections?userId=${userId}`);
  return response.json();
};