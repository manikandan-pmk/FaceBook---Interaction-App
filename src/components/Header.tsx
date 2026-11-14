
"use client";

import {
  Menu,
  Bell,
  ChevronDown,
  UserRound,
} from "lucide-react";

import { useAuthStore } from "@/store/authStore";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
 const { admin} = useAuthStore();



const currentUser = admin;
console.log("Current User",currentUser);



  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden"
        >
          <Menu size={21} />
        </button>

        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Welcome back, {currentUser?.name || "User"}
          </h2>

          <p className="hidden text-xs text-zinc-500 sm:block">
            Here's what's happening with your platform.
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-5">

        {/* Notification */}
        <button
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="h-8 w-px bg-zinc-200" />

        {/* Profile */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-white">
            <UserRound size={19} />
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-zinc-900">
              {currentUser?.name || "User"}
            </p>

            <p className="text-xs text-zinc-500">
              {currentUser?.role || "Guest"}
            </p>
          </div>

          <ChevronDown
            size={16}
            className="hidden text-zinc-400 sm:block"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
