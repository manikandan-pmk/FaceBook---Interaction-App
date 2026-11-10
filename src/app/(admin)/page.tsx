
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Eye,
  EyeOff,
  Command,
  ArrowRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore"

const Page = () => {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 const { setSuperAdmin, setAdmin } = useAuthStore();

  
const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");

  if (!phoneNumber.trim() || !password) {
    setError("Please enter your phone number and password.");
    return;
  }

  try {
    setLoading(true);

    const response = await axios.post(
      "/api/v1/auth/admin/login",
      {
        phoneNumber: phoneNumber.trim(),
        password,
      },
      {
        withCredentials: true,
      }
    );

    if (response.status === 200) {
      const user = response.data;
      console.log("Logged in user:", user);

      switch (user.data.role) {
        case "SuperAdmin":
          setSuperAdmin(user);
          break;

        case "Admin":
          setAdmin(user);
          break;

        default:
          setError("Invalid user role.");
          return;
      }
      console.log("Zustand Store:", useAuthStore.getState());

      router.replace("/dashboard");
      router.refresh();
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      setError(
        err.response?.data?.message ||
        "Invalid credentials. Please try again."
      );
    } else {
      setError("Something went wrong.");
      console.error(err);
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <main className="flex min-h-screen w-full bg-white text-zinc-950 selection:bg-zinc-200 selection:text-zinc-900">

      {/* Left Branding Panel */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-zinc-950 p-12 text-zinc-100 lg:flex">

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950">
            <Command size={22} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight">
            System Core
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-semibold tracking-tight text-white mb-4">
            Super Admin Access
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            You are entering a secure environment. Please ensure you are
            connected to an authorized network before authenticating.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-sm font-medium text-zinc-400">
          <CheckCircle2 size={18} className="text-emerald-500" />
          All backend services operational
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex w-full items-center justify-center p-8 sm:p-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Mobile Logo */}
          <div className="mb-10 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <Command size={22} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              System Core
            </span>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Sign In
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Enter your authorized phone number and password.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Phone Number */}
            <div className="space-y-2">
              <label
                htmlFor="phoneNumber"
                className="text-sm font-medium text-zinc-900"
              >
                Phone Number
              </label>

              <input
                id="phoneNumber"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={15}
                autoFocus
                disabled={loading}
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, ""))
                }
                placeholder="e.g. 1234567890"
                className="flex h-12 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 transition-colors hover:border-zinc-300 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-50"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-zinc-900"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex h-12 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 pr-10 text-sm placeholder:text-zinc-400 transition-colors hover:border-zinc-300 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-50"
                  required
                />

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-zinc-400 hover:text-zinc-900 disabled:opacity-50 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-sm font-medium text-red-600 animate-in fade-in zoom-in-95 duration-200">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Page;
