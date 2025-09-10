import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMediaSignature, uploadMediaServer, createPost } from "../services/contentApi";
import { useSocketStore } from "../services/socket";
import { useAuth } from "@clerk/clerk-react";

/**
 * CreatePost: UI for uploading an image or video and creating a new post.
 * Includes:
 * - Media picker with preview (image/video)
 * - Caption, hashtags, and privacy (public/private)
 * - Form validation and error/success feedback
 * - Calls backend for media upload/signing and for creating the post
 * - On success: navigates to feed and relies on real-time event to refresh, with explicit lastEvent dispatch fallback
 */
// PUBLIC_INTERFACE
export default function CreatePost() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const setSocketEvent = useSocketStore((s) => s.addNotification);

  // Clerk route guard already protects; this is defensive.
  useEffect(() => {
    if (!isSignedIn) {
      navigate("/sign-in", { replace: true });
    }
  }, [isSignedIn, navigate]);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [mediaType, setMediaType] = useState(null); // 'image' | 'video'
  const [caption, setCaption] = useState("");
  const [hashtagsInput, setHashtagsInput] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fileInputRef = useRef(null);

  // Determine media type based on file MIME
  const detectType = (f) => {
    if (!f) return null;
    if (f.type.startsWith("image/")) return "image";
    if (f.type.startsWith("video/")) return "video";
    return null;
  };

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const kind = detectType(f);
    if (!kind) {
      setError("Unsupported file type. Please select an image or video.");
      return;
    }
    // basic client-side size limit (e.g., 25MB) for safety
    const maxBytes = 25 * 1024 * 1024;
    if (f.size > maxBytes) {
      setError("File is too large. Max size is 25 MB.");
      return;
    }
    setError("");
    setFile(f);
    setMediaType(kind);
  };

  // Build preview URL
  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const hashtags = useMemo(() => {
    const raw = hashtagsInput
      .split(/[,\s]+/)
      .map((h) => h.trim().replace(/^#/, ""))
      .filter((h) => h.length > 0);
    // Deduplicate and limit to 15
    return Array.from(new Set(raw)).slice(0, 15);
  }, [hashtagsInput]);

  const validate = () => {
    if (!file) {
      return "Please select an image or video.";
    }
    if (caption.length > 2200) {
      return "Caption exceeds 2200 characters limit.";
    }
    if (hashtags.some((h) => h.length > 100)) {
      return "One or more hashtags exceed 100 characters.";
    }
    return "";
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl("");
    setMediaType(null);
    setCaption("");
    setHashtagsInput("");
    setIsPublic(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setBusy(true);
    try {
      // Option A: server-side upload endpoint (multipart)
      const folder = "socialconnect_uploads";
      const uploadRes = await uploadMediaServer({
        file,
        folder,
        resource_type: mediaType === "video" ? "video" : "image",
        tags: hashtags.join(","),
      });

      // Normalize returned media object for CreatePostRequest.media
      const media = {
        url: uploadRes.secureUrl || uploadRes.url,
        type: mediaType === "video" ? "video" : "image",
        publicId: uploadRes.publicId,
        width: uploadRes.width,
        height: uploadRes.height,
        duration: typeof uploadRes.duration === "number" ? uploadRes.duration : undefined,
      };

      // Create post
      const payload = {
        caption: caption.trim(),
        hashtags,
        media,
        isPublic,
      };
      await createPost(payload);

      setSuccessMsg("Post created successfully!");
      // Dispatch a local socket-like event for immediate UI feedback
      setSocketEvent({ type: "post_created", message: "Your post is now live." });

      // Clear form and navigate to home/feed
      resetForm();
      // Slight delay to show the success message before navigating
      setTimeout(() => navigate("/", { replace: true }), 300);
    } catch (err) {
      const msg =
        err?.normalizedMessage ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create post. Please try again.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-2 md:pt-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold mb-3">Create a new post</h1>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Media picker/preview */}
          <section className="md:col-span-3">
            <div className="rounded-xl border border-gray-200 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-900">
              {!previewUrl ? (
                <div className="aspect-square rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Drag and drop or click to upload an image or video
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded bg-accent text-white text-sm"
                    >
                      Choose file
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={onPick}
                      className="hidden"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Max 25MB. Supported: JPG/PNG/GIF/WEBP, MP4/MOV/WEBM, etc.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-black">
                    {mediaType === "image" ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <video
                        controls
                        src={previewUrl}
                        className="w-full h-full object-contain bg-black"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl("");
                        setMediaType(null);
                      }}
                      className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-black/60 text-white hover:bg-black/80"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded border text-sm border-gray-300 dark:border-zinc-700"
                    >
                      Change file
                    </button>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {file?.name} • {(file?.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={onPick}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Form fields */}
          <section className="md:col-span-2">
            <div className="rounded-xl border border-gray-200 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-900 space-y-3">
              <div>
                <label className="block text-sm mb-1">Caption</label>
                <textarea
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={2200}
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
                  placeholder="Write a caption..."
                />
                <div className="mt-1 text-xs text-gray-500">{caption.length}/2200</div>
              </div>

              <div>
                <label className="block text-sm mb-1">Hashtags</label>
                <input
                  value={hashtagsInput}
                  onChange={(e) => setHashtagsInput(e.target.value)}
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
                  placeholder="#nature #travel or comma/space separated"
                />
                {hashtags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {hashtags.map((h) => (
                      <span
                        key={h}
                        className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
                      >
                        #{h}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">Privacy</label>
                <div className="flex items-center gap-3 text-sm">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                    />
                    <span>Public</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                    />
                    <span>Private</span>
                  </label>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded p-2"
                >
                  {error}
                </div>
              )}
              {successMsg && (
                <div
                  role="status"
                  className="text-sm text-green-700 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 rounded p-2"
                >
                  {successMsg}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-3 py-1.5 rounded border text-sm border-gray-300 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || !file}
                  className="px-4 py-1.5 rounded bg-accent text-white text-sm disabled:opacity-60"
                >
                  {busy ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
