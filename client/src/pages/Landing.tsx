import { useAuth } from "@/_core/hooks/useAuth";
import { AtlasNav } from "@/components/AtlasNav";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  Braces,
  Check,
  CircleDotDashed,
  FileSearch,
  GitPullRequestArrow,
  Network,
  Radar,
  ShieldCheck,
  Sparkles,
  TestTube2,
} from "lucide-react";

const modules = [
  { name: "Checkout orchestration", state: "high impact", color: "rose" },
  { name: "Price rule engine", state: "review", color: "violet" },
  { name: "Order contract tests", state: "verify", color: "mint" },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const begin = () => (isAuthenticated ? setLocation("/workspace") : startLogin());

  return (
    <div className="atlas-site-shell">
      <AtlasNav />
      <main>
        <section className="atlas-hero">
          <div className="atlas-grid-orbit atlas-grid-orbit-one" />
          <div className="atlas-grid-orbit atlas-grid-orbit-two" />
          <div className="atlas-hero-copy">
            <div className="atlas-eyebrow"><span className="signal-dot" /> INTELLIGENCE FOR COMPLEX CODEBASES</div>
            <h1>Know the <span>blast radius</span><br />before you change code.</h1>
            <p>
              CodeForge Atlas turns unfamiliar code into an evidence-backed map—so every change starts with context, risk, and a clear verification path.
            </p>
            <div className="atlas-hero-actions">
              <Button onClick={begin} className="atlas-primary-button">Map your change <ArrowRight size={17} /></Button>
              <Link href="#how-it-works" className="atlas-text-link">See how it works <ArrowRight size={15} /></Link>
            </div>
            <div className="atlas-trust-row">
              <span><ShieldCheck size={15} /> Evidence before assumptions</span>
              <span><Check size={15} /> Private by default</span>
              <span><Braces size={15} /> Built for real repositories</span>
            </div>
          </div>

          <div className="atlas-hero-visual" aria-label="An illustration of an Atlas impact analysis">
            <div className="atlas-panel-label"><Radar size={14} /> CHANGE PREFLIGHT <span className="live-label">LIVE</span></div>
            <div className="atlas-radar">
              <div className="radar-ring ring-one" />
              <div className="radar-ring ring-two" />
              <div className="radar-ring ring-three" />
              <div className="radar-axis axis-x" />
              <div className="radar-axis axis-y" />
              <div className="radar-core"><Network size={28} /></div>
              <div className="radar-blip blip-one" />
              <div className="radar-blip blip-two" />
              <div className="radar-blip blip-three" />
            </div>
            <div className="atlas-module-stack">
              {modules.map(module => (
                <div key={module.name} className="atlas-module-row">
                  <span className={`module-color ${module.color}`} />
                  <span>{module.name}</span>
                  <span className="module-state">{module.state}</span>
                </div>
              ))}
            </div>
            <div className="atlas-impact-notice"><CircleDotDashed size={16} /> 3 areas need verification before merge.</div>
          </div>
        </section>

        <section className="atlas-proof-strip">
          <div><span className="proof-number">01</span><p>Map code and intent<br /><b>in one workspace.</b></p></div>
          <div><span className="proof-number">02</span><p>Inspect change impact<br /><b>before touching production.</b></p></div>
          <div><span className="proof-number">03</span><p>Keep engineering knowledge<br /><b>attached to the work.</b></p></div>
        </section>

        <section className="atlas-feature-section" id="how-it-works">
          <div className="atlas-section-heading">
            <div className="atlas-eyebrow"><span className="signal-dot" /> A BETTER PREFLIGHT</div>
            <h2>From a code change<br />to a confident release.</h2>
          </div>
          <div className="atlas-feature-grid">
            <article className="atlas-feature-card feature-card-large">
              <div className="feature-icon"><Network size={21} /></div>
              <span className="feature-index">01 / Map</span>
              <h3>Connect the parts that matter.</h3>
              <p>Atlas reads the supplied files and change intent together, creating a practical map of functions, contracts, and dependencies.</p>
              <div className="feature-graphic-map"><span /><span /><span /><i /><i /><i /></div>
            </article>
            <article className="atlas-feature-card">
              <div className="feature-icon"><GitPullRequestArrow size={21} /></div>
              <span className="feature-index">02 / Predict</span>
              <h3>See the blast radius.</h3>
              <p>Prioritized impact areas show the risk, supporting evidence, and the exact verification step to take next.</p>
            </article>
            <article className="atlas-feature-card feature-card-accent">
              <div className="feature-icon"><TestTube2 size={21} /></div>
              <span className="feature-index">03 / Verify</span>
              <h3>Generate the proof.</h3>
              <p>Create unit-test plans, focused documentation, and review notes that remain connected to the original session.</p>
            </article>
            <article className="atlas-feature-card">
              <div className="feature-icon"><FileSearch size={21} /></div>
              <span className="feature-index">04 / Remember</span>
              <h3>Turn work into team knowledge.</h3>
              <p>Every conversation, report, and decision stays searchable so new contributors can start with context.</p>
            </article>
          </div>
        </section>

        <section className="atlas-final-cta">
          <div className="atlas-final-glow" />
          <Sparkles size={23} />
          <h2>Change code with<br /><span>more than a hunch.</span></h2>
          <p>Start a private Atlas session, give your change a map, and make the next review easier.</p>
          <Button onClick={begin} className="atlas-primary-button">Open your workspace <ArrowRight size={17} /></Button>
        </section>
      </main>
      <footer className="atlas-footer">
        <span>© 2026 CodeForge Atlas</span>
        <span>Evidence-led engineering intelligence.</span>
      </footer>
    </div>
  );
}
