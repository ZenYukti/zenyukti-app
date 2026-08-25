"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Uploads directly to Supabase Storage from the browser — Supabase Storage
 * has its own, properly-configured CORS, unlike api.zenyukti.in, so this
 * doesn't need a Server Action the way the rest of this app's mutations
 * do. Only the resulting public URL is ever sent to Core, via the normal
 * profile save. Requires the "avatars" bucket + RLS policies from
 * zenyukti-os's deploy/supabase-avatars-storage.sql (a one-time, manual
 * setup step — not something this component can provision itself).
 */
export function AvatarUpload({
  authUserId,
  displayName,
  avatarUrl,
  onChange,
}: {
  authUserId: string;
  displayName: string;
  avatarUrl: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const supabase = createClient();
      // Stable path per user, upsert on so re-uploading overwrites rather
      // than accumulating orphaned files.
      const path = `${authUserId}/avatar`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      // Cache-bust so a same-URL re-upload shows immediately instead of a
      // browser-cached copy of the old image.
      onChange(`${publicUrl}?v=${Date.now()}`);
    } catch {
      setError("Upload failed. Please try again.");
      setPreview(avatarUrl);
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      await supabase.storage.from("avatars").remove([`${authUserId}/avatar`]);
      setPreview(null);
      onChange(null);
    } catch {
      setError("Couldn't remove the photo. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt={displayName}
          className="h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-xl font-medium text-muted">
          {displayName.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface disabled:opacity-50"
          >
            {uploading ? "Uploading…" : preview ? "Change photo" : "Upload photo"}
          </button>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="text-sm text-red-500 hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload profile picture"
        />
        {error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : (
          <p className="text-xs text-muted">Image, up to 5MB.</p>
        )}
      </div>
    </div>
  );
}
