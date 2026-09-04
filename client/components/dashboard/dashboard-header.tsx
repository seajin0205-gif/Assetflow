import { Link } from "react-router-dom";
import { Bell, Search, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-subtle bg-white/80 backdrop-blur-xl dark:bg-background/75">
      <div className="mx-auto flex max-w-dashboard flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-8 lg:py-6">
        <div className="flex shrink-0 items-center gap-4">
          <img
            src="/logo-transparent.png"
            alt="Assetflow"
            className="h-10 w-auto object-contain lg:h-12"
          />
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">
              Assetflow
            </h1>
          </div>
        </div>

        <div className="order-3 w-full min-w-0 flex-1 sm:order-none sm:max-w-md lg:max-w-lg">
          <div className="saas-input">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tickers, reports, risk"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button type="button" className="btn-ghost hidden sm:inline-flex">
            Import
          </button>
          <Link to="/trade" className="btn-primary">
            New trade
          </Link>
        </div>

        <div className="flex items-center gap-4 border-l border-subtle-strong pl-4 sm:pl-6">
          <ThemeToggle />
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-bold text-white dark:from-emerald-400 dark:to-cyan-500 dark:text-slate-950">
              JG
            </div>
            <span className="text-sm font-medium">Julian Grant</span>
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-blue-50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:hover:bg-white/5"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="User menu"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25 transition hover:from-blue-500 hover:to-blue-600 dark:from-cyan-500 dark:to-blue-600 dark:shadow-lg dark:shadow-blue-500/20 dark:hover:from-cyan-400 dark:hover:to-blue-500"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
