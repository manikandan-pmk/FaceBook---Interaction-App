
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import api from "@/lib/api";
import {
  Search,
  Plus,
  RefreshCw,
  Users,
  Mail,
  Phone,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  X,
} from "lucide-react";

interface Teacher {
  id: number;
  teacherId: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
}

export default function TeachersManagementPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Track teacher being updated
  const [updatingTeacherId, setUpdatingTeacherId] = useState<string | null>(
    null
  );

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/v1/teachers");

      if (response.data.success) {
        setTeachers(response.data.teachers || []);
      } else {
        setError(response.data.message || "Failed to fetch teachers");
      }
    } catch (err) {
      console.error("Fetch teachers error:", err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Unable to fetch teachers"
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Update Teacher Status
  const updateTeacherStatus = async (
    teacherId: string,
    status: "Active" | "Inactive"
  ) => {
    try {
      setUpdatingTeacherId(teacherId);

      const response = await api.put(
        `/api/v1/teachers/${encodeURIComponent(teacherId)}`,
        { status }
      );

      if (response.data.success) {
        setTeachers((prev) =>
          prev.map((teacher) =>
            teacher.teacherId === teacherId
              ? { ...teacher, status }
              : teacher
          )
        );
      } else {
        alert(response.data.message || "Failed to update teacher status");
      }
    } catch (err) {
      console.error("Update teacher status error:", err);

      alert(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Unable to update teacher status"
          : "Something went wrong"
      );
    } finally {
      setUpdatingTeacherId(null);
    }
  };

  // Search filtering
  const filteredTeachers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return teachers;

    return teachers.filter((teacher) =>
      [
        teacher.teacherId,
        teacher.name,
        teacher.email,
        teacher.phoneNumber,
      ].some((field) => field?.toLowerCase().includes(value))
    );
  }, [teachers, search]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTeachers.length / limit)
  );

  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const startIndex =
    filteredTeachers.length === 0
      ? 0
      : (currentPage - 1) * limit + 1;

  const endIndex = Math.min(
    currentPage * limit,
    filteredTeachers.length
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, limit]);

  return (
    <div className="min-h-full bg-[#f8f9fb] p-6">

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Teacher Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor all teachers in your platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchTeachers}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <Link
            href="/dashboard/teachers/create"
            className="flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus size={17} />
            Add Teacher
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Teachers
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "—" : teachers.length}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Search Results
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "—" : filteredTeachers.length}
              </h2>
            </div>

            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <GraduationCap size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Current Page
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "—" : `${currentPage} / ${totalPages}`}
              </h2>
            </div>

            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <Calendar size={24} />
            </div>
          </div>
        </div>

      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

        {/* Table Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              All Teachers
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View and manage registered teachers.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search teachers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
            <button
              onClick={fetchTeachers}
              className="ml-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-5 py-4">Teacher</th>
                <th className="px-5 py-4">Teacher ID</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Joined Date</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <td key={i} className="px-5 py-5">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedTeachers.length > 0 ? (
                paginatedTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* Teacher */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
                          {teacher.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-medium text-gray-900">
                            {teacher.name}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            ID: {teacher.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Teacher ID */}
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {teacher.teacherId}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail size={14} className="text-gray-400" />
                          {teacher.email}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone size={13} className="text-gray-400" />
                          {teacher.phoneNumber}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {teacher.role}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {new Date(teacher.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={teacher.status === "Active"}
                          aria-label={`Change ${teacher.name} status`}
                          disabled={
                            updatingTeacherId === teacher.teacherId
                          }
                          onClick={() =>
                            updateTeacherStatus(
                              teacher.teacherId,
                              teacher.status === "Active"
                                ? "Inactive"
                                : "Active"
                            )
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                            teacher.status === "Active"
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                              teacher.status === "Active"
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>

                        <span
                          className={`text-xs font-medium ${
                            teacher.status === "Active"
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {updatingTeacherId === teacher.teacherId
                            ? "Updating..."
                            : teacher.status === "Active"
                              ? "Active"
                              : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-center">
                      <Link
                        href={`/dashboard/teachers/${teacher.id}`}
                        title="View teacher"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye size={17} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <Users size={35} className="mb-3 text-gray-300" />

                      <h3 className="font-semibold text-gray-800">
                        No teachers found
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {search
                          ? "Try searching with a different keyword."
                          : "No teachers have been registered yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col justify-between gap-4 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center">

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {startIndex}-{endIndex}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {filteredTeachers.length}
              </span>{" "}
              teachers
            </span>

            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1 || loading}
              onClick={() =>
                setCurrentPage((prev) => Math.max(1, prev - 1))
              }
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="px-3 text-sm font-medium text-gray-700">
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages || loading}
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(totalPages, prev + 1)
                )
              }
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
