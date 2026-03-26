import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BookOpen, History, BarChart3, Settings, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";
import { useTheme } from "@/components/ThemeProvider";

const nav = [
  { to: "/", label: "Diário", Icon: BookOpen },
  { to: "/historico", label: "Histórico", Icon: History },
  { to: "/analise", label: "Análise", Icon: BarChart3 },
  { to: "/configuracoes", label: "Configurações", Icon: Settings },
];

export default function Layout() {
  const { theme, toggle } = useTheme();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded border border-foreground/20 bg-foreground flex items-center justify-center shrink-0">
              <span className="text-background text-[10px] font-bold tracking-tighter">TD</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">Diário TDAH</span>
          </div>

          <button
            onClick={toggle}
            className="h-8 w-8 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Alternar tema"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-24">
        <div key={location.pathname} className="animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out">
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-lg mx-auto flex">
          {nav.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors tracking-wide",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      <Toaster />
    </div>
  );
}
