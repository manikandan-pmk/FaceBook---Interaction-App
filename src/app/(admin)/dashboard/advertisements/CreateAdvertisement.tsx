"use client";

import { useState } from "react";
import api from "@/lib/api";
import {
  Plus,
  Image as ImageIcon,
  Video,
  MonitorPlay,
  Film,
  X,
  Loader2,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";

type AdvertisementType = "IMAGE" | "GIF" | "VIDEO" | "YOUTUBE";

const INITIAL_FORM = {
  name: "",
  description: "",
  type: "IMAGE" as AdvertisementType,
  mediaUrl: "",
  thumbnail: "",
  displayOrder: 0,
  startDate: "",
  endDate: "",
};

const TYPE_OPTIONS: {
  value: AdvertisementType;
  label: string;
  icon: typeof ImageIcon;
}[] = [
  { value: "IMAGE", label: "Image", icon: ImageIcon },
  { value: "GIF", label: "GIF", icon: Film },
  { value: "VIDEO", label: "Video", icon: Video },
  { value: "YOUTUBE", label: "YouTube", icon: MonitorPlay },
];

interface CreateAdvertisementProps {
  onCancel: () => void;
  onCreated: () => Promise<void> | void;
}

export default function CreateAdvertisement({
  onCancel,
  onCreated,
}: CreateAdvertisementProps) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Advertisement name is required");
      return;
    }

    if (form.type === "YOUTUBE" && !form.mediaUrl.trim()) {
      setError("YouTube URL is required");
      return;
    }

    if (form.type !== "YOUTUBE" && !mediaFile) {
      setError("Please select an advertisement file");
      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.startDate) > new Date(form.endDate)
    ) {
      setError("End date must be after start date");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("type", form.type);
      formData.append("displayOrder", String(form.displayOrder));
      formData.append("thumbnail", form.thumbnail.trim());

      if (form.type === "YOUTUBE") {
        formData.append("mediaUrl", form.mediaUrl.trim());
      } else if (mediaFile) {
        formData.append("media", mediaFile);
      }

      formData.append(
        "startDate",
        form.startDate ? new Date(form.startDate).toISOString() : ""
      );
      formData.append(
        "endDate",
        form.endDate ? new Date(form.endDate).toISOString() : ""
      );

      await api.post("/api/v1/advertisements", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await onCreated();
    } catch (err) {
      const message = (err as any)?.response?.data?.message;
      setError(message || (err instanceof Error ? err.message : "Failed to create advertisement"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTypeChange = (type: AdvertisementType) => {
    setForm((prev) => ({ ...prev, type, mediaUrl: "", thumbnail: "" }));
    setMediaFile(null);
  };

  const accept =
    form.type === "IMAGE"
      ? "image/png,image/jpeg,image/webp"
      : form.type === "GIF"
        ? "image/gif"
        : "video/mp4,video/webm,video/quicktime";

  return (
    <div className="mb-7 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-bold text-slate-900">Create New Advertisement</h2>
          <p className="mt-1 text-xs text-slate-500">
            New advertisements will be created as inactive.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          aria-label="Close form"
        >
          <X size={19} />
        </button>
      </div>

      <form onSubmit={handleCreate} className="space-y-5 p-5">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Advertisement Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter advertisement name"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Enter advertisement description"
            className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Advertisement Type *
          </label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {TYPE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const selected = form.type === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleTypeChange(option.value)}
                  className={`flex items-center justify-center gap-2 rounded-lg border p-4 text-sm font-semibold transition ${
                    selected
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={19} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {form.type === "YOUTUBE" ? "YouTube Video URL *" : "Upload Advertisement File *"}
          </label>
          {form.type === "YOUTUBE" ? (
            <input
              type="url"
              required
              value={form.mediaUrl}
              onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          ) : (
            <input
              type="file"
              required
              accept={accept}
              onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-orange-600"
            />
          )}
          <p className="mt-1 text-xs text-slate-400">
            {form.type === "IMAGE"
              ? "PNG, JPG or WebP image. Maximum 5 MB."
              : form.type === "GIF"
                ? "GIF file only. Maximum 5 MB."
                : form.type === "VIDEO"
                  ? "MP4, WebM or MOV video. Maximum 15 MB."
                  : "Paste a valid YouTube video URL."}
          </p>
          {mediaFile && form.type !== "YOUTUBE" && (
            <p className="mt-2 text-sm text-green-600">
              Selected: {mediaFile.name} ({(mediaFile.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>

        {(form.type === "VIDEO" || form.type === "YOUTUBE") && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Thumbnail URL (optional)
            </label>
            <input
              type="url"
              value={form.thumbnail}
              onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
              placeholder="https://example.com/thumbnail.jpg"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Display Order
          </label>
          <input
            type="number"
            min="0"
            value={form.displayOrder}
            onChange={(e) =>
              setForm({ ...form, displayOrder: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 md:w-1/2"
          />
          <p className="mt-1 text-xs text-slate-400">Lower numbers appear first.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              <Calendar size={15} className="mr-1 inline" /> Start Date
            </label>
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              <Calendar size={15} className="mr-1 inline" /> End Date
            </label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <Clock size={19} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Admin approval required</p>
            <p className="mt-1 text-xs text-amber-700">
              This advertisement will be created as inactive. Activate it manually before it becomes visible to users.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {submitting ? (
              <><Loader2 size={17} className="animate-spin" /> Creating...</>
            ) : (
              <><Plus size={17} /> Create Advertisement</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
