import api from "./api";

/**
 * Content API helpers for posts, feeds, explore, and users.
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
