"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, LogOut, CreditCard, Wrench, MessageSquare, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
};

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Quizzes", href: "/admin/topics", icon: BookOpen },
  { label: "Tools", href: "/admin/tools", icon: Wrench },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
];

export function AdminShell({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  let pageTitle = "Dashboard";
  if (pathname.startsWith("/admin/topics")) pageTitle = "Quizzes Dashboard";
  if (pathname.startsWith("/admin/payments")) pageTitle = "Payments Log";
  if (pathname.startsWith("/admin/messages")) pageTitle = "Messages";
  if (pathname.startsWith("/admin/tools")) pageTitle = "Tools Manager";
  if (pathname.startsWith("/admin/newsletter/subscribers")) pageTitle = "Subscribers";
  if (pathname.startsWith("/admin/newsletter/campaigns")) pageTitle = "Campaigns";
  if (pathname.startsWith("/admin/newsletter")) pageTitle = "Newsletter";
  if (pathname.startsWith("/quiz")) pageTitle = "Quiz Player";

  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full bg-transparent">
      {/* ───── Sidebar ───── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-brand-copper/10 bg-white lg:flex">
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[#B38B6D]/10 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-white shadow-sm overflow-hidden border border-[#B38B6D]/20">
            <img src="/logo.png" alt="SoulWealth Logo" className="w-full h-full object-contain p-0.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2D2D2D]">SoulWealth</p>
            <p className="text-[11px] font-medium tracking-wide text-[#B38B6D]">Admin Console</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-3">
          <div className="mb-2 px-3 pt-2 text-[10px] font-semibold tracking-wider text-[#B38B6D]/80 uppercase">Menu</div>
          {navItems.map((item) => {
            const Icon = item.icon;

            // Exact match for the dashboard, startsWith for others to allow sub-pages
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[#7A8F5B] text-white shadow-[#B38B6D]/10"
                    : "text-[#2D2D2D]/70 hover:bg-[#F5EDE4]/60 hover:text-[#2D2D2D]"
                )}
              >
                
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign-out Grouped Below Navigation */}
        <div className="mt-4 px-3">
          <div className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-brand-copper/80 uppercase">Account</div>
          <Button
            variant="outline"
            className="w-full justify-start border-brand-copper/20 text-brand-dark/60 hover:bg-brand-sand/50 hover:text-brand-dark bg-white"
            onClick={onSignOut}
          >
            <LogOut className="mr-2 h-4 w-4 text-brand-dark/40" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* ───── Main Content ───── */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-brand-copper/10 bg-white/90 px-4 backdrop-blur-md md:px-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-brand-copper">Workspace</p>
            <h1 className="text-base font-semibold text-brand-dark">{pageTitle}</h1>
          </div>
          <div className="lg:hidden">
            <Button
              variant="outline"
              size="sm"
              className="border-brand-copper/20 text-brand-dark/60 hover:bg-brand-sand/50"
              onClick={onSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
