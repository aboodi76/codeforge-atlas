import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Compass, LogOut, Sparkles } from "lucide-react";

const navigation = [
  { href: "/workspace", label: "Workspace" },
  { href: "/history", label: "Sessions" },
  { href: "/profile", label: "Profile" },
];

export function AtlasNav({ compact = false }: { compact?: boolean }) {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className={`atlas-nav ${compact ? "atlas-nav-compact" : ""}`}>
      <div className="atlas-nav-inner">
        <Link href="/" className="atlas-brand" aria-label="CodeForge Atlas home">
          <span className="atlas-brand-mark"><Compass size={16} strokeWidth={2.5} /></span>
          <span>CodeForge <em>Atlas</em></span>
        </Link>

        <nav className="atlas-links" aria-label="Primary navigation">
          {navigation.map(item => (
            <Link key={item.href} href={item.href} className={location.startsWith(item.href) ? "active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="atlas-nav-actions">
          {isAuthenticated ? (
            <>
              <span className="atlas-user-dot" title={user?.name || "Signed in"}>{user?.name?.slice(0, 1).toUpperCase() || "A"}</span>
              <Button variant="ghost" size="sm" onClick={() => logout()} className="atlas-logout" aria-label="Log out">
                <LogOut size={15} />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => startLogin()} className="atlas-signin">Sign in</Button>
          )}
          <Button size="sm" onClick={() => (isAuthenticated ? (window.location.href = "/workspace") : startLogin())} className="atlas-nav-cta">
            <Sparkles size={14} /> Start analysis <ArrowUpRight size={14} />
          </Button>
        </div>
      </div>
    </header>
  );
}
