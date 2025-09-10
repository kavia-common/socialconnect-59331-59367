import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPostById } from "../services/contentApi";

// PUBLIC_INTERFACE
export default function PostDetails() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchPostById(postId)
      .then((p) => mounted && setPost(p))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [postId]);

  const author = post?.author;

  return (
    <div className="p-2 md:pt-4">
      <div className="max-w-3xl mx-auto rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="aspect-square bg-gray-100 dark:bg-zinc-800">
          {post?.media?.url ? (
            <img src={post.media.url} alt={post?.caption || "Post"} className="w-full h-full object-cover" />
          ) : null}
        </div>
        <div className="p-4">
          {loading ? (
            <div className="h-5 w-40 rounded bg-gray-200 dark:bg-zinc-800 animate-pulse mb-2" />
          ) : (
            <h1 className="text-lg font-semibold mb-1">{post?.caption || "Untitled post"}</h1>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            by{" "}
            <Link to={`/u/${author?.username || "user"}`} className="text-accent">
              @{author?.username || "user"}
            </Link>
          </p>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span>♥ {post?.likeCount || 0}</span>
            <span className="ml-3">💬 {post?.commentCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
