import { useAuth } from "@/_core/hooks/useAuth";
import { AtlasNav } from "@/components/AtlasNav";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, Compass, LockKeyhole, Sparkles, UserRound } from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const sessions = trpc.atlas.listSessions.useQuery(undefined, { enabled: isAuthenticated });
  return <div className="atlas-app-shell"><AtlasNav compact /><main className="atlas-page-shell">
    <section className="page-heading"><span className="atlas-eyebrow"><span className="signal-dot" /> ACCOUNT</span><h1>Your Atlas <i>profile.</i></h1><p>Manage the identity and private engineering memory behind your analysis sessions.</p></section>
    {!loading && !isAuthenticated ? <section className="access-card"><LockKeyhole size={23} /><h2>Your sessions are private by default.</h2><p>Sign in to build your profile and keep analysis history attached to you.</p><Button onClick={() => startLogin()}>Sign in to continue <ArrowUpRight size={16} /></Button></section> : <section className="profile-grid"><article className="profile-card"><div className="profile-avatar">{user?.name?.slice(0, 1).toUpperCase() || "A"}</div><div><span className="profile-label">ATLAS OPERATOR</span><h2>{user?.name || "Atlas user"}</h2><p>{user?.email || "Your account is connected through secure sign-in."}</p></div><div className="profile-divider" /><div className="profile-stat"><span>{sessions.data?.length || 0}</span><p>saved sessions</p></div></article><article className="profile-card profile-privacy"><LockKeyhole size={21} /><span className="profile-label">PRIVACY DEFAULT</span><h2>Session ownership is enforced.</h2><p>Only the signed-in account can retrieve its stored files, reports, and conversations.</p></article><article className="profile-card profile-next"><Compass size={21} /><span className="profile-label">NEXT MOVE</span><h2>Build your first change map.</h2><p>Give Atlas a focused file, intended change, and let evidence lead the next review.</p><Link href="/workspace"><Button>Open workspace <ArrowUpRight size={15} /></Button></Link></article></section>}
  </main></div>;
}
