
"use client";

import { useCallback, useEffect, useState } from "react";
import CreateAdvertisement from "./CreateAdvertisement";
import api from "@/lib/api";
import {
  Plus,
  Search,
  Image as ImageIcon,
  Video,
  MonitorPlay,
  Film,
  X,
  Loader2,
  Megaphone,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type AdvertisementType = "IMAGE" | "GIF" | "VIDEO" | "YOUTUBE";

interface Advertisement {
  id: string;
  name: string;
  description: string | null;
  type: AdvertisementType;
  mediaUrl: string;
  thumbnail: string | null;
  isActive: boolean;
  displayOrder: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

type FilterType = "ALL" | "ACTIVE" | "INACTIVE";

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // FETCH ADVERTISEMENTS
  // ==========================================

  const fetchAdvertisements = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/v1/advertisements", {
        params: { _t: Date.now() },
      });

      setAdvertisements(response.data.data || []);
    } catch (err) {
      const message = (err as any)?.response?.data?.message;
      setError(message || (err instanceof Error ? err.message : "Something went wrong"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvertisements();
  }, [fetchAdvertisements]);

  // ==========================================
  // ACTIVATE / DEACTIVATE
  // ==========================================

  const toggleAdvertisement = async (ad: Advertisement) => {
    setError("");
    setSuccess("");

    try {
      setUpdatingId(ad.id);

      await api.patch("/api/v1/advertisements", {
        id: ad.id,
        isActive: !ad.isActive,
      });

      setAdvertisements((prev) =>
        prev.map((item) =>
          item.id === ad.id
            ? { ...item, isActive: !ad.isActive }
            : item
        )
      );

      setSuccess(
        ad.isActive
          ? "Advertisement deactivated successfully"
          : "Advertisement activated successfully"
      );
    } catch (err) {
      const message = (err as any)?.response?.data?.message;
      setError(message || (err instanceof Error ? err.message : "Failed to update status"));
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // FILTERING
  // ==========================================

  const filteredAdvertisements = advertisements.filter((ad) => {
    const matchesSearch =
      ad.name.toLowerCase().includes(search.toLowerCase()) ||
      ad.type.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "ALL" ||
      (filter === "ACTIVE" && ad.isActive) ||
      (filter === "INACTIVE" && !ad.isActive);

    return matchesSearch && matchesFilter;
  });

  const activeCount = advertisements.filter((ad) => ad.isActive).length;
  const inactiveCount = advertisements.length - activeCount;

  // ==========================================
  // HELPERS
  // ==========================================

  const formatDate = (date: string | null) => {
    if (!date) return "Not scheduled";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTypeIcon = (type: AdvertisementType) => {
    switch (type) {
      case "IMAGE":
        return ImageIcon;
      case "GIF":
        return Film;
      case "VIDEO":
        return Video;
      case "YOUTUBE":
        return MonitorPlay;
    }
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">

      {/* PAGE HEADER */}

      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="font-medium text-orange-600">
              Advertisements
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Advertisement Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create, manage and control advertisements across your platform.
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={fetchAdvertisements}
            disabled={loading}
            className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={() => {
              setShowForm(!showForm);
              setError("");
              setSuccess("");
            }}
            className="flex h-10 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
          >
            {showForm ? <X size={17} /> : <Plus size={17} />}
            {showForm ? "Close Form" : "Create Advertisement"}
          </button>

        </div>
      </div>

      {/* ALERTS */}

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError("")} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 size={18} />
          {success}
          <button onClick={() => setSuccess("")} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {/* STATISTICS */}

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Advertisements
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {advertisements.length}
              </h2>
            </div>

            <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Megaphone size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active Advertisements
              </p>
              <h2 className="mt-2 text-3xl font-bold text-green-600">
                {activeCount}
              </h2>
            </div>

            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <Eye size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Inactive Advertisements
              </p>
              <h2 className="mt-2 text-3xl font-bold text-amber-600">
                {inactiveCount}
              </h2>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <EyeOff size={23} />
            </div>
          </div>
        </div>

      </div>

      {/* CREATE ADVERTISEMENT COMPONENT */}
      {showForm && (
        <CreateAdvertisement
          onCancel={() => setShowForm(false)}
          onCreated={async () => {
            setSuccess("Advertisement created successfully. Awaiting activation.");
            setShowForm(false);
            await fetchAdvertisements();
          }}
        />
      )}

      {/* ADVERTISEMENT LIST */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* LIST HEADER */}

        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">

          <div>
            <h2 className="font-bold text-slate-900">
              All Advertisements
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Manage advertisement visibility and scheduling.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search advertisements..."
                className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-orange-400 sm:w-56"
              />
            </div>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as FilterType)
              }
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-600 outline-none focus:border-orange-400"
            >
              <option value="ALL">All Advertisements</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

          </div>
        </div>

        {/* TABLE */}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="animate-spin text-orange-500" size={30} />
          </div>
        ) : filteredAdvertisements.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">

            <div className="mb-4 rounded-full bg-slate-100 p-5 text-slate-400">
              <Megaphone size={32} />
            </div>

            <h3 className="font-semibold text-slate-800">
              No advertisements found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {search || filter !== "ALL"
                ? "Try changing your search or filter."
                : "Create your first advertisement to get started."}
            </p>

            {!search && filter === "ALL" && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
              >
                <Plus size={16} />
                Create Advertisement
              </button>
            )}

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px] text-left">

              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Advertisement</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Schedule</th>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredAdvertisements.map((ad) => {
                  const Icon = getTypeIcon(ad.type);

                  const isUpdating = updatingId === ad.id;

                  return (
                    <tr
                      key={ad.id}
                      className="transition hover:bg-slate-50/70"
                    >

                      {/* ADVERTISEMENT */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-12 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">

                            {ad.type === "IMAGE" ? (
                              <img
                                src={ad.mediaUrl}
                                alt={ad.name}
                                className="h-full w-full object-cover"
                              />
                            ) : ad.type === "VIDEO" ||
                              ad.type === "YOUTUBE" ? (
                              ad.thumbnail ? (
                                <img
                                  src={ad.thumbnail}
                                  alt={ad.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Icon size={21} className="text-slate-400" />
                              )
                            ) : (
                              <img
                                src={ad.mediaUrl}
                                alt={ad.name}
                                className="h-full w-full object-cover"
                              />
                            )}

                          </div>

                          <div className="max-w-56">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {ad.name}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {ad.description || "No description"}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* TYPE */}

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                          <Icon size={14} />
                          {ad.type}
                        </span>
                      </td>

                      {/* SCHEDULE */}

                      <td className="px-5 py-4">
                        <div className="text-xs text-slate-600">
                          <p>
                            <span className="text-slate-400">From:</span>{" "}
                            {formatDate(ad.startDate)}
                          </p>

                          <p className="mt-1">
                            <span className="text-slate-400">To:</span>{" "}
                            {formatDate(ad.endDate)}
                          </p>
                        </div>
                      </td>

                      {/* ORDER */}

                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-slate-700">
                          {ad.displayOrder}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            ad.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              ad.isActive
                                ? "bg-green-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {ad.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">

                          <a
                            href={ad.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View media"
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100"
                          >
                            <ExternalLink size={16} />
                          </a>

                          <button
                            onClick={() => toggleAdvertisement(ad)}
                            disabled={isUpdating}
                            title={
                              ad.isActive
                                ? "Deactivate advertisement"
                                : "Activate advertisement"
                            }
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                              ad.isActive
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {isUpdating ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : ad.isActive ? (
                              <EyeOff size={15} />
                            ) : (
                              <Eye size={15} />
                            )}

                            {ad.isActive ? "Deactivate" : "Activate"}
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>
          </div>
        )}

        {/* FOOTER */}

        {!loading && filteredAdvertisements.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-500">
              Showing {filteredAdvertisements.length} of{" "}
              {advertisements.length} advertisements
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
