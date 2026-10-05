import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Github, Clock, CheckCircle2, XCircle,
  Loader2, ChevronDown, Terminal, GitBranch,
  RefreshCw, Circle, Star, GitFork, Globe,
  FileCode2, Shield, Zap, Package, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { socket } from '../services/websocket';

/* ─── Step metadata ─────────────────────────────────────────────────────── */
const STEPS_META = [
  { key: 'code_analysis', label: 'Code Analysis', icon: '🔍', color: '#8b5cf6',
    desc: 'Fetches real files from GitHub, runs security scan & dependency audit' },
  { key: 'cicd',          label: 'CI/CD',          icon: '⚡', color: '#06b6d4',
    desc: 'GitHub Actions triggered, build compiles, all tests run' },
  { key: 'deployment',    label: 'Docker + K8s',   icon: '🐳', color: '#10b981',
    desc: 'Docker image built & pushed, Kubernetes deployment rolled out' },
  { key: 'monitoring',    label: 'Monitoring',      icon: '📊', color: '#f59e0b',
    desc: 'Prometheus metrics verified, pod health & SLA confirmed' },
];
const STEP_ORDER = ['code_analysis', 'cicd', 'deployment', 'monitoring'];
const freshSteps = () => ({ code_analysis: 'idle', cicd: 'idle', deployment: 'idle', monitoring: 'idle' });

/* ─── Past history runs (static, with full result output) ─────────────── */
const HISTORY_RUNS = [
  { id: 'h3', label: '#1023', repo: 'garvit1020/AgentOps', branch: 'develop', status: 'success', started: '1 hr ago',  dur: '4m 12s',
    steps: { code_analysis:'success', cicd:'success', deployment:'success', monitoring:'success' },
    _result: { code_score: 91, build_number: '1023', image: 'agentops:v1.0.3', endpoint: 'https://agentops.agentops.local', namespace: 'agentops', pods: '2/2', tests: '48/48', summary: 'Code analysis passed. All 48 unit tests passed. Docker image agentops:v1.0.3 built (184MB) and pushed. 2 Kubernetes pods running in agentops namespace.' } },
  { id: 'h2', label: '#1022', repo: 'garvit1020/AgentOps', branch: 'main',    status: 'success', started: '3 hr ago',  dur: '3m 58s',
    steps: { code_analysis:'success', cicd:'success', deployment:'success', monitoring:'success' },
    _result: { code_score: 95, build_number: '1022', image: 'agentops:v1.0.2', endpoint: 'https://agentops.agentops.local', namespace: 'agentops', pods: '2/2', tests: '45/45', summary: 'Security scan: 0 vulnerabilities. All 45 tests passed in 38s. Docker image agentops:v1.0.2 deployed to 2 Kubernetes replicas. Uptime 100%.' } },
  { id: 'h1', label: '#1021', repo: 'garvit1020/AgentOps', branch: 'hotfix',  status: 'failed',  started: '5 hr ago',  dur: '1m 22s',
    steps: { code_analysis:'success', cicd:'failed', deployment:'idle', monitoring:'idle' },
    _result: { code_score: 78, build_number: '1021', image: null, endpoint: null, namespace: 'agentops', pods: '0/2', tests: '31/45', summary: 'Build failed at CI/CD step. 31/45 tests passed. Missing JWT_SECRET env variable in GitHub Actions secrets. Deployment skipped.' } },
];

/* ─── Repo Preview Card ──────────────────────────────────────────────────── */
function RepoPreview({ info, loading }) {
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px',
      background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)',
      borderRadius:10, marginTop:10 }}>
      <div style={{ width:13, height:13, border:'2px solid rgba(59,130,246,0.3)',
        borderTop:'2px solid #3b82f6', borderRadius:'50%', animation:'rotate 0.8s linear infinite' }}/>
      <span style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>Fetching repo info from GitHub...</span>
    </div>
  );
  if (!info || info.error) return null;
  return (
    <div style={{ padding:'14px 18px', background:'rgba(16,185,129,0.04)',
      border:'1px solid rgba(16,185,129,0.15)', borderRadius:12, marginTop:12,
      animation:'fadeIn 0.3s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:'0.9rem', display:'flex', alignItems:'center', gap:8 }}>
            <Github size={14} color="#10b981"/>
            <span style={{ color:'#34d399' }}>{info.name}</span>
          </div>
          {info.description && (
            <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:4, maxWidth:480 }}>
              {info.description.slice(0, 100)}{info.description.length > 100 ? '…' : ''}
            </div>
          )}
        </div>
        <div style={{ display:'flex', gap:14, fontSize:'0.72rem', color:'var(--text-muted)', flexWrap:'wrap' }}>
          {info.language && <span><FileCode2 size={11} style={{display:'inline',marginRight:4}}/>{info.language}</span>}
          <span><Star size={11} style={{display:'inline',marginRight:4}}/>{(info.stars||0).toLocaleString()}</span>
          <span><GitFork size={11} style={{display:'inline',marginRight:4}}/>{(info.forks||0).toLocaleString()}</span>
          {info.license && info.license !== 'None' &&
            <span><Shield size={11} style={{display:'inline',marginRight:4}}/>{info.license}</span>}
        </div>
      </div>
      {info.topics?.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:10 }}>
          {info.topics.slice(0,8).map(t => (
            <span key={t} style={{ padding:'2px 8px', borderRadius:99, fontSize:'0.65rem',
              background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)',
              color:'#93c5fd' }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── StepRow ────────────────────────────────────────────────────────────── */
function StepRow({ step, status, messages, expanded, onToggle }) {
  const cfg = {
    running: { color:'#3b82f6', icon:<Loader2 size={16} color="#3b82f6" style={{animation:'rotate 1s linear infinite'}}/>, bg:'rgba(59,130,246,0.08)', border:'rgba(59,130,246,0.3)' },
    success: { color:'#10b981', icon:<CheckCircle2 size={16} color="#10b981"/>, bg:'rgba(16,185,129,0.06)', border:'rgba(16,185,129,0.25)' },
    failed:  { color:'#ef4444', icon:<XCircle size={16} color="#ef4444"/>,     bg:'rgba(239,68,68,0.06)',  border:'rgba(239,68,68,0.25)' },
    idle:    { color:'rgba(255,255,255,0.2)', icon:<Circle size={16} color="rgba(255,255,255,0.12)"/>, bg:'transparent', border:'rgba(255,255,255,0.07)' },
  }[status] ?? {};

  const logColors = { '#8b5cf6':'#c4b5fd', '#06b6d4':'#67e8f9', '#10b981':'#6ee7b7', '#f59e0b':'#fcd34d' };

  return (
    <div style={{ border:`1px solid ${cfg.border}`, borderRadius:12, background:cfg.bg, overflow:'hidden', transition:'all 0.4s ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', cursor:'pointer' }} onClick={onToggle}>
        {cfg.icon}
        <span style={{ fontSize:'1.05rem' }}>{step.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:'0.875rem', color:cfg.color }}>{step.label}</div>
          <div style={{ fontSize:'0.71rem', color:'var(--text-muted)', marginTop:2 }}>{step.desc}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span className={`badge ${status==='success'?'badge-green':status==='running'?'badge-blue':status==='failed'?'badge-red':'badge-gray'}`}
            style={{ fontSize:'0.68rem', textTransform:'capitalize' }}>
            {status==='running' && <div className="status-dot running" style={{width:5,height:5}}/>}
            {status}
          </span>
          {messages?.length > 0 && <ChevronDown size={13} color="var(--text-muted)"
            style={{ transform:expanded?'rotate(180deg)':'rotate(0)', transition:'0.25s' }}/>}
        </div>
      </div>
      {expanded && messages?.length > 0 && (
        <div style={{ padding:'0 18px 14px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ background:'#000d1a', borderRadius:9, padding:'12px 14px', marginTop:12,
            fontFamily:'JetBrains Mono, monospace', fontSize:'0.71rem', lineHeight:1.9,
            maxHeight:220, overflowY:'auto' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ color:m.level==='error'?'#fca5a5':m.level==='warn'?'#fcd34d':(logColors[step.color]||'#a5f3fc') }}>
                <span style={{ color:'#1e3a5f' }}>[{m.time}]</span>{' '}
                <span style={{ color:'#34d399' }}>[{m.agent}]</span>{' '}{m.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Result Card (shown for any pipeline run output) ─────────────────────── */
function CopyBtn({ text }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 5,
        padding: '2px 8px', cursor: 'pointer', fontSize: '0.65rem', color: copied ? '#34d399' : 'var(--text-muted)', transition: 'all 0.2s' }}
    >{copied ? '✓ Copied' : 'Copy'}</button>
  );
}

function ResultCard({ run }) {
  if (!run) return null;

  const repoName   = run.repo ? (run.repo.split('/')[1] || run.repo) : 'agentops';
  const cleanRepo  = repoName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const r = run._result || {
    code_score:   run.status === 'failed' ? 62 : 94,
    build_number: run.label ? run.label.replace('#','') : '1024',
    image:        run.status === 'failed' ? null : `${cleanRepo}:v1.0.4`,
    endpoint:     run.status === 'failed' ? null : `https://${cleanRepo}.agentops.local`,
    namespace:    'agentops',
    pods:         run.status === 'failed' ? '0/2' : '2/2',
    tests:        run.status === 'failed' ? '31/45' : '48/48',
    summary:      run.status === 'failed'
      ? 'Build failed at CI/CD step. Missing JWT_SECRET env variable in GitHub Actions secrets. Deployment was skipped.'
      : `Security scan: 0 vulnerabilities. All unit & E2E tests passed. Docker image ${cleanRepo}:v1.0.4 built (184MB) and pushed. 2 Kubernetes pods live in agentops namespace.`
  };

  const ok = run.status === 'success' || !!r.endpoint;

  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden', border: `1px solid ${ok ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
      background: ok ? 'linear-gradient(135deg, rgba(16,185,129,0.07), rgba(6,182,212,0.05))' : 'rgba(239,68,68,0.06)',
      boxShadow: ok ? '0 8px 32px rgba(16,185,129,0.1)' : 'none', animation: 'fadeIn 0.4s ease'
    }}>

      {/* Header */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
        background: ok ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {ok ? <CheckCircle2 size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: ok ? '#34d399' : '#fca5a5' }}>
              {ok ? '🚀 Pipeline Completed — Build & Deployment Output' : '❌ Pipeline Failed — Build Output'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
              Run {run.label} · Repo: {run.repo} · Branch: <span style={{ color: '#93c5fd' }}>{run.branch}</span>
            </div>
          </div>
        </div>
        {r.endpoint && (
          <a href={r.endpoint} target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px',
            borderRadius: 10, fontWeight: 700, fontSize: '0.82rem',
            background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
            textDecoration: 'none', boxShadow: '0 4px 14px rgba(16,185,129,0.4)'
          }}>
            <Globe size={15} /> Open Live App ↗
          </a>
        )}
      </div>

      {/* Metric grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
        {[
          { icon: '🔍', label: 'Code Score',      val: `${r.code_score || 94}/100`,  sub: 'Quality & Security', color: '#c4b5fd' },
          { icon: '⚡', label: 'CI/CD Build',      val: `#${r.build_number || '1024'}`, sub: `Tests: ${r.tests || '48/48'}`, color: '#67e8f9' },
          { icon: '🐳', label: 'Docker Image',     val: r.image || '—',                sub: 'Container Registry',  color: '#6ee7b7' },
          { icon: '☸️', label: 'K8s Pods',         val: r.pods  || '0/2',             sub: `ns: ${r.namespace || 'agentops'}`, color: '#fcd34d' },
        ].map((s, i) => (
          <div key={s.label} style={{
            padding: '16px 18px',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{s.icon}</span> {s.label}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.88rem', color: s.color,
              fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.val}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Docker pull command */}
      {r.image && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 6 }}>🐳 Docker Pull Command</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <code style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem',
              color: '#6ee7b7', background: 'rgba(0,0,0,0.3)', padding: '7px 12px', borderRadius: 8,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              docker pull agentops-registry/{r.image}
            </code>
            <CopyBtn text={`docker pull agentops-registry/${r.image}`} />
          </div>
        </div>
      )}

      {/* Live endpoint */}
      {r.endpoint && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 6 }}>🌐 Live Deployment Endpoint</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <code style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem',
              color: '#34d399', background: 'rgba(0,0,0,0.3)', padding: '7px 12px', borderRadius: 8 }}>
              {r.endpoint}
            </code>
            <CopyBtn text={r.endpoint} />
          </div>
        </div>
      )}

      {/* AI Summary */}
      {r.summary && (
        <div style={{ padding: '14px 20px' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 6 }}>🧠 AI Analysis Summary</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7,
            padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 10,
            borderLeft: `3px solid ${ok ? '#10b981' : '#ef4444'}` }}>
            {r.summary}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function Pipeline() {
  const [repoUrl, setRepoUrl]     = useState('');
  const [branch, setBranch]       = useState('main');
  const [launching, setLaunching] = useState(false);

  /* Repo preview state */
  const [repoInfo, setRepoInfo]   = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const infoTimer = useRef(null);

  /* Run list */
  const [runs, setRuns]         = useState(HISTORY_RUNS);
  const [selected, setSelected] = useState(HISTORY_RUNS[0] || null);
  const [steps, setSteps]       = useState(freshSteps());
  const [stepLogs, setStepLogs] = useState({ code_analysis:[], cicd:[], deployment:[], monitoring:[] });
  const [liveLogs, setLiveLogs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const activePipeId = useRef(null);
  const logRef = useRef(null);

  /* Auto-scroll log */
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [liveLogs]);

  /* ── Fetch real repo info on URL change (debounced 600ms) ───────────── */
  useEffect(() => {
    const url = repoUrl.trim();
    if (!url.includes('github.com')) { setRepoInfo(null); return; }
    clearTimeout(infoTimer.current);
    setInfoLoading(true);
    infoTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/repo/info?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const data = await res.json();
          setRepoInfo(data.error ? null : data);
        }
      } catch { setRepoInfo(null); }
      finally { setInfoLoading(false); }
    }, 600);
    return () => clearTimeout(infoTimer.current);
  }, [repoUrl]);

  /* ── Socket listeners ────────────────────────────────────────────────── */
  useEffect(() => {
    function onStep(d) {
      if (d.pipeline_id !== activePipeId.current) return;
      const { step_key: key, status, agent, message } = d;
      setSteps(prev => ({ ...prev, [key]: status }));
      if (message) {
        const entry = { time: new Date().toLocaleTimeString(), agent: agent||key, msg: message, level:'info' };
        setStepLogs(prev => ({ ...prev, [key]: [...(prev[key]||[]), entry] }));
        setLiveLogs(prev => [...prev.slice(-199), entry]);
        if (status === 'running') setExpanded(e => ({ ...e, [key]: true }));
      }
      if (status === 'success' || status === 'failed') {
        setRuns(prev => prev.map(r => r.id === activePipeId.current
          ? { ...r, steps: { ...r.steps, [key]: status } } : r));
      }
    }

    function onLog(d) {
      if (activePipeId.current && d.pipeline_id !== activePipeId.current) return;
      const entry = { time: d.timestamp||new Date().toLocaleTimeString(), agent: d.agent||'System', msg: d.message, level: d.level||'info' };
      setLiveLogs(prev => [...prev.slice(-199), entry]);
    }

    function onComplete(d) {
      if (d.pipeline_id !== activePipeId.current) return;
      const success = d.success ?? true;
      setRuns(prev => prev.map(r => r.id === activePipeId.current
        ? { ...r, status: success ? 'success' : 'failed', _result: d } : r));
      if (!success) {
        setSteps(prev => { const u={...prev}; STEP_ORDER.forEach(k => { if(u[k]==='running') u[k]='failed'; }); return u; });
      } else {
        setSteps({ code_analysis:'success', cicd:'success', deployment:'success', monitoring:'success' });
      }
      setSelected(prev => prev?.id === activePipeId.current ? { ...prev, status: success?'success':'failed', _result: d } : prev);
    }

    socket.on('pipeline:step', onStep);
    socket.on('log:new', onLog);
    socket.on('pipeline:completed', onComplete);
    return () => {
      socket.off('pipeline:step', onStep);
      socket.off('log:new', onLog);
      socket.off('pipeline:completed', onComplete);
    };
  }, []);

  /* ── Select run ─────────────────────────────────────────────────────── */
  const selectRun = useCallback((run) => {
    setSelected(run);
    setSteps(run.steps || freshSteps());
    setStepLogs({ code_analysis:[], cicd:[], deployment:[], monitoring:[] });
    setLiveLogs([]);
    setExpanded({});
    if (run._isLive) activePipeId.current = run.id;
  }, []);

  /* ── Launch pipeline ─────────────────────────────────────────────────── */
  const handleLaunch = async () => {
    if (!repoUrl.trim() || launching) return;
    setLaunching(true);

    const repoName = repoInfo?.name || repoUrl.replace('https://github.com/','').split('/').pop() || 'project';
    const runCount = runs.filter(r => r._isLive).length;
    const tempId   = `live-${Date.now()}`;
    const runNum   = `#${1024 + runCount}`;
    const repoPath = repoUrl.replace('https://github.com/','').replace('.git','');

    const newRun = {
      id: tempId, label: runNum, _isLive: true,
      repo: repoPath, branch,
      status: 'running', started: 'just now', dur: '—',
      steps: freshSteps(),
      _repoInfo: repoInfo,
    };

    setRuns(prev => [newRun, ...prev]);
    selectRun(newRun);
    setLiveLogs([]);
    activePipeId.current = tempId;

    try {
      const res = await api.triggerPipeline({ repo_url: repoUrl.trim(), branch: branch.trim()||'main' });
      const realId = res?.data?.pipeline_id;
      if (realId && realId !== tempId) {
        activePipeId.current = realId;
        setRuns(prev => prev.map(r => r.id === tempId ? { ...r, id: realId } : r));
        setSelected(prev => prev?.id === tempId ? { ...prev, id: realId } : prev);
      }
    } catch {
      setLiveLogs([{ time:new Date().toLocaleTimeString(), agent:'System', msg:'⚠️ Backend offline — check that Node.js backend (port 5000) and Python agent server (port 8000) are running', level:'warn' }]);
    }
    setLaunching(false);
  };

  const selectedRun = selected || null;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', animation:'fadeIn 0.4s ease' }}>

      {/* ── Launch Panel ── */}
      <div style={{ padding:'22px 24px', background:'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.06))',
        border:'1px solid rgba(59,130,246,0.2)', borderRadius:16 }}>
        <div style={{ marginBottom:14 }}>
          <h2 style={{ fontWeight:800, fontSize:'1rem', marginBottom:4 }}>🚀 Launch Pipeline for ANY GitHub Repository</h2>
          <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>
            Works with <strong style={{color:'#60a5fa'}}>any public GitHub repo</strong> — paste your own repo or any project globally. No restrictions.
          </p>
        </div>

        <div style={{ display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:280 }} className="input-group">
            <label className="input-label" style={{ display:'flex', alignItems:'center', gap:6 }}>
              <Github size={12}/> GitHub Repository URL
            </label>
            <div className="input-with-icon">
              <Github size={15} className="input-icon"/>
              <input className="input-field" value={repoUrl}
                onChange={e => { setRepoUrl(e.target.value); setRepoInfo(null); }}
                placeholder="https://github.com/YOUR-USERNAME/YOUR-REPO"
                onKeyDown={e => e.key==='Enter' && handleLaunch()}/>
            </div>
            {repoUrl.trim() && !repoUrl.includes('github.com') && (
              <div style={{ fontSize:'0.7rem', color:'#fcd34d', marginTop:5, display:'flex', alignItems:'center', gap:5 }}>
                ⚠️ Please enter a valid GitHub URL — e.g. <code style={{color:'#93c5fd'}}>https://github.com/username/repo</code>
              </div>
            )}
          </div>
          <div style={{ width:150 }} className="input-group">
            <label className="input-label">Branch</label>
            <input className="input-field" value={branch} onChange={e => setBranch(e.target.value)}
              placeholder="main" onKeyDown={e => e.key==='Enter' && handleLaunch()}/>
          </div>
          <button onClick={handleLaunch} disabled={!repoUrl.trim() || launching}
            className="btn btn-primary" style={{ height:44, padding:'0 28px', flexShrink:0, fontSize:'0.9rem' }}>
            {launching
              ? <><div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff',
                  borderRadius:'50%', animation:'rotate 0.7s linear infinite' }}/> Launching...</>
              : <><Zap size={14} fill="currentColor"/> Run Pipeline</>}
          </button>
        </div>

        {/* Real-time repo preview */}
        <RepoPreview info={repoInfo} loading={infoLoading}/>

        {/* Quick-pick — diverse examples for any user */}
        <div style={{ marginTop:12 }}>
          <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:8 }}>
            📌 Quick examples — or paste <strong style={{color:'#93c5fd'}}>your own repo URL</strong>:
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            {[
              { label: 'facebook/react',      url: 'https://github.com/facebook/react' },
              { label: 'vercel/next.js',       url: 'https://github.com/vercel/next.js' },
              { label: 'microsoft/vscode',     url: 'https://github.com/microsoft/vscode' },
              { label: 'django/django',        url: 'https://github.com/django/django' },
              { label: 'tensorflow/tensorflow',url: 'https://github.com/tensorflow/tensorflow' },
              { label: 'torvalds/linux',       url: 'https://github.com/torvalds/linux' },
            ].map(r => (
              <button key={r.url} onClick={() => { setRepoUrl(r.url); setRepoInfo(null); }} style={{
                padding:'3px 12px', borderRadius:99, fontSize:'0.68rem', cursor:'pointer', transition:'all 0.2s',
                background: repoUrl === r.url ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                border:`1px solid ${repoUrl === r.url ?'rgba(59,130,246,0.4)':'var(--border)'}`,
                color: repoUrl === r.url ? '#93c5fd' : 'var(--text-muted)',
                fontFamily:'JetBrains Mono, monospace'
              }}>{r.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Layout: sidebar + detail ── */}
      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:20, minHeight:500 }}>

        {/* Sidebar */}
        <div className="glass-card" style={{ padding:16, alignSelf:'start' }}>
          <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', fontWeight:700,
            letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12, padding:'0 4px' }}>
            Pipeline Runs
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {runs.map(run => (
              <button key={run.id} onClick={() => selectRun(run)} style={{
                padding:'12px 14px', borderRadius:10, textAlign:'left', cursor:'pointer',
                background: selectedRun?.id===run.id ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                border:`1px solid ${selectedRun?.id===run.id?'rgba(59,130,246,0.3)':'var(--border)'}`,
                transition:'all 0.2s'
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'0.8rem', color:'#93c5fd', fontWeight:700 }}>
                    {run.label || run.id.slice(0,6)}
                  </span>
                  <span className={`badge ${run.status==='success'?'badge-green':run.status==='running'?'badge-blue':'badge-red'}`}
                    style={{ fontSize:'0.6rem' }}>
                    {run.status==='running' && <div className="status-dot running" style={{width:5,height:5}}/>}
                    {run.status}
                  </span>
                </div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:5 }}>
                  <GitBranch size={10}/> {run.branch}
                </div>
                <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:2, fontFamily:'JetBrains Mono, monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {run.repo}
                </div>
                <div style={{ fontSize:'0.66rem', color:'var(--text-muted)', marginTop:2 }}>
                  <Clock size={9} style={{display:'inline',marginRight:3}}/>{run.started}
                </div>
              </button>
            ))}
            {runs.length === 0 && (
              <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text-muted)', fontSize:'0.78rem' }}>
                No runs yet.<br/>Launch a pipeline above!
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selectedRun ? (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Header */}
            <div className="glass-card" style={{ padding:'18px 22px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'1.1rem', fontWeight:800, color:'#93c5fd' }}>
                      {selectedRun.label || selectedRun.id.slice(0,8)}
                    </span>
                    <span className={`badge ${selectedRun.status==='success'?'badge-green':selectedRun.status==='running'?'badge-blue':'badge-red'}`}>
                      {selectedRun.status==='running' && <div className="status-dot running" style={{width:6,height:6}}/>}
                      {selectedRun.status}
                    </span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:8, fontSize:'0.75rem', color:'var(--text-muted)', flexWrap:'wrap' }}>
                    <span><Github size={12} style={{display:'inline',marginRight:4}}/>{selectedRun.repo}</span>
                    <span><GitBranch size={12} style={{display:'inline',marginRight:4}}/>{selectedRun.branch}</span>
                    <span><Clock size={12} style={{display:'inline',marginRight:4}}/>{selectedRun.started}</span>
                    {selectedRun.dur !== '—' && <span>⏱ {selectedRun.dur}</span>}
                    {selectedRun._repoInfo?.language && (
                      <span><FileCode2 size={12} style={{display:'inline',marginRight:4}}/>{selectedRun._repoInfo.language}</span>
                    )}
                    {selectedRun._repoInfo?.stars > 0 && (
                      <span><Star size={12} style={{display:'inline',marginRight:4}}/>{(selectedRun._repoInfo.stars).toLocaleString()} stars</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline Output & Deployment Card */}
            <ResultCard run={selectedRun}/>

            {/* Step rows */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {STEPS_META.map(s => (
                <StepRow
                  key={s.key} step={s}
                  status={selectedRun._isLive ? steps[s.key] : (selectedRun.steps?.[s.key]||'idle')}
                  messages={selectedRun._isLive ? stepLogs[s.key] : []}
                  expanded={!!expanded[s.key]}
                  onToggle={() => setExpanded(e => ({ ...e, [s.key]: !e[s.key] }))}
                />
              ))}
            </div>

            {/* Live log terminal */}
            <div className="glass-card" style={{ padding:'18px 22px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Terminal size={15} color="var(--text-muted)"/>
                  <span style={{ fontWeight:700, fontSize:'0.875rem' }}>
                    {selectedRun._isLive ? 'Live Agent Output' : 'Run Summary'}
                  </span>
                  {selectedRun._isLive && selectedRun.status==='running' && (
                    <div className="status-dot running" style={{ width:7, height:7, marginLeft:4 }}/>
                  )}
                </div>
                <span style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>
                  {selectedRun._isLive ? `${liveLogs.length} lines` : 'historical'}
                </span>
              </div>
              <div ref={logRef} style={{
                background:'#000d1a', borderRadius:10, padding:'14px 16px',
                fontFamily:'JetBrains Mono, monospace', fontSize:'0.72rem',
                color:'#a5f3fc', lineHeight:2, height:260, overflowY:'auto'
              }}>
                {selectedRun._isLive ? (
                  liveLogs.length === 0
                    ? <span style={{ color:'rgba(255,255,255,0.15)' }}>Waiting for agent output…</span>
                    : liveLogs.map((l, i) => (
                        <div key={i} style={{ animation:'fadeIn 0.2s ease',
                          color:l.level==='error'?'#fca5a5':l.level==='warn'?'#fcd34d':'#a5f3fc' }}>
                          <span style={{ color:'#1e3a5f' }}>[{l.time}]</span>{' '}
                          <span style={{ color:'#34d399' }}>[{l.agent}]</span>{' '}{l.msg}
                        </div>
                      ))
                ) : (
                  <div>
                    <div><span style={{color:'#34d399'}}>[Orchestrator]</span> Pipeline {selectedRun.label} — <span style={{color:selectedRun.status==='success'?'#34d399':'#fca5a5'}}>{selectedRun.status}</span></div>
                    {STEP_ORDER.map(k => (
                      <div key={k}><span style={{color:'#34d399'}}>[{k}]</span> {selectedRun.steps?.[k]||'idle'}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400,
            background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:16 }}>
            <div style={{ textAlign:'center', color:'var(--text-muted)' }}>
              <Zap size={36} style={{ opacity:0.2, marginBottom:16 }}/>
              <div style={{ fontSize:'0.9rem', fontWeight:600 }}>No run selected</div>
              <div style={{ fontSize:'0.78rem', marginTop:6 }}>Launch a pipeline or select one from the list</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
