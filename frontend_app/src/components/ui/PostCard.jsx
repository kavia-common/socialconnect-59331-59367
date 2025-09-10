import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { likePost, unlikePost } from "../../services/contentApi";

/**
 * PostCard renders a single post thumbnail with overlay metadata.
 * Uses motion for subtle hover/tap animations.
 */
// PUBLIC_INTERFACE
export default function PostCard({ post, onLikeToggle }) {
  const [optimisticLiked, setOptimisticLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  if (!post) return null;
  const mediaUrl = post.media?.url;
  const author = post.author || {};
  const likeCount = post.likeCount || 0;
  const commentCount = post.commentCount || 0;

  const toggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (likeBusy) return;
    setLikeBusy(true);
    const next = !optimisticLiked;
    setOptimisticLiked(next);
    try {
      if (next) await likePost(post._id);
      else await unlikePost(post._id);
      onLikeToggle?.(post._id, next);
    } catch {
      setOptimisticLiked(!next);
    } finally {
      setLikeBusy(false);
    }
  };

  return (
    <Link to={`/p/${post._id}`} className="block group">
      <motion.div
        className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="aspect-square bg-gray-100 dark:bg-zinc-800 overflow-hidden">
          {mediaUrl ? (
            <img
              src={mediaUrl}
              alt={post.caption || "Post"}
              className="w-full h-full object-cover group-hover:brightness-95 transition"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
              No media
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <Link
              to={`/u/${author?.username || "user"}`}
              className="text-white/90 text-xs px-2 py-0.5 rounded bg-black/40 hover:bg-black/60"
              onClick={(e) => e.stopPropagation()}
            >
              @{author?.username || "user"}
            </Link>
            {post.caption ? (
              <span className="text-white/90 text-xs line-clamp-1 max-w-[10rem]">
                {post.caption}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLike}
              className={`text-xs px-2 py-0.5 rounded ${optimisticLiked ? "bg-rose-500 text-white" : "bg-black/40 text-white/90 hover:bg-black/60"}`}
              aria-pressed={optimisticLiked}
              disabled={likeBusy}
            >
              ♥ {likeCount + (optimisticLiked ? 1 : 0)}
            </button>
            <span className="text-white/90 text-xs bg-black/40 px-2 py-0.5 rounded">
              💬 {commentCount}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
