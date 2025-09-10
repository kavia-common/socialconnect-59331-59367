import api from "./api";

/**
 * Content API helpers for posts, feeds, explore, users, media upload, and post creation.
 * Wrap backend REST endpoints and normalize errors.
 */

// PUBLIC_INTERFACE
export async function fetchMyFeed({ cursor = null, limit = 12 } = {}) {
  /** Fetch authenticated user's feed with optional cursor pagination. */
  const params = { limit };
  if (cursor) params.cursor = cursor;
  const res = await api.get("/posts/feed/me", { params });
  // Backend returns an array; for infinite scroll we synthesize a cursor using last _id
  const items = Array.isArray(res.data) ? res.data : [];
  const nextCursor = items.length ? items[items.length - 1]._id : null;
  return { items, nextCursor };
}

// PUBLIC_INTERFACE
export async function fetchExplore({ cursor = null, limit = 18 } = {}) {
  /** Fetch explore/public posts with optional cursor pagination. */
  const params = { limit };
  if (cursor) params.cursor = cursor;
  const res = await api.get("/posts/explore", { params });
  const items = Array.isArray(res.data) ? res.data : [];
  const nextCursor = items.length ? items[items.length - 1]._id : null;
  return { items, nextCursor };
}

// PUBLIC_INTERFACE
export async function fetchPostById(id) {
  /** Fetch a post by id */
  const res = await api.get(`/posts/${id}`);
  return res.data;
}

// PUBLIC_INTERFACE
export async function likePost(id) {
  /** Like the post with id. */
  const res = await api.post(`/posts/${id}/like`);
  return res.data;
}

// PUBLIC_INTERFACE
export async function unlikePost(id) {
  /** Unlike the post with id. */
  const res = await api.delete(`/posts/${id}/like`);
  return res.data;
}

// PUBLIC_INTERFACE
export async function fetchUserProfile(username) {
  /** Fetch a public profile by username. */
  const res = await api.get(`/users/${username}`);
  return res.data;
}

// PUBLIC_INTERFACE
export async function updateMyProfile(payload) {
  /** Update current user's profile fields. */
  const res = await api.put("/users/me/profile", payload);
  return res.data;
}

 // PUBLIC_INTERFACE
export async function fetchPostsByUsername(username, { cursor = null, limit = 12 } = {}) {
  /** Fetch posts created by a specific username. */
  const params = { limit };
  if (cursor) params.cursor = cursor;
  const res = await api.get(`/posts/by/${username}`, { params });
  const items = Array.isArray(res.data) ? res.data : [];
  const nextCursor = items.length ? items[items.length - 1]?._id : null;
  return { items, nextCursor };
}

// MEDIA

// PUBLIC_INTERFACE
export async function getMediaSignature(payload = {}) {
  /**
   * Get signed Cloudinary upload payload from backend.
   * Backend: POST /media/signature (auth required)
   */
  const res = await api.post("/media/signature", payload);
  return res.data;
}

// PUBLIC_INTERFACE
export async function uploadMediaServer({ file, folder, resource_type = "auto", public_id, tags } = {}) {
  /**
   * Upload media via server endpoint that proxies to Cloudinary.
   * Backend: POST /media/upload (multipart/form-data)
   * Returns MediaUploadResponse.
   */
  const form = new FormData();
  form.append("file", file);
  if (folder) form.append("folder", folder);
  if (public_id) form.append("public_id", public_id);
  if (resource_type) form.append("resource_type", resource_type);
  if (tags) form.append("tags", tags);

  const res = await api.post("/media/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data || {};
}

// POSTS CREATION

// PUBLIC_INTERFACE
export async function createPost(payload) {
  /**
   * Create a new post.
   * Backend: POST /posts
   * payload: { caption?, hashtags?: string[], media: { url, type, publicId?, width?, height?, duration? }, isPublic? }
   */
  const res = await api.post("/posts", payload);
  return res.data;
}
