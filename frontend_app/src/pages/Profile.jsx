import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPostsByUsername, fetchUserProfile, updateMyProfile } from "../services/contentApi";
import MasonryGrid from "../components/ui/MasonryGrid";
import PostCard from "../components/ui/PostCard";
import { motion } from "framer-motion";

// PUBLIC_INTERFACE
export default function Profile() {
  const { username } = useParams();
  // Without custom auth store, we can't trivially know "me" username.
  // We consider viewing /u/:username as "isMe" only if backend later indicates so.
  const [isMe, setIsMe] = useState(false);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [done, setDone] = useState(false);
  const sentinelRef = useRef(null);

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const p = await fetchUserProfile(username);
      setProfile(p);
      // Backend PublicProfile may include isFollowing and can be same user
      if (p?.username && String(p.username).toLowerCase() === String(username).toLowerCase()) {
        // This only checks equality to param; a more reliable "me" flag can be added via /users/me.
        setIsMe(!!p?.isMe || false);
      }
    } catch {
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [username]);

  const loadPosts = useCallback(async () => {
    if (loadingPosts || done) return;
    setLoadingPosts(true);
    try {
      const { items, nextCursor } = await fetchPostsByUsername(username, { cursor, limit: 12 });
      setPosts((prev) => [...prev, ...items]);
      setCursor(nextCursor);
      if (!nextCursor || items.length === 0) setDone(true);
    } finally {
      setLoadingPosts(false);
    }
  }, [username, cursor, loadingPosts, done]);

  useEffect(() => {
    setPosts([]);
    setCursor(null);
    setDone(false);
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadPosts();
      }
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadPosts]);

  const [edit, setEdit] = useState({ bio: "", username: "" });

  useEffect(() => {
    if (profile && isMe) {
      setEdit({ bio: profile.bio || "", username: profile.username || "" });
    }
  }, [profile, isMe]);

  const saveProfile = async () => {
    if (!isMe) return;
    setSaving(true);
    try {
      const updated = await updateMyProfile({ bio: edit.bio, username: edit.username });
      setProfile((p) => ({ ...(p || {}), ...updated }));
      // Auth store removed; Clerk manages auth. If needed, refresh via backend or Clerk hooks.
    } catch {
      // silently ignore for now, could surface toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-2 md:pt-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile?.username || "avatar"} className="w-full h-full object-cover" />
          ) : null}
        </div>
        <div className="flex-1">
          {loadingProfile ? (
            <div className="h-6 w-40 rounded bg-gray-200 dark:bg-zinc-800 animate-pulse mb-2" />
          ) : (
            <h1 className="text-2xl font-semibold">@{profile?.username || username}</h1>
          )}
          {isMe ? (
            <div className="mt-2 space-y-2 max-w-xl">
              <div>
                <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Username</label>
                <input
                  value={edit.username}
                  onChange={(e) => setEdit((v) => ({ ...v, username: e.target.value }))}
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Bio</label>
                <textarea
                  rows={3}
                  value={edit.bio}
                  onChange={(e) => setEdit((v) => ({ ...v, bio: e.target.value }))}
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="px-3 py-1.5 rounded bg-accent text-white text-sm disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">{profile?.bio || "No bio yet."}</p>
            </div>
          )}

          {!isMe && (
            <div className="mt-3">
              <FollowButton profile={profile} />
            </div>
          )}
        </div>
      </div>

      <MasonryGrid minColumnWidth={220} gap={10}>
        {posts.map((p) => (
          <motion.div key={p._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <PostCard post={p} />
          </motion.div>
        ))}
      </MasonryGrid>
      <div ref={sentinelRef} className="h-10" />
      {loadingPosts && <div className="py-3 text-center text-sm text-gray-600 dark:text-gray-400">Loading...</div>}
      {done && posts.length > 0 && <div className="py-3 text-center text-xs text-gray-500">No more posts</div>}
    </div>
  );
}

function FollowButton({ profile }) {
  const [busy, setBusy] = useState(false);
  const [following, setFollowing] = useState(!!profile?.isFollowing);
  const username = profile?.username;

  const toggle = async () => {
    if (!username) return;
    setBusy(true);
    try {
      // optimistic toggle; backend spec: POST to follow, DELETE to unfollow
      const { default: api } = await import("../services/api");
      if (following) {
        await api.delete(`/follows/${username}`);
        setFollowing(false);
      } else {
        await api.post(`/follows/${username}`);
        setFollowing(true);
      }
    } catch {
      // revert
      setFollowing((v) => !v);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`px-3 py-1.5 rounded text-sm border ${
        following
          ? "bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
          : "bg-accent text-white border-accent"
      } disabled:opacity-60`}
    >
      {busy ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}
