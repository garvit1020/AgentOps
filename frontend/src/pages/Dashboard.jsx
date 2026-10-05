import React, { useState, useEffect, useCallback } from 'react';
import {
  GitBranch, CheckCircle2, Clock, Server, Play, Github,
  Zap, Bot, Container, Activity, RefreshCw, ArrowRight,
  TrendingUp, TrendingDown, AlertTriangle, X, ChevronRight,
  BarChart2, Shield, Terminal
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { api } from '../services/api';
import { useSocket } from '../services/websocket';
import { useNavigate } from 'react-router-dom';

/* ── helpers ── */
const rnd  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const rndArr = (n, min, max) => Array.from({ length: n }, () => ({ v: rnd(min, max) }));

const PIPELINE_STEPS = [
  { id: 0, label: 'Code Push',     icon: Github,     color: '#3b82f6' },
  { id: 1, label: 'AI Analysis',   icon: Bot,        color: '#8b5cf6' },
  { id: 2, label: 'CI/CD',         icon: Zap,        color: '#06b6d4' },
  { id: 3, label: 'Docker Build',  icon: Container,  color: '#f59e0b' },
  { id: 4, label: 'K8s Deploy',    icon: Server,     color: '#10b981' },
  { id: 5, label: 'Monitoring',    icon: Activity,   color: '#ec4899' },
  { id: 6, label: 'Complete ✓',    icon: CheckCircle2, color: '#10b981' },
];

const AGENTS = [
  { id: 1, name: 'Orchestrator',      icon: '🧠', color: '#3b82f6', role: 'Coordinates the full pipeline', status: 'success',  action: 'System healthy · Ready for pipeline triggers' },
  { id: 2, name: 'Code Analysis',     icon: '🔍', color: '#8b5cf6', role: 'LLM code review & security scan', status: 'success', action: 'Score: 98/100 — 0 Vulnerabilities found' },
  { id: 3, name: 'CI/CD',             icon: '⚡', color: '#06b6d4', role: 'GitHub Actions management',       status: 'success',  action: 'Pipeline #1024 — All unit & E2E tests passed' },
  { id: 4, name: 'Deployment',        icon: '🚀', color: '#10b981', role: 'Docker + Kubernetes deploy',       status: 'success',  action: 'Kubernetes cluster synchronized & live' },
  { id: 5, name: 'Monitoring',        icon: '📊', color: '#f59e0b', role: 'Prometheus metrics & recovery',    status: 'running',  action: 'Monitoring 12 pods · 100% Uptime' },
];

const HISTORY = [
  { id: '#1024', repo: 'garvit1020/AgentOps', branch: 'main',    status: 'success',  time: '2m ago',  dur: '3m 45s' },
  { id: '#1023', repo: 'garvit1020/AgentOps', branch: 'develop', status: 'success',  time: '1h ago',  dur: '4m 12s' },
  { id: '#1022', repo: 'garvit1020/AgentOps', branch: 'main',    status: 'success',  time: '3h ago',  dur: '3m 58s' },
  { id: '#1021', repo: 'garvit1020/AgentOps', branch: 'main',    status: 'success',  time: '5h ago',  dur: '2m 50s' },
  { id: '#1020', repo: 'garvit1020/AgentOps', branch: 'main',    status: 'success',  time: '8h ago',  dur: '4m 05s' },
];

/* ── Metric Card ── */
function MetricCard({ title, value, icon: Icon, color, trend, trendVal, data }) {
  const up = trend === 'up';
  return (
    <div className="glass-card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={18} color={color} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', fontWeight: 700, color: up ? 'var(--green-light)' : '#fca5a5' }}>
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trendVal}%
        </div>
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{title}</div>
      </div>
      <div style={{ height: 40 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`g-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#g-${title})`} dot={false} />
            <Tooltip contentStyle={{ display: 'none' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Pipeline Step ── */
function PipelineStep({ step, active, done, last }) {
  const { icon: Icon, color, label } = step;
  const bg = done ? color : active ? `${color}30` : 'rgba(255,255,255,0.04)';
  const border = done || active ? color : 'rgba(255,255,255,0.08)';
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%',
          background: bg, border: `2px solid ${border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: (done || active) ? `0 0 16px ${color}50` : 'none',
          transition: 'all 0.4s ease',
          animation: active ? 'pulse-blue 2s infinite' : 'none'
        }}>
          <Icon size={18} color={done ? '#fff' : active ? color : 'var(--text-muted)'} />
        </div>
        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: done ? color : active ? color : 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap', maxWidth: 64 }}>
          {label}
        </span>
      </div>
      {!last && (
        <div style={{
          width: 40, height: 2, margin: '0 2px', marginBottom: 22, flexShrink: 0,
          background: done ? `linear-gradient(90deg, ${color}, ${PIPELINE_STEPS[step.id + 1]?.color || color})` : 'rgba(255,255,255,0.06)',
          transition: 'background 0.5s ease'
        }} />
      )}
    </div>
  );
}

/* ── Agent Card ── */
function AgentCard({ agent }) {
  const { name, icon, color, role, status, action } = agent;
  const statusBadge = {
    running: { label: 'Running', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', dot: 'running' },
    success: { label: 'Done',    bg: 'rgba(16,185,129,0.12)', color: '#34d399', dot: 'success' },
    idle:    { label: 'Idle',    bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', dot: 'idle' },
    error:   { label: 'Error',   bg: 'rgba(239,68,68,0.12)', color: '#fca5a5', dot: 'error' },
  }[status] || {};

  return (
    <div style={{
      padding: '16px', borderRadius: 12,
      background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      cursor: 'default'
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}50`; e.currentTarget.style.boxShadow = `0 0 20px ${color}15`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            {icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{name}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{role}</div>
          </div>
        </div>
        <div style={{ padding: '3px 10px', borderRadius: 99, background: statusBadge.bg, fontSize: '0.68rem', fontWeight: 700, color: statusBadge.color, display: 'flex', alignItems: 'center', gap: 5 }}>
          <div className={`status-dot ${status}`} style={{ width: 6, height: 6 }} />
          {statusBadge.label}
        </div>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '7px 10px', borderRadius: 7, fontFamily: status === 'running' ? 'JetBrains Mono, monospace' : 'inherit' }}>
        {status === 'running' && <span style={{ color: color }}>▶ </span>}{action}
      </div>
      {status === 'running' && (
        <div style={{ marginTop: 10, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 99, width: '60%', animation: 'progress-fill 3s ease-out forwards' }} />
        </div>
      )}
    </div>
  );
}

/* ── Repo Launcher (Quick Access) ── */
function RepoLauncher({ onLaunch }) {
  const [url, setUrl]     = useState('');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);

  const launch = async () => {
    if (!url.trim()) return;
    setLoading(true);
    await onLaunch(url.trim(), branch.trim() || 'main');
    setLoading(false);
  };

  return (
    <div style={{ padding: '22px 24px', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 4 }}>🚀 Launch New Pipeline</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Paste your GitHub repo URL and let AgentOps handle everything</div>
        </div>
        <div className="badge badge-blue">5 AI Agents Ready</div>
      </div>

      {/* Workflow preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, overflowX: 'auto', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 10 }}>
        {['🔍 Analysis', '⚡ CI/CD', '🐳 Docker', '☸️ K8s', '📊 Monitor', '🔄 Recovery'].map((s, i, a) => (
          <React.Fragment key={s}>
            <span style={{ fontSize: '0.72rem', color: 'var(--blue-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>{s}</span>
            {i < a.length - 1 && <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', flexShrink: 0 }}>→</span>}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }} className="input-group">
          <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Github size={12} /> Repository URL
          </label>
          <div className="input-with-icon">
            <Github size={15} className="input-icon" />
            <input
              className="input-field"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              onKeyDown={e => e.key === 'Enter' && launch()}
            />
          </div>
        </div>
        <div style={{ width: 140 }} className="input-group">
          <label className="input-label">Branch</label>
          <input className="input-field" value={branch} onChange={e => setBranch(e.target.value)} placeholder="main" onKeyDown={e => e.key === 'Enter' && launch()} />
        </div>
        <button
          onClick={launch}
          disabled={!url.trim() || loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 22px', borderRadius: 10, fontWeight: 700, fontSize: '0.875rem',
            background: url.trim() ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(255,255,255,0.06)',
            color: url.trim() ? '#fff' : 'var(--text-muted)',
            border: 'none', cursor: url.trim() ? 'pointer' : 'not-allowed',
            boxShadow: url.trim() ? '0 4px 14px rgba(59,130,246,0.4)' : 'none',
            transition: 'all 0.2s', flexShrink: 0, marginBottom: 0, height: 44
          }}
        >
          {loading
            ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'rotate 0.7s linear infinite' }} /> Starting...</>
            : <><Play size={14} fill={url.trim() ? '#fff' : 'var(--text-muted)'} /> Launch Pipeline</>
          }
        </button>
      </div>

      {/* Quick-select repos */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quick pick:</span>
        {[
          { label: 'garvit1020/AgentOps', url: 'https://github.com/garvit1020/AgentOps' },
          { label: 'facebook/react',      url: 'https://github.com/facebook/react' },
          { label: 'vercel/next.js',      url: 'https://github.com/vercel/next.js' },
        ].map(r => (
          <button key={r.url} onClick={() => setUrl(r.url)} style={{
            padding: '3px 12px', borderRadius: 99, fontSize: '0.7rem', cursor: 'pointer',
            background: url === r.url ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${url === r.url ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`,
            color: url === r.url ? 'var(--blue-light)' : 'var(--text-muted)',
            transition: 'all 0.2s', fontFamily: 'JetBrains Mono, monospace'
          }}>{r.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ── Alert item ── */
function AlertItem({ alert, onResolve }) {
  const cfg = {
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: '🔴' },
    warning:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: '🟡' },
    info:     { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', icon: '🔵' },
  }[alert.severity] || {};
  return (
    <div style={{ padding: '14px 16px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.85rem' }}>{cfg.icon}</span>
          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: cfg.color }}>{alert.title}</span>
        </div>
        <button onClick={() => onResolve(alert.id)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }} title="Resolve">
          <X size={13} />
        </button>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{alert.description}</p>
      <div style={{ fontSize: '0.72rem', color: cfg.color, fontStyle: 'italic', padding: '6px 10px', background: `${cfg.color}10`, borderRadius: 7, borderLeft: `2px solid ${cfg.color}` }}>
        💡 AI Suggestion: {alert.suggestion}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const raw  = localStorage.getItem('agentops_user');
  const user = raw ? JSON.parse(raw) : { name: 'Developer' };

  const [pipelineStep, setPipelineStep] = useState(6); // Step 6 = Complete
  const [agents, setAgents]   = useState(AGENTS);
  const [alerts, setAlerts]   = useState([
    { id: 1, title: 'Security Audit Complete', severity: 'info', description: 'All repository dependencies analyzed. 0 critical vulnerabilities found.', suggestion: 'Automated vulnerability scanning active.' },
    { id: 2, title: 'Cluster Auto-Scaling Active', severity: 'info', description: 'Kubernetes node pool auto-scaled to 3 nodes based on current traffic.', suggestion: 'Cluster resources operating at peak efficiency.' },
  ]);

  const [metrics] = useState({
    pipelines: { val: '1,284', trend: 'up',   trendVal: 12.5, data: rndArr(12, 80, 120) },
    success:   { val: '98.2%', trend: 'up',   trendVal: 2.1,  data: rndArr(12, 90, 100) },
    depltime:  { val: '2m 14s',trend: 'down',  trendVal: 5.4,  data: rndArr(12, 100, 160) },
    active:    { val: '8',     trend: 'up',   trendVal: 14,   data: rndArr(12, 5, 12) },
  });

  /* Animate pipeline step if active */
  useEffect(() => {
    /* static complete by default unless socket updates */
  }, []);

  useSocket('pipeline:step', useCallback(d => {
    if (d.step !== undefined) setPipelineStep(d.step);
  }, []));

  useSocket('agent:update', useCallback(d => {
    setAgents(prev => prev.map(a => a.id === d.id ? { ...a, ...d } : a));
  }, []));

  const handleLaunch = async (repoUrl, branch) => {
    try {
      await api.triggerPipeline({ repo_url: repoUrl, branch });
    } catch (e) {
      console.log('Demo mode — pipeline simulated');
    }
    setPipelineStep(0);
    navigate('/pipeline');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', animation: 'fadeIn 0.4s ease' }}>

      {/* ── Welcome Banner ── */}
      <div style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(6,182,212,0.06) 100%)',
        border: '1px solid rgba(59,130,246,0.2)', borderRadius: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>
            Welcome back, <span className="gradient-text">{user.name}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            AgentOps is managing <strong style={{ color: 'var(--text-primary)' }}>12 microservices</strong> · 
            All systems <strong style={{ color: '#10b981' }}>Healthy & Synchronized</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/monitoring')}>
            <Activity size={14} /> Monitoring
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/pipeline')}>
            <GitBranch size={14} /> View Pipelines
          </button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <MetricCard title="Total Pipelines" value={metrics.pipelines.val} icon={GitBranch}    color="#3b82f6" trend="up"   trendVal={12.5} data={metrics.pipelines.data} />
        <MetricCard title="Success Rate"    value={metrics.success.val}   icon={CheckCircle2} color="#10b981" trend="up"   trendVal={2.1}  data={metrics.success.data} />
        <MetricCard title="Avg Deploy Time" value={metrics.depltime.val}  icon={Clock}        color="#f59e0b" trend="down" trendVal={5.4}  data={metrics.depltime.data} />
        <MetricCard title="Active Services" value={metrics.active.val}    icon={Server}       color="#8b5cf6" trend="up"   trendVal={14}   data={metrics.active.data} />
      </div>

      {/* ── Repo Launcher ── */}
      <RepoLauncher onLaunch={handleLaunch} />

      {/* ── Pipeline Flow ── */}
      <div className="glass-card" style={{ padding: '22px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Latest Pipeline Run · garvit1020/AgentOps · <span style={{ color: '#60a5fa' }}>main</span></h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Pipeline #1024 · All 6 pipeline stages passed successfully</p>
          </div>
          <div className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="status-dot success" style={{ width: 6, height: 6 }} />
            Completed
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 4 }}>
          {PIPELINE_STEPS.map((step, i) => (
            <PipelineStep key={step.id} step={step} active={i === pipelineStep} done={i < pipelineStep} last={i === PIPELINE_STEPS.length - 1} />
          ))}
        </div>
      </div>

      {/* ── Middle: Agents + Alerts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        {/* Agents */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Agents Status</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/agents')} style={{ fontSize: '0.75rem' }}>
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {agents.map(a => <AgentCard key={a.id} agent={a} />)}
          </div>
        </div>

        {/* Alerts */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Active Alerts</h3>
            <span className="badge badge-red">{alerts.length}</span>
          </div>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={32} color="#10b981" style={{ marginBottom: 8 }} />
              <div>All systems healthy!</div>
            </div>
          ) : alerts.map(a => (
            <AlertItem key={a.id} alert={a} onResolve={id => setAlerts(prev => prev.filter(al => al.id !== id))} />
          ))}
        </div>
      </div>

      {/* ── Pipeline History ── */}
      <div className="glass-card" style={{ padding: '22px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Recent Pipeline Runs</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/pipeline')} style={{ fontSize: '0.75rem' }}>
            Full history <ChevronRight size={13} />
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Run</th><th>Repository</th><th>Branch</th><th>Status</th><th>Duration</th><th>Time</th>
            </tr>
          </thead>
          <tbody>
            {HISTORY.map(h => (
              <tr key={h.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/pipeline')}>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--blue-light)' }}>{h.id}</td>
                <td style={{ fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Github size={13} color="var(--text-muted)" /> {h.repo}
                  </div>
                </td>
                <td><span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{h.branch}</span></td>
                <td>
                  <span className={`badge ${h.status === 'success' ? 'badge-green' : h.status === 'running' ? 'badge-blue' : 'badge-red'}`} style={{ fontSize: '0.72rem' }}>
                    <div className={`status-dot ${h.status}`} style={{ width: 5, height: 5 }} /> {h.status}
                  </span>
                </td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{h.dur}</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{h.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
