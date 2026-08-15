import { useAuth } from "@/_core/hooks/useAuth";
import { AtlasNav } from "@/components/AtlasNav";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, Clock3, FileCode2, FolderSearch, Sparkles } from "lucide-react";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

export default function History() {
  const { isAuthenticated, loading } = useAuth();
  const sessions = trpc.atlas.listSessions.useQuery(undefined, { enabled: isAuthenticated });
  const [query, setQuery] = useState("");
  const filteredSessions = useMemo(() => (sessions.data || []).filter(session => `${session.title} ${session.changeIntent} ${session.language}`.toLowerCase().includes(query.trim().toLowerCase())), [sessions.data, query]);

  return (
    <div className="atlas-app-shell"><AtlasNav compact /><main className="atlas-page-shell">
      <section className="page-heading"><span className="atlas-eyebrow"><span className="signal-dot" /> ENGINEERING MEMORY</span><h1>Your Atlas <i>sessions.</i></h1><p>Every report, question, and verification path stays attached to the source context that created it.</p></section>
      {!loading && !isAuthenticated ? <section className="access-card"><Sparkles size={23} /><h2>Keep your engineering context private.</h2><p>Sign in to create and revisit your saved Atlas analysis sessions.</p><Button onClick={() => startLogin()}>Sign in to continue <ArrowUpRight size={16} /></Button></section> : sessions.isLoading ? <section className="history-loading"><Clock3 className="animate-spin" /> Loading your sessions…</section> : !sessions.data?.length ? <section className="empty-history"><FolderSearch size={30} /><h2>No saved sessions yet.</h2><p>Your first change map becomes the start of a searchable engineering memory.</p><Link href="/workspace"><Button>Open Atlas workspace <ArrowUpRight size={16} /></Button></Link></section> : <><label className="history-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search titles, intent, or language" aria-label="Search Atlas sessions" /><span>{filteredSessions.length} of {sessions.data.length}</span></label><section className="history-list">{filteredSessions.length ? filteredSessions.map(session => <article key={session.id} className="history-row"><div className="history-file-icon"><FileCode2 size={20} /></div><div className="history-main"><div className="history-title-row"><h2>{session.title}</h2><span className={`status-chip status-${session.status}`}>{session.status}</span></div><p>{session.changeIntent}</p><span><Clock3 size={13} /> {new Date(session.updatedAt).toLocaleDateString()}</span></div><div className="history-language">{session.language}</div><Link href={`/workspace?session=${session.id}`} className="history-open">Open <ArrowUpRight size={16} /></Link></article>) : <div className="history-no-results"><FolderSearch size={20} /> No matching sessions. Try a file name, intent, or language.</div>}</section></>}
    </main></div>
  );
}
