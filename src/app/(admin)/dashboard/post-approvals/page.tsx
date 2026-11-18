
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type PostStatus = "Active" | "Inactive" | "Rejected";
type PostType = "TEXT" | "IMAGE" | "VIDEO";

interface Teacher {
  teacherId: string;
  name: string;
  email: string;
}

interface Post {
  id: string;
  caption: string | null;
  media: string | null;
  type: PostType;
  status: PostStatus;
  likes: number;
  shares: number;
  views: number;
  teacherId: string;
  teacher?: Teacher | null;
  createdAt: string;
  updatedAt?: string;
}

type FilterStatus = "All" | PostStatus;

const STATUS_OPTIONS: PostStatus[] = [
  "Inactive",
  "Active",
  "Rejected",
];

const statusStyles: Record<PostStatus, string> = {
  Active: "bg-green-50 text-green-700 border-green-200",
  Inactive: "bg-amber-50 text-amber-700 border-amber-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function PostApprovalPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<FilterStatus>("All");

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/v1/post/approval");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to fetch posts"
        );
      }

      setPosts(response.data.data || []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to fetch posts"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Update post status
  const handleStatusChange = async (
    postId: string,
    status: PostStatus
  ) => {
    const currentPost = posts.find((post) => post.id === postId);

    if (!currentPost || currentPost.status === status) return;

    try {
      setUpdatingId(postId);
      setError("");
      setSuccessMessage("");

      const response = await api.patch(
        `/api/v1/post/approval/${postId}`,
        { status }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to update post status"
        );
      }

      // Update the post in the table
      setPosts((previousPosts) =>
        previousPosts.map((post) =>
          post.id === postId
            ? { ...post, status }
            : post
        )
      );

      // Update the selected post in the preview
      setSelectedPost((previousPost) =>
        previousPost?.id === postId
          ? { ...previousPost, status }
          : previousPost
      );

      setSuccessMessage(
        `Post status successfully changed to ${status}.`
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update post status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Dashboard statistics
  const stats = useMemo(() => {
    return {
      total: posts.length,
      inactive: posts.filter(
        (post) => post.status === "Inactive"
      ).length,
      active: posts.filter(
        (post) => post.status === "Active"
      ).length,
      rejected: posts.filter(
        (post) => post.status === "Rejected"
      ).length,
    };
  }, [posts]);

  // Search and filter
  const filteredPosts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesStatus =
        filterStatus === "All" ||
        post.status === filterStatus;

      const matchesSearch =
        !searchValue ||
        post.caption?.toLowerCase().includes(searchValue) ||
        post.teacher?.name?.toLowerCase().includes(searchValue) ||
        post.teacher?.email?.toLowerCase().includes(searchValue) ||
        post.teacherId?.toLowerCase().includes(searchValue);

      return matchesStatus && matchesSearch;
    });
  }, [posts, search, filterStatus]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "T";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Post Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review teacher posts and manage their publishing status.
            </p>
          </div>

          <button
            onClick={fetchPosts}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 11a8.1 8.1 0 0 0-14.5-4L3 10" />
              <path d="M3 4v6h6" />
              <path d="M4 13a8.1 8.1 0 0 0 14.5 4L21 14" />
              <path d="M21 20v-6h-6" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="font-semibold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage("")}
              className="font-semibold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total Posts */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Posts
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.total}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              All teacher submissions
            </p>
          </div>

          {/* Inactive Posts */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Inactive Posts
                </p>
                <h2 className="mt-2 text-3xl font-bold text-amber-600">
                  {stats.inactive}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Waiting for Admin review
            </p>
          </div>

          {/* Active Posts */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Posts
                </p>
                <h2 className="mt-2 text-3xl font-bold text-green-600">
                  {stats.active}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="m8 12 2.5 2.5L16 9" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Published posts
            </p>
          </div>

          {/* Rejected Posts */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Rejected Posts
                </p>
                <h2 className="mt-2 text-3xl font-bold text-red-600">
                  {stats.rejected}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="m9 9 6 6m0-6-6 6" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Posts rejected by Admin
            </p>
          </div>
        </div>

        {/* Posts Section */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Search and Filters */}
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  All Posts
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage the status of posts submitted by teachers.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* Search */}
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search posts or teachers..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-72"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as FilterStatus)
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="All">All Status</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Active">Active</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Tabs */}
            <div className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  "All",
                  "Inactive",
                  "Active",
                  "Rejected",
                ] as FilterStatus[]
              ).map((status) => {
                const isSelected = filterStatus === status;

                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      isSelected
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {status === "All" ? "All Posts" : status}
                    <span className="ml-2 opacity-70">
                      {status === "All"
                        ? stats.total
                        : stats[status.toLowerCase() as "active" | "inactive" | "rejected"]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Post
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Teacher
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Submitted
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                        <p className="text-sm text-slate-500">
                          Loading posts...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <svg
                            className="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <path d="M8 8h8M8 12h8M8 16h5" />
                          </svg>
                        </div>
                        <p className="font-medium text-slate-700">
                          No posts found
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Try changing your search or filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      {/* Post Details */}
                      <td className="px-5 py-4">
                        <div className="flex max-w-xs items-center gap-3">
                          {post.media && post.type === "IMAGE" ? (
                            <img
                              src={post.media}
                              alt="Post"
                              className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover"
                            />
                          ) : post.media && post.type === "VIDEO" ? (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                              <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <path d="M5 5h14v14H5z" />
                                <path d="M8 9h8M8 13h8M8 17h5" />
                              </svg>
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {post.caption || "No caption"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              ID: {post.id.slice(0, 12)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Teacher */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                            {getInitials(post.teacher?.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {post.teacher?.name || "Unknown Teacher"}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {post.teacher?.email || post.teacherId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {post.type}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {formatDate(post.createdAt)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {new Date(post.createdAt).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-5 py-4">
                        <select
                          value={post.status}
                          onChange={(e) =>
                            handleStatusChange(
                              post.id,
                              e.target.value as PostStatus
                            )
                          }
                          disabled={updatingId === post.id}
                          className={`rounded-lg border px-3 py-2 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50 ${
                            statusStyles[post.status]
                          }`}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        {updatingId === post.id && (
                          <p className="mt-1 text-xs text-blue-600">
                            Updating...
                          </p>
                        )}
                      </td>

                      {/* View Details */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!loading && (
            <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredPosts.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {posts.length}
                </span>{" "}
                posts
              </p>
              <p className="text-xs text-slate-400">
                Status changes are saved immediately.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Post Preview Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Post Details
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Review the submitted content and manage its status.
                </p>
              </div>

              <button
                onClick={() => setSelectedPost(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 p-6">

              {/* Teacher Information */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600">
                  {getInitials(selectedPost.teacher?.name)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {selectedPost.teacher?.name || "Unknown Teacher"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedPost.teacher?.email || selectedPost.teacherId}
                  </p>
                </div>
              </div>

              {/* Media Preview */}
              {selectedPost.media && selectedPost.type === "IMAGE" && (
                <img
                  src={selectedPost.media}
                  alt="Post preview"
                  className="max-h-96 w-full rounded-xl border border-slate-200 bg-slate-50 object-contain"
                />
              )}

              {selectedPost.media && selectedPost.type === "VIDEO" && (
                <video
                  src={selectedPost.media}
                  controls
                  className="max-h-96 w-full rounded-xl bg-black"
                />
              )}

              {/* Caption */}
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Caption
                </p>
                <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {selectedPost.caption || "No caption provided."}
                </div>
              </div>

              {/* Post Information */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-400">Type</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedPost.type}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-400">Likes</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedPost.likes}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-400">Shares</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedPost.shares}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-400">Views</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedPost.views}
                  </p>
                </div>
              </div>

              {/* Submitted Date */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Submitted On
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {formatDateTime(selectedPost.createdAt)}
                </p>
              </div>

              {/* Admin Status Control */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label
                  htmlFor="post-status"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Manage Post Status
                </label>

                <select
                  id="post-status"
                  value={selectedPost.status}
                  onChange={(e) =>
                    handleStatusChange(
                      selectedPost.id,
                      e.target.value as PostStatus
                    )
                  }
                  disabled={updatingId === selectedPost.id}
                  className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50 ${
                    statusStyles[selectedPost.status]
                  }`}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-slate-500">
                  Select Active to publish the post, Inactive to keep it
                  unpublished, or Rejected to reject the submission.
                </p>

                {updatingId === selectedPost.id && (
                  <p className="mt-2 text-xs font-medium text-blue-600">
                    Updating post status...
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setSelectedPost(null)}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
