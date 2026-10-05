import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Zap, Shield, Activity, GitBranch, Container,
  BarChart3, ArrowRight, Check, ChevronRight, Star,
  Play, Globe, Lock, Cpu, RefreshCw, Terminal
} from 'lucide-react';

/* ── animated typing text ── */
const words = ['Automate', 'Monitor', 'Deploy', 'Recover', 'Scale'];
function TypingText() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[idx % words.length];
    let timer;
    if (!deleting && displayed.length < word.length) {
      timer = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === word.length) {
      timer = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx(i => i + 1);
    }
    return () => clearTimeout(timer);
  }, [displayed, deleting, idx]);

  return (
    <span className="gradient-text" style={{ minWidth: 200, display: 'inline-block' }}>
      {displayed}<span style={{ animation: 'blink 1s infinite', opacity: 1 }}>|</span>
    </span>
  );
}

/* ── animated counter ── */
function Counter({ target, suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const steps = 60;
    const inc = target / steps;
    let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(cur));
    }, duration / steps);
    return () => clearInterval(t);
  }, [target, duration]);
  return <span>{val.toLocaleString()}{suffix}</span>;
}

/* ── feature card ── */
function FeatureCard({ icon: Icon, title, desc, color, delay = 0 }) {
  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16
      }}>
        <Icon size={22} color={color} />
      </div>
      <h3 style={{ fontWeight: 600, marginBottom: 8, fontSize: '1rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

/* ── agent pill ── */
function AgentPill({ name, icon, color, active }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 16px',
      background: active ? `${color}15` : 'rgba(255,255,255,0.04)',
      border: `1px solid ${active ? color + '40' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 99, transition: 'all 0.3s ease'
    }}>
      <span style={{ fontSize: '1rem' }}>{icon}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: active ? color : 'var(--text-secondary)' }}>{name}</span>
      {active && <div className="status-dot running" />}
    </div>
  );
}

/* ── workflow step ── */
function WorkflowStep({ n, label, icon: Icon, color, active, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: active ? `linear-gradient(135deg, ${color}, ${color}aa)` : 'rgba(255,255,255,0.06)',
          border: `2px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: active ? `0 0 20px ${color}50` : 'none',
          transition: 'all 0.3s ease', flexShrink: 0
        }}>
          <Icon size={20} color={active ? '#fff' : 'var(--text-muted)'} />
        </div>
        <span style={{ fontSize: '0.72rem', color: active ? color : 'var(--text-muted)', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>{label}</span>
      </div>
      {!last && (
        <div style={{ width: 48, height: 2, background: active ? `linear-gradient(90deg, ${color}, rgba(255,255,255,0.1))` : 'rgba(255,255,255,0.08)', margin: '0 4px', marginBottom: 28, flexShrink: 0 }} />
      )}
    </div>
  );
}

const FEATURES = [
  { icon: Bot, title: 'Orchestrator Agent', desc: 'Central AI brain coordinating all agents via LangGraph StateGraph. Makes intelligent decisions at every pipeline step.', color: '#3b82f6', delay: 0 },
  { icon: Shield, title: 'Code Analysis Agent', desc: 'Deep LLM-powered code review detecting security vulnerabilities, code smells, and dependency issues before deployment.', color: '#8b5cf6', delay: 100 },
  { icon: Zap, title: 'CI/CD Agent', desc: 'Automatically generates and triggers GitHub Actions workflows. Monitors builds and test results in real-time.', color: '#06b6d4', delay: 200 },
  { icon: Container, title: 'Deployment Agent', desc: 'Builds Docker images, pushes to registry, and deploys to Kubernetes — zero manual intervention required.', color: '#10b981', delay: 300 },
  { icon: Activity, title: 'Monitoring Agent', desc: 'Continuously watches Prometheus metrics and Grafana dashboards. AI-powered anomaly detection and auto-recovery.', color: '#f59e0b', delay: 400 },
  { icon: RefreshCw, title: 'Self-Healing', desc: 'When failures are detected, the AI analyzes root causes and automatically retries or rolls back deployments.', color: '#ec4899', delay: 500 },
];

const WORKFLOW_STEPS = [
  { label: 'Code Push', icon: GitBranch, color: '#3b82f6' },
  { label: 'AI Analysis', icon: Bot, color: '#8b5cf6' },
  { label: 'CI/CD', icon: Zap, color: '#06b6d4' },
  { label: 'Docker Build', icon: Container, color: '#10b981' },
  { label: 'K8s Deploy', icon: Globe, color: '#f59e0b' },
  { label: 'Monitor', icon: Activity, color: '#ec4899' },
];

const STATS = [
  { label: 'Pipelines Automated', target: 12840, suffix: '+' },
  { label: 'Deploy Success Rate', target: 99, suffix: '%' },
  { label: 'Minutes Saved/Month', target: 480, suffix: 'h' },
  { label: 'Teams Using AgentOps', target: 87, suffix: '+' },
];

const TESTIMONIALS = [
  { name: 'Aditya Verma', role: 'DevOps Lead @ TechCorp', text: 'AgentOps cut our deployment time by 80%. The AI agents catch issues I never would have noticed manually.', avatar: 'AV' },
  { name: 'Priya Sharma', role: 'CTO @ StartupX', text: 'The self-healing feature alone saved us three major outages. This is the future of DevOps.', avatar: 'PS' },
  { name: 'Rahul Gupta', role: 'SRE @ FinanceHub', text: 'Setup took 10 minutes. Now our entire delivery pipeline is fully automated with AI monitoring 24/7.', avatar: 'RG' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % WORKFLOW_STEPS.length), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="landing-bg">
      {/* Background orbs */}
      <div className="orb orb-blue"   style={{ width: 600, height: 600, top: -200, left: -200, animation: 'orb-move 12s ease-in-out infinite' }} />
      <div className="orb orb-purple" style={{ width: 500, height: 500, top: 200, right: -150, animation: 'orb-move 15s ease-in-out infinite reverse' }} />
      <div className="orb orb-cyan"   style={{ width: 400, height: 400, bottom: 100, left: '30%', animation: 'orb-move 10s ease-in-out infinite' }} />

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(2,8,23,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5%', height: 64
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--blue), var(--purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(59,130,246,0.4)'
          }}>
            <Bot size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
            Agent<span className="gradient-text">Ops</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="#features" className="btn btn-ghost btn-sm">Features</a>
          <a href="#workflow" className="btn btn-ghost btn-sm">How It Works</a>
          <a href="#stats" className="btn btn-ghost btn-sm">Stats</a>
          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 6px' }} />
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: '100px 5% 80px', textAlign: 'center', position: 'relative' }}>
        <div className="badge badge-blue" style={{ display: 'inline-flex', marginBottom: 24, fontSize: '0.8rem' }}>
          <span>✨</span> Powered by LangGraph + Groq LLM
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24 }}>
          <TypingText /><br />
          <span style={{ color: 'var(--text-primary)' }}>Your DevOps with</span><br />
          <span style={{ color: 'var(--text-primary)' }}>Agentic </span>
          <span className="gradient-text-purple">AI</span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.8 }}>
          AgentOps uses 5 specialized AI agents to automate your entire software delivery pipeline —
          from code push to Kubernetes deployment, with AI-powered failure recovery.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Start Free <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
            <Play size={16} /> Live Demo
          </button>
        </div>

        {/* Workflow animation */}
        <div className="glass-blue" style={{ maxWidth: 860, margin: '0 auto', padding: '28px 36px', display: 'inline-block' }}>
          <div style={{ marginBottom: 16, fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'left', letterSpacing: '0.08em' }}>
            LIVE PIPELINE — garvit1020/AgentOps · main
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 4 }}>
            {WORKFLOW_STEPS.map((s, i) => (
              <WorkflowStep key={i} {...s} n={i + 1} active={i <= activeStep} last={i === WORKFLOW_STEPS.length - 1} />
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="status-dot running" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {WORKFLOW_STEPS[activeStep]?.label} agent is running...
            </span>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" style={{ padding: '60px 5%', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, maxWidth: 900, margin: '0 auto' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em' }} className="gradient-text">
                <Counter target={s.target} suffix={s.suffix} />
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '80px 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="badge badge-purple" style={{ display: 'inline-flex', marginBottom: 16 }}>5 Specialized AI Agents</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 800, marginBottom: 16 }}>
            Every Agent Has a Purpose
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto' }}>
            Each AI agent is purpose-built with specialized tools and LLM reasoning to handle a specific phase of your DevOps pipeline.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {FEATURES.map((f, i) => <FeatureCard key={i} {...f} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="workflow" style={{ padding: '80px 5%', background: 'rgba(6,16,35,0.5)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="badge badge-green" style={{ display: 'inline-flex', marginBottom: 16 }}>How It Works</div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: 20, lineHeight: 1.2 }}>
              Push code.<br />
              <span className="gradient-text">We handle everything else.</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.8 }}>
              AgentOps intercepts your GitHub push via webhook, spins up the Orchestrator agent,
              and runs the complete 11-step DevOps workflow automatically — no manual intervention needed.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                'Developer pushes code → AgentOps detects it via GitHub webhook',
                'Orchestrator triggers Code Analysis Agent (Groq LLM review)',
                'CI/CD Agent creates & runs GitHub Actions pipeline',
                'Deployment Agent builds Docker image → deploys to Kubernetes',
                'Monitoring Agent watches Prometheus metrics 24/7',
                'On failure: AI analyzes → suggests fix → auto-redeploys',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--blue), var(--purple))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 700, marginTop: 1
                  }}>{i + 1}</div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Code terminal mock */}
            <div className="glass" style={{ overflow: 'hidden' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>AgentOps Terminal</span>
              </div>
              <div style={{ padding: '16px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', lineHeight: 2 }}>
                {[
                  { c: '#10b981', t: '✓ Webhook received: garvit1020/AgentOps@main' },
                  { c: '#3b82f6', t: '→ [Orchestrator] Starting pipeline #1024...' },
                  { c: '#8b5cf6', t: '→ [CodeAnalysis] Fetching repository files...' },
                  { c: '#8b5cf6', t: '✓ [CodeAnalysis] Score: 91/100 — No critical issues' },
                  { c: '#06b6d4', t: '→ [CI/CD] Triggering GitHub Actions workflow...' },
                  { c: '#06b6d4', t: '✓ [CI/CD] Build passed • Tests: 48/48 ✓' },
                  { c: '#10b981', t: '→ [Deployment] Building Docker image...' },
                  { c: '#10b981', t: '✓ [Deployment] agentops:1024 pushed to registry' },
                  { c: '#10b981', t: '✓ [Deployment] K8s rollout complete — 2/2 pods ready' },
                  { c: '#f59e0b', t: '→ [Monitor] Watching metrics... all healthy ✓' },
                ].map((line, i) => (
                  <div key={i} style={{ color: line.c, animation: `fadeIn 0.3s ease ${i * 200}ms both` }}>
                    {line.t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section style={{ padding: '60px 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h3 style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Built With Industry-Standard Technologies
          </h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 900, margin: '0 auto' }}>
          {['React.js', 'Node.js', 'Python', 'LangGraph', 'LangChain', 'Groq LLM', 'GitHub Actions', 'Docker', 'Kubernetes', 'Terraform', 'AWS', 'Prometheus', 'Grafana', 'Loki'].map(t => (
            <div key={t} className="badge badge-gray" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>{t}</div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '80px 5%', background: 'rgba(6,16,35,0.4)', borderTop: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Trusted by DevOps Teams</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="glass-card p-6">
              <div style={{ display: 'flex', marginBottom: 12 }}>
                {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--blue), var(--purple))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 5%', textAlign: 'center', position: 'relative' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 24, padding: '60px 40px'
        }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 16 }}>
            Ready to automate your<br /><span className="gradient-text">DevOps pipeline?</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: '1.1rem' }}>
            Join teams using AgentOps to ship faster, more reliably, with full AI automation.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Create Free Account <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 5%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bot size={18} color="var(--blue)" />
            <span style={{ fontWeight: 700 }}>AgentOps</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>· Intelligent DevOps Automation</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © 2025 AgentOps · UPES B.Tech Project · Built with ❤️
          </div>
        </div>
      </footer>
    </div>
  );
}
