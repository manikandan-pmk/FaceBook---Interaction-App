
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  ShieldCheck,
  GraduationCap,
  FileText,
  ClipboardCheck,
  Folder,
  MessageCircle,
  Shield,
  Bell,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  X,
  School,
  Command,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuSections = [
  {
    title: "Main Menu",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Teacher Management",
        href: "/dashboard/teachers-management",
        icon: GraduationCap,
      },
    ],
  },
  {
    title: "Content Management",
    items: [
      {
        title: "Advertisements",
        href: "/dashboard/advertisements",
        icon: FileText,
      },
      {
        title: "Post Approvals",
        href: "/dashboard/post-approvals",
        icon: ClipboardCheck,
        badge: 12,
      },
    ],
  },
  {
    title: "Platform Management",
    items: [
      {
        title: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
      },
      {
        title: "Reports & Analytics",
        href: "/dashboard/reports",
        icon: ChartNoAxesCombined,
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Clear authentication data here if needed
    router.replace("/");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <School size={21} />
            </div>

            <div>
              <h1 className="text-base font-bold text-zinc-950">
                School Connect
              </h1>
              <p className="text-xs text-zinc-500">
                SuperAdmin Panel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? "bg-zinc-950 text-white shadow-sm"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Icon
                          size={18}
                          strokeWidth={1.8}
                          className={
                            active
                              ? "text-white"
                              : "text-zinc-500 group-hover:text-zinc-950"
                          }
                        />

                        <span className="truncate">
                          {item.title}
                        </span>
                      </span>

                      {item.badge !== undefined && (
                        <span
                          className={`ml-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                            active
                              ? "bg-white text-zinc-950"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-zinc-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut size={18} strokeWidth={1.8} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
