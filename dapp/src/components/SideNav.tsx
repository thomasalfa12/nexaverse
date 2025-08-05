"use client";

// --- Impor React & Next.js ---
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// --- Impor dari library ---
import { useDisconnect, useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { useClaims } from "@/hooks/useClaims";

// --- UI & Icons ---
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
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
  BadgeCheck,
  Home,
  LayoutDashboard,
  Moon,
  Award,
  Sun,
  Search,
  Network,
  BookOpen,
} from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";

// --- Konfigurasi Menu & Fungsi Filter ---
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
        href: "/dashboard/admin/verifiedUser",
        label: "Verified Dashboard",
        icon: BadgeCheck,
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
        if (filteredChildren.length > 0)
          return { ...item, children: filteredChildren };
        return null;
      }
      if (!item.roles || item.roles.some((role) => userRoles.includes(role))) {
        return item;
      }
      return null;
    })
    .filter(Boolean) as NavItemConfig[];
};

// ============================================================================
// --- Komponen-Komponen Pendukung (Helper Components) ---
// ============================================================================

function CommandPalette({ menu }: { menu: NavItemConfig[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setIsOpen(false);
    command();
  };

  return (
    <>
      <Button
        variant="outline"
        className="h-9 w-9 p-0 md:w-auto md:px-4 md:py-2 md:justify-start"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline-block text-muted-foreground">
          Cari...
        </span>
        <kbd className="hidden md:inline-block pointer-events-none ml-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        {/* FIX: Menambahkan DialogTitle yang tersembunyi untuk aksesibilitas */}
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <CommandInput placeholder="Ketik perintah atau cari..." />
        <CommandList>
          <CommandEmpty>Tidak ada hasil.</CommandEmpty>
          <CommandGroup heading="Navigasi">
            {menu.flatMap((item) =>
              item.children ? (
                item.children.map((child) => (
                  <CommandItem
                    key={child.href}
                    onSelect={() => runCommand(() => router.push(child.href))}
                  >
                    <child.icon className="mr-2 h-4 w-4" />
                    <span>{child.label}</span>
                  </CommandItem>
                ))
              ) : (
                <CommandItem
                  key={item.href}
                  onSelect={() => runCommand(() => router.push(item.href))}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </CommandItem>
              )
            )}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Kursus (Contoh)">
            <CommandItem>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Belajar Nodejs Dasar</span>
            </CommandItem>
            <CommandItem>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Pengenalan Smart Contract</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function UserMenu() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { claimsCount } = useClaims();
  const { data: session, status } = useSession();
  const { disconnect } = useDisconnect();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    disconnect();
    router.replace("/");
  };

  if (status === "loading")
    return <Skeleton className="h-10 w-10 rounded-full" />;
  if (status === "unauthenticated")
    return (
      <Button onClick={() => router.push("/")}>
        <LogIn className="mr-2 h-4 w-4" /> Sign In
      </Button>
    );

  const user = session?.user;
  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.address?.slice(2, 4).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9 border-2 border-primary/50">
            <AvatarImage
              src={user?.image || undefined}
              alt={user?.name || "User Avatar"}
            />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">
              {user?.name || "Creator Digital"}
            </p>
            <p className="text-xs leading-none text-muted-foreground font-mono">
              {user?.address
                ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}`
                : ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
            <User className="mr-2" />
            <span>Profil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/claims")}>
            <Award className="mr-2" />
            <span>Klaim Saya</span>
            {claimsCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {claimsCount}
              </Badge>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span>Ganti Tema</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
        >
          <LogOut className="mr-2" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-grow text-left">{label}</span>
          {isBeta && <Badge variant="outline">Beta</Badge>}
          {children && (
            <ChevronRight
              className={cn(
                "h-4 w-4 transform transition-transform duration-200",
                isOpen && "rotate-90"
              )}
            />
          )}
        </>
      )}
      {isActive && !isCollapsed && (
        <motion.div
          layoutId="active-glow"
          className="absolute left-0 h-6 w-1 bg-primary rounded-r-full"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </div>
  );

  const linkWrapper = (
    <Link href={href} className="relative">
      {isCollapsed ? (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      ) : (
        content
      )}
    </Link>
  );

  if (children && !isCollapsed) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
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

function NavContent({
  isCollapsed,
  menu,
  isLoading,
}: {
  isCollapsed: boolean;
  menu: NavItemConfig[];
  isLoading: boolean;
}) {
  const { chain } = useAccount();

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 items-center border-b px-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && (
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-primary"
          >
            Nexaverse
          </Link>
        )}
      </div>

      <ScrollArea className="flex-1 py-4">
        {isLoading ? (
          <div className="grid items-start gap-2 px-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <nav className="grid items-start gap-1 px-3">
            {menu.map((item) => (
              <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
            ))}
          </nav>
        )}
      </ScrollArea>

      <div className="mt-auto border-t p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-md p-2 text-sm transition-colors",
            isCollapsed && "justify-center"
          )}
        >
          <Network className="h-5 w-5 text-green-500" />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Jaringan</span>
              <span className="text-muted-foreground">
                {chain?.name || "Tidak Terhubung"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// --- Komponen Layout Utama yang Menggabungkan Semuanya ---
// ============================================================================
export default function SideNav({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const userRoles = session?.user?.roles || [];
  const accessibleMenu = filterMenuByRoles(menuConfig, userRoles);

  useEffect(() => {
    const checkSize = () => setIsSidebarCollapsed(window.innerWidth < 1024);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return (
    <div className="flex min-h-screen w-full">
      <TooltipProvider>
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-20 hidden h-full flex-col border-r bg-background/80 backdrop-blur-lg transition-all duration-300 ease-in-out sm:flex",
            isSidebarCollapsed ? "w-20" : "w-64"
          )}
        >
          <NavContent
            isCollapsed={isSidebarCollapsed}
            menu={accessibleMenu}
            isLoading={isLoading}
          />
        </aside>
      </TooltipProvider>
      <div
        className={cn(
          "flex w-full flex-col transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "sm:pl-20" : "sm:pl-64"
        )}
      >
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background/80 backdrop-blur-lg px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? <PanelRightClose /> : <PanelLeftClose />}
            </Button>
            <div className="sm:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-64 p-0 bg-card/95 backdrop-blur-lg border-r"
                >
                  <NavContent
                    isCollapsed={false}
                    menu={accessibleMenu}
                    isLoading={isLoading}
                  />
                </SheetContent>
              </Sheet>
            </div>
            <h1 className="text-xl font-semibold hidden md:block">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <CommandPalette menu={accessibleMenu} />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
