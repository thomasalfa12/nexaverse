// src/components/SideNav.tsx (FIXED)
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useSocialWallet } from "@/lib/useSocialWallet";
import { cn } from "@/lib/utils";

// --- UI Components ---
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator"; // <-- Pastikan import ini ada
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Icons ---
import {
  CheckCircle,
  HelpCircle,
  LogOut,
  LogIn, // <-- FIXED: Menambahkan LogIn yang hilang
  Menu,
  PanelLeftClose,
  PanelRightClose,
  Shield,
  Trophy,
  User,
} from "lucide-react";

// --- Menu Configuration ---
const primaryMenu = [
  { href: "/dashboard", label: "Profile", icon: User },
  { href: "/dashboard/verify", label: "Verify", icon: CheckCircle },
  { href: "/dashboard/event", label: "Event", icon: Trophy },
];

const secondaryMenu = [
  { href: "/dashboard/admin", label: "Admin", icon: Shield, isBeta: true },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle },
];

// ============================================================================
// --- Main Layout Component ---
// Diganti namanya menjadi SideNav sesuai nama file Anda
// ============================================================================
export default function SideNav({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // Mencari judul halaman berdasarkan path saat ini
  const pageTitle =
    [...primaryMenu, ...secondaryMenu].find(
      (item) =>
        pathname.startsWith(item.href) &&
        (item.href === "/dashboard" ? pathname === item.href : true)
    )?.label || "Dashboard";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <TooltipProvider>
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 hidden h-full flex-col border-r bg-background transition-all duration-300 ease-in-out sm:flex",
            isSidebarCollapsed ? "w-20" : "w-64"
          )}
        >
          <NavContent
            isCollapsed={isSidebarCollapsed}
            onCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </aside>
      </TooltipProvider>

      <div
        className={cn(
          "flex w-full flex-col transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "sm:pl-20" : "sm:pl-64"
        )}
      >
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="sm:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <NavContent isCollapsed={false} />
                </SheetContent>
              </Sheet>
            </div>
            {/* Menampilkan judul halaman di header desktop */}
            <h1 className="hidden text-xl font-semibold sm:block">
              {pageTitle}
            </h1>
          </div>
          <UserMenu />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

// ============================================================================
// --- Navigation Content (Used in Sidebar and Mobile Sheet) ---
// ============================================================================
function NavContent({
  isCollapsed,
  onCollapse,
}: {
  isCollapsed: boolean;
  onCollapse?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 items-center border-b px-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && (
          <h1 className="text-xl font-bold tracking-tight text-primary">
            Nexaverse
          </h1>
        )}
        {onCollapse && (
          <Button variant="ghost" size="icon" onClick={onCollapse}>
            {isCollapsed ? (
              <PanelRightClose className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="grid items-start gap-1 px-3">
          {primaryMenu.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={pathname.startsWith(item.href)}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
        <div className="px-3">
          <Separator className="my-4" />
        </div>
        <nav className="grid items-start gap-1 px-3">
          {secondaryMenu.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={pathname.startsWith(item.href)}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

// ============================================================================
// --- Single Navigation Item ---
// ============================================================================
function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  isCollapsed,
  isBeta = false,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  isCollapsed: boolean;
  isBeta?: boolean;
}) {
  const content = (
    <div
      className={cn(
        buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
        "flex h-10 w-full items-center justify-start gap-3"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-grow text-left">{label}</span>
          {isBeta && <Badge variant="outline">Beta</Badge>}
        </>
      )}
    </div>
  );

  return isCollapsed ? (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link href={href}>{content}</Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-4">
        {label}
        {isBeta && (
          <Badge variant="secondary" className="ml-auto">
            Beta
          </Badge>
        )}
      </TooltipContent>
    </Tooltip>
  ) : (
    <Link href={href}>{content}</Link>
  );
}

// ============================================================================
// --- User Menu (Used in Header) ---
// ============================================================================
function UserMenu() {
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

  if (!loggedIn) {
    return (
      <Button onClick={() => router.push("/")}>
        <LogIn className="mr-2 h-4 w-4" /> Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{addr?.slice(2, 4).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">My Account</p>
            <p className="text-xs leading-none text-muted-foreground font-mono">
              {addr?.slice(0, 6)}...{addr?.slice(-4)}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// FIXED: Menghapus fungsi Separator lokal yang menyebabkan error.
