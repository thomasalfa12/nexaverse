// src/components/SideNav.tsx
"use client";

// --- Impor React & Next.js ---
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// --- Impor dari library ---
import { useAccount, useDisconnect } from "wagmi";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// --- Impor hook kustom Anda ---
import { useAuth } from "@/components/auth/AuthProviders";
import { useSocialWallet } from "@/lib/walletProviders/useSocialWallet"; // PERBAIKAN: Impor hook asli

// --- UI & Icons (Tidak Berubah) ---
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle,
  HelpCircle,
  LogOut,
  LogIn,
  Menu,
  PanelLeftClose,
  PanelRightClose,
  Shield,
  User,
  ChevronRight,
  Building,
  Home,
  LayoutDashboard,
  Loader2,
} from "lucide-react";

// --- Konfigurasi Menu & Fungsi Filter (Tidak Berubah, sudah benar dari refactor sebelumnya) ---
export type NavItemConfig = {
  href: string;
  label: string;
  icon: React.ElementType;
  isBeta?: boolean;
  roles?: ("REGISTRY_ADMIN" | "VERIFIED_ENTITY")[];
  children?: NavItemConfig[];
};
const menuConfig: NavItemConfig[] = [
  { href: "/dashboard", label: "Discover", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/verify", label: "Verify", icon: CheckCircle },
  {
    href: "/dashboard/admin",
    label: "Admin",
    icon: Shield,
    isBeta: true,
    children: [
      {
        href: "/dashboard/admin/registry",
        label: "Registry",
        icon: Home,
        roles: ["REGISTRY_ADMIN"],
      },
      {
        href: "/dashboard/admin/institution",
        label: "Institution",
        icon: Building,
        roles: ["VERIFIED_ENTITY"],
      },
    ],
  },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle },
];
const filterMenuByRoles = (
  menu: NavItemConfig[],
  userRoles: string[]
): NavItemConfig[] => {
  return menu
    .map((item) => {
      if (item.children) {
        const filteredChildren = filterMenuByRoles(item.children, userRoles);
        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
        return null;
      }
      if (
        !item.roles ||
        item.roles.some((requiredRole) => userRoles.includes(requiredRole))
      ) {
        return item;
      }
      return null;
    })
    .filter(Boolean) as NavItemConfig[];
};

// ============================================================================
// --- Komponen Utama: SideNav ---
// ============================================================================
export default function SideNav({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const userRoles = user?.roles || [];
  const accessibleMenu = filterMenuByRoles(menuConfig, userRoles);

  useEffect(() => {
    if (window.innerWidth < 640) setIsSidebarCollapsed(true);
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full bg-gray-100 dark:bg-black">
      <TooltipProvider>
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-20 hidden h-full flex-col border-r transition-all duration-300 ease-in-out sm:flex",
            "border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-xl",
            isSidebarCollapsed ? "w-20" : "w-64"
          )}
        >
          <NavContent
            isCollapsed={isSidebarCollapsed}
            onCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isLoading={isLoading}
            menu={accessibleMenu}
          />
        </aside>
      </TooltipProvider>
      <div
        className={cn(
          "flex w-full flex-col transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "sm:pl-20" : "sm:pl-64"
        )}
      >
        <header
          className={cn(
            "sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b px-4 sm:px-6",
            "border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-xl"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="sm:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-64 p-0 bg-background border-r"
                >
                  {/* FIX: Menambahkan SheetHeader dengan judul yang tersembunyi secara visual */}
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menu Navigasi</SheetTitle>
                    <SheetDescription>
                      Pilih halaman tujuan dari daftar menu yang tersedia.
                    </SheetDescription>
                  </SheetHeader>
                  <NavContent
                    isCollapsed={false}
                    isLoading={isLoading}
                    menu={accessibleMenu}
                  />
                </SheetContent>
              </Sheet>
            </div>
            <Breadcrumbs menu={accessibleMenu} />
          </div>
          <UserMenu />
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

// --- Komponen Pendukung (Breadcrumbs, NavContent, NavItem) ---
// (Tidak ada perubahan di sini, semua sudah benar dari refactor sebelumnya)
function Breadcrumbs({ menu }: { menu: NavItemConfig[] }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const findLabel = (path: string): string | null => {
    for (const item of menu) {
      if (item.href === path) return item.label;
      if (item.children) {
        for (const child of item.children) {
          if (child.href === path) return child.label;
        }
      }
    }
    return null;
  };
  if (segments.length <= 1)
    return <h1 className="text-xl font-semibold">Discover</h1>;
  return (
    <div className="flex items-center gap-2 text-sm sm:text-base">
      {" "}
      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const label =
          findLabel(path) || segment.charAt(0).toUpperCase() + segment.slice(1);
        const isLast = index === segments.length - 1;
        return (
          <div key={path} className="flex items-center gap-2">
            {" "}
            <span
              className={cn(
                "font-semibold",
                isLast ? "text-primary" : "text-muted-foreground"
              )}
            >
              {label}
            </span>{" "}
            {!isLast && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}{" "}
          </div>
        );
      })}{" "}
    </div>
  );
}
function NavContent({
  isCollapsed,
  onCollapse,
  isLoading,
  menu,
}: {
  isCollapsed: boolean;
  onCollapse?: () => void;
  isLoading: boolean;
  menu: NavItemConfig[];
}) {
  return (
    <div className="flex h-full flex-col">
      {" "}
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/10 px-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {" "}
        {!isCollapsed && (
          <h1 className="text-xl font-bold tracking-tight text-primary">
            Nexaverse
          </h1>
        )}{" "}
        {onCollapse && (
          <Button variant="ghost" size="icon" onClick={onCollapse}>
            {isCollapsed ? <PanelRightClose /> : <PanelLeftClose />}
          </Button>
        )}{" "}
      </div>{" "}
      <ScrollArea className="flex-1 py-4">
        {" "}
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <nav className="grid items-start gap-1 px-3">
            {" "}
            {menu.map((item) => (
              <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
            ))}{" "}
          </nav>
        )}{" "}
      </ScrollArea>{" "}
    </div>
  );
}
function NavItem({
  item,
  isCollapsed,
}: {
  item: NavItemConfig;
  isCollapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = item.children
    ? pathname.startsWith(item.href)
    : pathname === item.href;
  const [isOpen, setIsOpen] = useState(isActive);
  useEffect(() => {
    setIsOpen(pathname.startsWith(item.href));
  }, [pathname, item.href]);
  const { href, label, icon: Icon, isBeta, children } = item;
  const content = (
    <div
      className={cn(
        "relative flex h-10 w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-accent hover:text-accent-foreground",
        isCollapsed ? "justify-center" : "justify-start"
      )}
    >
      {" "}
      <Icon className="h-5 w-5 flex-shrink-0" />{" "}
      {!isCollapsed && (
        <>
          {" "}
          <span className="flex-grow text-left">{label}</span>{" "}
          {isBeta && <Badge variant="outline">Beta</Badge>}{" "}
          {children && (
            <ChevronRight
              className={cn(
                "h-4 w-4 transform transition-transform duration-200",
                isOpen && "rotate-90"
              )}
            />
          )}{" "}
        </>
      )}{" "}
      {isActive && !isCollapsed && (
        <motion.div
          layoutId="active-glow"
          className="absolute left-0 h-6 w-1 bg-primary rounded-r-full"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}{" "}
    </div>
  );
  const linkWrapper = (
    <Link href={href} className="relative">
      {" "}
      {isCollapsed ? (
        <Tooltip delayDuration={0}>
          {" "}
          <TooltipTrigger asChild>{content}</TooltipTrigger>{" "}
          <TooltipContent side="right">{label}</TooltipContent>{" "}
        </Tooltip>
      ) : (
        content
      )}{" "}
    </Link>
  );
  if (children && !isCollapsed) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Pastikan tidak ada spasi antara Trigger dan Button */}
        <CollapsibleTrigger asChild>
          <button type="button" className="w-full">
            {content}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-8 pt-1 space-y-1">
          {children.map((child) => (
            <NavItem key={child.href} item={child} isCollapsed={false} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }
  return linkWrapper;
}

// ============================================================================
// --- PERBAIKAN: Komponen UserMenu sekarang terintegrasi penuh ---
// ============================================================================
function UserMenu() {
  const router = useRouter();

  // Gunakan kedua hook otentikasi
  const {
    isLoggedIn: isSocial,
    address: socialAddr,
    logout: socialLogout,
  } = useSocialWallet();
  const { address: walletAddr, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Tentukan status login dan alamat aktif
  const loggedIn = isSocial || isConnected;
  const addr = socialAddr || walletAddr;

  const handleLogout = async () => {
    // 1. Hapus sesi di backend (endpoint terpadu)
    await fetch("/api/user/logout", { method: "POST" });

    // 2. Jalankan fungsi logout dari hook yang sesuai
    if (isSocial) {
      await socialLogout();
    } else if (isConnected) {
      disconnect();
    }

    // 3. Arahkan pengguna kembali ke halaman utama
    router.replace("/");
  };

  if (!loggedIn) {
    // Tombol ini mungkin tidak akan pernah terlihat karena ada RouteGuard,
    // tapi ini adalah fallback yang baik.
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
          <Avatar className="h-9 w-9 border-2 border-primary/50">
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
