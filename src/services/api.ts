import supabase from '../supabaseClient';

// ============ POSTS ============
export const getPosts = async () => {
  const { data, error: _error } = await supabase
    .from("posts")
    .select(`
    id,
    user_id,
    movie_title,
    review_text,
    rating,
    year,
    movie_image,
    likes,
    comments_count,
    created_at,
    user:users (
      id,
      username,
      name,
      profile_image
    )
  `)
    .order("created_at", { ascending: false });

  return (data || []).map((p: any) => ({
    id: p.id,
    userId: p.user_id,                // <- nuevo
    userName: p.user?.name || p.user?.username || "Anon",
    userHandle: "@" + (p.user?.username || "anon"),
    userImage: p.user?.profile_image || "",
    movieTitle: p.movie_title,
    year: p.year,
    reviewText: p.review_text,
    rating: p.rating,
    movieImage: p.movie_image,
    likes: p.likes ?? 0,
    comments: p.comments_count ?? 0,
  }));
};

export const likePost = async (postId: number, currentLikes: number) => {
  const { data, error } = await supabase
    .from('posts')
    .update({ likes: currentLikes + 1 })
    .eq('id', postId)
    .select('likes')
    .single();

  if (error) throw error;
  return data;
};

export const unlikePost = async (postId: number, currentLikes: number) => {
  const newLikes = Math.max(0, currentLikes - 1);

  const { data, error } = await supabase
    .from('posts')
    .update({ likes: newLikes })
    .eq('id', postId)
    .select('likes')
    .single();

  if (error) throw error;
  return data;
};

// ============ COMMENTS para POSTS ============
// Recomendado: crear tabla post_comments(post_id, user_id, text, created_at)
export const getPostComments = async (postId: number) => {
  const { data, error } = await supabase
    .from('post_comments')
    .select(`
      id,
      text,
      created_at,
      user:users(id, username, name, profile_image)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const addPostComment = async (postId: number, text: string) => {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      text,
    })
    .select()
    .single();

  if (error) throw error;

  // Opcional: incrementar comments_count en posts
  await supabase
    .from('posts')
    .update({ comments_count: supabase.rpc('increment_comments', { p_id: postId }) });
  return data;
};

export const deletePost = async (postId: number) => {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", userData.user.id);

  if (error) throw error;
};


// ============ COLLECTIONS ============
export const getCollections = async () => {
  const { data, error } = await supabase
    .from("collections")
    .select(`
      id,
      title,
      description,
      movies,
      movies_count,
      is_private,
      likes,
      created_by,
      author:users!collections_author_fkey (
        id,
        name,
        username,
        profile_image
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const raw = data || [];

  const allMovieIds = Array.from(
    new Set(
      raw.flatMap((c: any) => (c.movies as number[] | null) || [])
    )
  );

  const { data: moviesData, error: moviesError } = await supabase
    .from("movies")
    .select("id, poster_url")
    .in("id", allMovieIds);

  if (moviesError) throw moviesError;

  const postersById: Record<number, string | null> = {};
  (moviesData || []).forEach((m: any) => {
    postersById[m.id] = m.poster_url;
  });



  return raw.map((c: any) => {
    const posterUrls =
      (c.movies as number[] | null)?.map((id) => postersById[id] || null).filter(Boolean) ??
      [];

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      movies: posterUrls,
      moviesCount: c.movies_count,
      isPrivate: c.is_private,
      likes: c.likes ?? 0,
      createdBy: c.created_by,                                 // <- clave
      author: c.author?.name || c.author?.username || "Unknown",
      authorAvatar: c.author?.profile_image || null,
    };
  });
};


export const createCollection = async (payload: {
  title: string;
  description?: string;
  movies: number[];
  isPrivate: boolean;
}) => {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('collections')
    .insert({
      title: payload.title,
      description: payload.description,
      movies: payload.movies,
      movies_count: payload.movies.length,
      is_private: payload.isPrivate,
      author: user.id,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const likeCollection = async (collectionId: number, currentLikes: number) => {
  const { data, error } = await supabase
    .from('collections')
    .update({ likes: currentLikes + 1 })
    .eq('id', collectionId)
    .select('likes')
    .single();

  if (error) throw error;
  return data;
};

export const unlikeCollection = async (collectionId: number, currentLikes: number) => {
  const newLikes = Math.max(0, currentLikes - 1);
  const { data, error } = await supabase
    .from("collections")
    .update({ likes: newLikes })
    .eq("id", collectionId)
    .select("likes")
    .single();
  if (error) throw error;
  return data;
};

export const deleteCollection = async (collectionId: number) => {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId);

  if (error) throw error;
};

// ============ SAVED COLLECTIONS ============
export const saveCollection = async (collectionId: number) => {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('saved_collections')
    .insert({
      collection_id: collectionId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const unsaveCollection = async (savedId: number) => {
  const { error } = await supabase
    .from('saved_collections')
    .delete()
    .eq('id', savedId);

  if (error) throw error;
};

export const getSavedCollections = async (userId: string) => {
  const { data, error } = await supabase
    .from('saved_collections')
    .select(`
      id,
      saved_at,
      collection:collections(*)
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

// ============ COMMENTS PARA POSTS ============
// Requiere una tabla post_comments en Supabase:
// CREATE TABLE post_comments (
//   id serial primary key,
//   post_id integer references posts(id) on delete cascade,
//   user_id uuid references public.users(id) on delete cascade,
//   text text,
//   created_at timestamp default now()
// );

export const getComments = async (postId: number) => {
  const { data, error } = await supabase
    .from("post_comments")
    .select(
      `
      id,
      text,
      created_at,
      user:users (
        id,
        username,
        name
      )
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Adaptar al tipo que espera CommentSection
  return (data || []).map((c: any) => ({
    id: c.id,
    userName: c.user?.name || c.user?.username || "Anon",
    userHandle: "@" + (c.user?.username || "anon"),
    text: c.text,
    createdAt: c.created_at,
  }));
};

export const addComment = async (comment: {
  postId: number;
  userName: string;    // se ignoran, los tomamos de Supabase
  userHandle: string;  // idem
  text: string;
}) => {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    throw new Error("Not authenticated");
  }

  const user = userData.user;

  const { data, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: comment.postId,
      user_id: user.id,
      text: comment.text,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

export const deleteComment = async (commentId: number) => {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    throw new Error("Not authenticated");
  }

  const userId = userData.user.id;

  // Solo puede borrar su propio comentario (ajusta según tu RLS)
  const { error } = await supabase
    .from("post_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);

  if (error) throw error;
};


// ============ COMMENTS PARA COLLECTIONS ============

export const getCollectionComments = async (collectionId: number) => {
  const { data, error } = await supabase
    .from("collection_comments")
    .select(`
      id,
      text,
      created_at,
      user:users(id, username, name, profile_image)
    `)
    .eq("collection_id", collectionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map((c: any) => ({
    id: c.id,
    userName: c.user?.name || c.user?.username || "Anon",
    userHandle: "@" + (c.user?.username || "anon"),
    text: c.text,
    createdAt: c.created_at,
    avatar: c.user?.profile_image || null,
  }));
};

export const addCollectionComment = async (collectionId: number, text: string) => {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("collection_comments")
    .insert({
      collection_id: collectionId,
      user_id: userData.user.id,
      text,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============ FOLLOWERS ============

export const followUser = async (userIdToFollow: string) => {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("followers")
    .insert({
      follower_id: userData.user.id,
      following_id: userIdToFollow,
    });

  if (error && error.code !== "23505") throw error; // ignora duplicado
};

export const unfollowUser = async (userIdToUnfollow: string) => {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("followers")
    .delete()
    .eq("follower_id", userData.user.id)
    .eq("following_id", userIdToUnfollow);

  if (error) throw error;
};

export const getFollowInfo = async (userId: string) => {
  const { data: meData, error: authError } = await supabase.auth.getUser();
  const myId = !authError && meData.user ? meData.user.id : null;

  const [{ count: followers }, { count: following }, isFollowing] =
    await Promise.all([
      supabase
        .from("followers")
        .select("id", { count: "exact", head: true })
        .eq("following_id", userId),
      supabase
        .from("followers")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", userId),
      myId
        ? supabase
          .from("followers")
          .select("id")
          .eq("follower_id", myId)
          .eq("following_id", userId)
          .maybeSingle()
        : Promise.resolve({ data: null, error: null } as any),
    ]);

  return {
    followers: followers ?? 0,
    following: following ?? 0,
    isFollowing: !!(isFollowing as any).data,
  };
};



