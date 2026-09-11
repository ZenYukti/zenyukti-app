"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE_BYTES = 3 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function BannerUpload({
  authUserId,
  bannerUrl,
  onChange,
}: {
  authUserId: string;
  bannerUrl: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(bannerUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    if (!ACCEPTED_TYPES.has(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Banner image must be smaller than 3MB.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const supabase = createClient();
      const path = `${authUserId}/banner`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      onChange(`${publicUrl}?v=${Date.now()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setPreview(bannerUrl);
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (!window.confirm("Remove your ZenCard banner?")) return;

    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const { error: removeError } = await supabase.storage
        .from("avatars")
        .remove([`${authUserId}/banner`]);
      if (removeError) throw removeError;

      setPreview(null);
      onChange(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove the banner. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
        <div className="mx-auto flex aspect-[3/2] w-full max-w-[480px] overflow-hidden rounded-md border border-border bg-surface">
            {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={preview}
                alt="ZenCard banner preview"
                className="h-full w-full object-cover"
            />
            ) : (
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex h-full w-full flex-col items-center justify-center gap-1 border-2 border-dashed border-border px-4 text-center hover:bg-background disabled:opacity-50"
            >
                <span className="text-sm font-medium">Upload your ZenCard banner</span>
                <span className="text-xs text-muted">Recommended: 1200 × 800 px (3:2)</span>
                <span className="text-xs text-muted">JPG, PNG or WebP · Max 3 MB</span>
            </button>
            )}
        </div>

        <div className="mx-auto flex w-full max-w-[480px] items-center justify-between gap-3">
            <div>
            <p className="text-sm font-medium">ZenCard banner</p>
            <p className="text-xs text-muted">
                1200 × 800 px (3:2) · JPG, PNG or WebP · Max 3 MB
            </p>
            </div>

            {preview && (
            <div className="flex shrink-0 gap-2">
                <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface disabled:opacity-50"
                >
                {uploading ? "Uploading…" : "Replace"}
                </button>

                <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="rounded-md border border-red-500 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                >
                {uploading ? "Removing…" : "Remove"}
                </button>
            </div>
            )}
        </div>

        <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload ZenCard banner"
        />

        {error && <p className="mx-auto w-full max-w-[480px] text-xs text-red-500">{error}</p>}
    </div>
  );
}