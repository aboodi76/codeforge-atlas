import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { AtlasNav } from "@/components/AtlasNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Braces,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Code2,
  FileCode2,
  FileUp,
  Loader2,
  Network,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Target,
  TestTube2,
  Waypoints,
  WandSparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

type Report = {
  title: string;
  systemSummary: string;
  confidence: "low" | "medium" | "high";
  evidence: Array<{ file: string; fragment: string; explanation: string }>;
  assumptions: Array<{ claim: string; whyItMatters: string; validation: string }>;
  systemMap: { nodes: Array<{ id: string; label: string; kind: "source" | "module" | "rule" | "test" | "external"; confidence: "low" | "medium" | "high" }>; links: Array<{ from: string; to: string; relationship: string }> };
  changeImpact: Array<{ area: string; risk: "low" | "medium" | "high"; reason: string; verification: string }>;
  review: Array<{ severity: "info" | "low" | "medium" | "high"; title: string; explanation: string; fix: string }>;
  documentation: { docstrings: string; readme: string };
  unitTests: { framework: string; content: string; notes: string };
  followUpQuestions: string[];
};

const languages = ["TypeScript", "JavaScript", "Python", "Java", "Go", "Rust", "PHP", "C#", "Other"];
const sampleCode = `export function calculateOrderTotal(items: CartItem[], discount?: number) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return subtotal - (discount || 0);
}`;

function inferLanguage(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ({ ts: "TypeScript", tsx: "TypeScript", js: "JavaScript", jsx: "JavaScript", py: "Python", java: "Java", go: "Go", rs: "Rust", php: "PHP", cs: "C#" } as Record<string, string>)[ext || ""] || "Other";
}

function RiskBadge({ value }: { value: string }) {
  return <span className={cn("risk-badge", `risk-${value}`)}>{value}</span>;
}

function EmptyReport() {
  return (
    <div className="atlas-empty-report">
      <div className="empty-orbit"><Network size={30} /><span /><span /><span /></div>
      <h3>Your change map will appear here.</h3>
      <p>Give Atlas a file and a clear intent. It will separate direct evidence from assumptions before suggesting a verification path.</p>
      <div className="empty-report-legend"><span><i className="legend-evidence" /> Evidence</span><span><i className="legend-impact" /> Impact</span><span><i className="legend-verify" /> Verify</span></div>
    </div>
  );
}

function ReportView({ report }: { report: Report }) {
  const [tab, setTab] = useState<"impact" | "map" | "review" | "tests" | "knowledge">("impact");
  const copy = async (value: string) => navigator.clipboard?.writeText(value);

  return (
    <div className="atlas-report-content">
      <div className="report-summary-row">
        <div><span className="report-kicker">ATLAS READOUT</span><h2>{report.title}</h2></div>
        <div className="confidence-chip"><span className={`confidence-dot ${report.confidence}`} /> {report.confidence} confidence</div>
      </div>
      <p className="report-summary">{report.systemSummary}</p>
      <div className="atlas-report-tabs" role="tablist">
        {(["impact", "map", "review", "tests", "knowledge"] as const).map(item => (
          <button key={item} onClick={() => setTab(item)} className={tab === item ? "active" : ""}>{item}</button>
        ))}
      </div>

      {tab === "impact" && (
        <div className="report-list">
          {report.changeImpact.length ? report.changeImpact.map((item, index) => (
            <article className="impact-row" key={`${item.area}-${index}`}>
              <div className="impact-number">0{index + 1}</div>
              <div className="impact-copy"><div className="impact-title"><h3>{item.area}</h3><RiskBadge value={item.risk} /></div><p>{item.reason}</p><div className="verification-line"><ClipboardCheck size={14} /> {item.verification}</div></div>
            </article>
          )) : <p className="report-empty-copy">Atlas found no sufficiently supported impact area. Add related files or clarify the intended change.</p>}
          {report.evidence.length > 0 && <div className="evidence-block"><span className="report-kicker">EVIDENCE</span>{report.evidence.slice(0, 3).map((item, index) => <div className="evidence-row" key={`${item.file}-${index}`}><FileCode2 size={15} /><div><b>{item.file}</b><code>{item.fragment}</code><p>{item.explanation}</p></div></div>)}</div>}
        </div>
      )}
      {tab === "map" && <div className="atlas-system-map"><div className="system-map-head"><Waypoints size={16} /><div><b>Visible system map</b><span>Only nodes supported by the supplied source appear here.</span></div></div>{report.systemMap.nodes.length ? <><div className="system-map-nodes">{report.systemMap.nodes.map(node => <div className={`map-node map-node-${node.kind}`} key={node.id}><span className={`confidence-dot ${node.confidence}`} /><div><b>{node.label}</b><small>{node.kind}</small></div></div>)}</div><div className="map-links"><span className="report-kicker">SUPPORTED RELATIONSHIPS</span>{report.systemMap.links.length ? report.systemMap.links.map((link, index) => <p key={`${link.from}-${link.to}-${index}`}><code>{link.from}</code><span>{link.relationship}</span><code>{link.to}</code></p>) : <p>No supported cross-node relationship was detected.</p>}</div></> : <p className="report-empty-copy">Atlas could not map enough directly supported nodes. Provide connected files to expand this view.</p>}</div>}
      {tab === "review" && <div className="report-list">{report.review.length ? report.review.map((item, index) => <article className="review-row" key={`${item.title}-${index}`}><div className="review-severity"><RiskBadge value={item.severity === "info" ? "low" : item.severity} /></div><div><h3>{item.title}</h3><p>{item.explanation}</p><div className="fix-line"><WandSparkles size={14} /> {item.fix}</div></div></article>) : <p className="report-empty-copy">No review findings were produced from the supplied evidence.</p>}</div>}
      {tab === "tests" && <div className="generated-output"><div className="generated-output-head"><div><TestTube2 size={16} /><span>{report.unitTests.framework} test plan</span></div><Button variant="ghost" size="sm" onClick={() => copy(report.unitTests.content)}>Copy</Button></div><pre>{report.unitTests.content || report.unitTests.notes}</pre><p>{report.unitTests.notes}</p></div>}
      {tab === "knowledge" && <div className="knowledge-stack"><div className="generated-output"><div className="generated-output-head"><div><Braces size={16} /><span>Generated docstrings</span></div><Button variant="ghost" size="sm" onClick={() => copy(report.documentation.docstrings)}>Copy</Button></div><pre>{report.documentation.docstrings}</pre></div><div className="generated-output"><div className="generated-output-head"><div><FileCode2 size={16} /><span>README draft</span></div><Button variant="ghost" size="sm" onClick={() => copy(report.documentation.readme)}>Copy</Button></div><pre>{report.documentation.readme}</pre></div></div>}
      {report.assumptions.length > 0 && <div className="assumptions-block"><span className="report-kicker">ASSUMPTIONS TO VERIFY</span>{report.assumptions.map((item, index) => <div className="assumption-row" key={`${item.claim}-${index}`}><AlertTriangle size={14} /><div><b>{item.claim}</b><p>{item.whyItMatters}</p><span><ShieldCheck size={12} /> {item.validation}</span></div></div>)}</div>}
      {report.followUpQuestions.length > 0 && <div className="follow-up-block"><CircleHelp size={17} /><div><b>Questions that would increase confidence</b>{report.followUpQuestions.map(question => <span key={question}>{question}</span>)}</div></div>}
    </div>
  );
}

export default function Workspace() {
  const { isAuthenticated, loading } = useAuth();
  const [language, setLanguage] = useState("TypeScript");
  const [filename, setFilename] = useState("checkout.ts");
  const [code, setCode] = useState(sampleCode);
  const [changeIntent, setChangeIntent] = useState("Make the checkout total safer when an item, quantity, or discount is invalid.");
  const [activeSessionId, setActiveSessionId] = useState<number | null>(() => {
    const sessionId = Number(new URLSearchParams(window.location.search).get("session"));
    return Number.isInteger(sessionId) && sessionId > 0 ? sessionId : null;
  });
  const utils = trpc.useUtils();
  const createSession = trpc.atlas.createSession.useMutation();
  const analyze = trpc.atlas.analyze.useMutation({
    onSuccess: async () => {
      await utils.atlas.getSession.invalidate();
      await utils.atlas.listSessions.invalidate();
    },
  });
  const sessionQuery = trpc.atlas.getSession.useQuery({ sessionId: activeSessionId || 0 }, { enabled: Boolean(activeSessionId && isAuthenticated) });
  const chat = trpc.atlas.chat.useMutation({ onSuccess: () => activeSessionId && utils.atlas.getSession.invalidate({ sessionId: activeSessionId }) });
  const report = useMemo(() => {
    if (!sessionQuery.data?.report?.payload) return undefined;
    try { return JSON.parse(sessionQuery.data.report.payload) as Report; } catch { return undefined; }
  }, [sessionQuery.data?.report?.payload]);
  const chatMessages: Message[] = (sessionQuery.data?.messages || []).map(message => ({ role: message.role, content: message.content }));
  const busy = createSession.isPending || analyze.isPending;

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    setFilename(file.name);
    setCode(content);
    setLanguage(inferLanguage(file.name));
  };

  const runAtlas = () => {
    if (!isAuthenticated) return startLogin();
    if (code.trim().length < 20 || changeIntent.trim().length < 4) return;
    createSession.mutate({ language, code, filename, changeIntent }, {
      onSuccess: ({ sessionId }) => {
        setActiveSessionId(sessionId);
        window.history.replaceState({}, "", `/workspace?session=${sessionId}`);
        analyze.mutate({ sessionId });
      },
    });
  };

  return (
    <div className="atlas-app-shell">
      <AtlasNav compact />
      <main className="workspace-shell">
        <section className="workspace-intro"><Link href="/"><ArrowLeft size={14} /> Back to overview</Link><div><span className="atlas-eyebrow"><span className="signal-dot" /> ATLAS WORKSPACE</span><h1>Give your next change a <i>map.</i></h1><p>Paste a focused file or upload source code. Atlas analyzes only what you provide, then shows evidence, impact, and the next verification step.</p></div></section>
        {!loading && !isAuthenticated && <div className="workspace-login-notice"><ShieldAlert size={18} /><span>Sign in to save a private session and run Atlas analysis.</span><Button size="sm" onClick={() => startLogin()}>Sign in</Button></div>}

        <section className="workspace-grid">
          <div className="workspace-editor-panel">
            <div className="workspace-panel-head"><div><span className="panel-overline">01 / SOURCE</span><h2>Frame the change.</h2></div><Badge className="private-badge"><ShieldCheck size={12} /> private session</Badge></div>
            <div className="source-meta-grid"><label><span>Filename</span><Input value={filename} onChange={event => setFilename(event.target.value)} /></label><label><span>Language</span><select value={language} onChange={event => setLanguage(event.target.value)}>{languages.map(item => <option key={item}>{item}</option>)}</select></label></div>
            <div className="upload-line"><label className="upload-action"><FileUp size={15} /> Upload source file<input type="file" accept=".ts,.tsx,.js,.jsx,.py,.java,.go,.rs,.php,.cs,.txt" onChange={onUpload} /></label><span>or paste code below</span></div>
            <Textarea value={code} onChange={event => setCode(event.target.value)} className="atlas-code-input" spellCheck={false} aria-label="Source code" />
            <label className="intent-field"><span><Target size={15} /> What are you trying to change?</span><Textarea value={changeIntent} onChange={event => setChangeIntent(event.target.value)} placeholder="Example: Move the discount rule to a shared pricing service." /></label>
            <div className="analysis-disclaimer"><AlertTriangle size={14} /> Atlas does not execute your code. Treat every suggestion as a review input, not a production decision.</div>
            <Button onClick={runAtlas} disabled={busy || code.trim().length < 20 || changeIntent.trim().length < 4} className="launch-atlas-button">{busy ? <><Loader2 className="animate-spin" size={17} /> Mapping your change…</> : <><Sparkles size={17} /> Run Atlas preflight <ChevronRight size={17} /></>}</Button>
            {createSession.error && <p className="form-error">{createSession.error.message}</p>}{analyze.error && <p className="form-error">{analyze.error.message}</p>}
          </div>

          <div className="workspace-report-panel">
            <div className="workspace-panel-head"><div><span className="panel-overline">02 / READOUT</span><h2>Impact report.</h2></div>{activeSessionId && <span className="session-state">{analyze.isPending ? "Analyzing" : sessionQuery.data?.session.status || "Preparing"}</span>}</div>
            {busy || sessionQuery.isLoading ? <div className="atlas-report-loading"><div className="loading-network"><Network size={35} /></div><h3>Tracing the change surface…</h3><p>Atlas is organizing evidence, risks, and verification paths.</p></div> : report ? <ReportView report={report} /> : <EmptyReport />}
          </div>
        </section>

        <section className="workspace-chat-section">
          <div className="workspace-panel-head"><div><span className="panel-overline">03 / ASK</span><h2>Talk to Atlas.</h2></div><span className="chat-context"><Bot size={14} /> {activeSessionId ? "grounded in this session" : "start an analysis first"}</span></div>
          <AIChatBox messages={chatMessages} onSendMessage={message => activeSessionId && chat.mutate({ sessionId: activeSessionId, message })} isLoading={chat.isPending} height="410px" placeholder={activeSessionId ? "Ask about the code, its risks, or its test plan…" : "Run Atlas preflight to open a contextual conversation."} emptyStateMessage={activeSessionId ? "Ask Atlas to explain a relationship, a risk, or a test decision." : "Your private session conversation will appear here."} suggestedPrompts={activeSessionId ? ["What is the highest-risk change here?", "Which edge case should I test first?", "Explain the strongest evidence you found."] : undefined} className="atlas-chat-box" />
        </section>
      </main>
    </div>
  );
}
