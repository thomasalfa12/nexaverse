"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Users,
  CheckCircle,
  Star,
  Trophy,
  Shield,
  HelpCircle,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";
import { useAccount, useDisconnect } from "wagmi";
import { useSocialWallet } from "@/lib/useSocialWallet";
import { Menu, Transition } from "@headlessui/react";

const menu = [
  { href: "/dashboard", label: "Discover", icon: LayoutGrid },
  { href: "/dashboard/events", label: "Event Public", icon: Users },
  {
    href: "/dashboard/events/verified",
    label: "Event Verified",
    icon: CheckCircle,
  },
  { href: "/dashboard/reward", label: "Reward", icon: Star },
  { href: "/dashboard/achievement", label: "Achievement", icon: Trophy },
  { href: "/dashboard/verify", label: "Verify Status", icon: Shield },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle },
];

export default function SideNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const {
    isLoggedIn: isSocial,
    address: socialAddr,
    logout: socialLogout,
  } = useSocialWallet();
  const { address: walletAddr, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const loggedIn = isSocial || isConnected;
  const addr = socialAddr ?? walletAddr;

  const handleLogout = async () => {
    await fetch("/api/siwe/logout", { method: "POST" }).catch(() => {});
    if (isSocial) await socialLogout();
    else if (isConnected) disconnect();
    router.replace("/");
  };

  return (
    <>
      {/* ── Navbar ───────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-zinc-900 dark:border-zinc-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            {/* Sidebar toggle */}
            <div className="flex items-center justify-start">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  />
                </svg>
              </button>
              <span className="ms-2 text-xl font-semibold dark:text-white">
                Nexaverse
              </span>
            </div>

            {/* Profile/Login */}
            <div className="flex items-center">
              {loggedIn ? (
                <Menu as="div" className="relative ml-3">
                  <Menu.Button className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 dark:bg-zinc-800">
                    <User className="h-4 w-4" />
                    <span className="hidden text-xs sm:inline">
                      {addr?.slice(0, 6)}…{addr?.slice(-4)}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Menu.Button>
                  <Transition
                    enter="transition duration-100"
                    enterFrom="scale-95 opacity-0"
                    enterTo="scale-100 opacity-100"
                    leave="transition duration-75"
                    leaveFrom="scale-100 opacity-100"
                    leaveTo="scale-95 opacity-0"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md border bg-white p-1 shadow-md dark:border-zinc-700 dark:bg-zinc-800">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => router.push("/dashboard/profile")}
                            className={clsx(
                              "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm",
                              active ? "bg-gray-100 dark:bg-zinc-700" : ""
                            )}
                          >
                            <User className="h-4 w-4" /> Profile
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={clsx(
                              "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm",
                              active ? "bg-gray-100 dark:bg-zinc-700" : ""
                            )}
                          >
                            <LogOut className="h-4 w-4" /> Logout
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="ml-3 flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm shadow-sm hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-40 h-screen pt-16 transition-transform bg-white border-r border-gray-200 dark:bg-zinc-900 dark:border-zinc-700",
          sidebarOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full sm:translate-x-0 sm:w-64"
        )}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {menu.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700"
                >
                  <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="ms-3">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ── Page Offset ───────────────────────────────────────────── */}
      <div className="pt-16 sm:ml-64">
        {/* content dari halaman akan dimasukkan lewat slot/children nantinya */}
        <div className="p-4 border-2 border-dashed rounded-lg dark:border-zinc-700">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Main Content Goes Here
          </div>
        </div>
      </div>
    </>
  );
}
