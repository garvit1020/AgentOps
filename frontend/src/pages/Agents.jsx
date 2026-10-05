import React, { useState } from 'react';
import { Activity, Zap, Bot, Shield, RefreshCw, ChevronDown, ChevronUp, Terminal, CheckCircle2, Clock } from 'lucide-react';

const AGENTS_DATA = [
  {
    id: 1, name: 'Orchestrator',
    icon: '🧠', color: '#3b82f6',
    role: 'Central AI Brain — Coordinates all agents via LangGraph StateGraph',
    status: 'running', action: 'Managing pipeline #1024 — step: CI/CD',
    tools: ['LangGraph', 'StateGraph', 'Conditional Edges', 'Memory Store'],
    model: 'llama-3.1-70b-versatile (Groq)',
    runs: 1024, successRate: 98.2, avgTime: '4m 12s',
    lastAction: 'Routed from code_analysis → cicd node',
    capabilities: ['Workflow orchestration', 'Error handling', 'Retry logic', 'State management', 'Recovery decisions'],
    logs: [
      { t: '18:24:01', msg: 'Pipeline #1024 started for garvit1020/AgentOps@main', level: 'info' },
      { t: '18:24:02', msg: 'Dispatching to code_analysis node...', level: 'info' },
      { t: '18:24:18', msg: 'code_analysis → success, routing to cicd', level: 'info' },
      { t: '18:24:19', msg: 'Dispatching to cicd node...', level: 'info' },
    ]
  },
  {
    id: 2, name: 'Code Analysis',
    icon: '🔍', color: '#8b5cf6',
    role: 'LLM-powered code review, security scan, and dependency analysis',
    status: 'success', action: 'Score: 91/100 — 2 warnings, 0 critical issues',
    tools: ['PyGithub', 'fetch_file_contents', 'list_repo_files', 'Groq LLM'],
    model: 'llama-3.1-70b-versatile (Groq)',
    runs: 1024, successRate: 99.1, avgTime: '18s',
    lastAction: 'Analyzed 42 files — no security vulnerabilities found',
    capabilities: ['Code quality scoring', 'Security vulnerability scan', 'Dependency audit', 'Dockerfile suggestion', 'Code smell detection'],
    logs: [
      { t: '18:24:02', msg: 'Fetching repository tree from GitHub API...', level: 'info' },
      { t: '18:24:04', msg: 'Found 42 files across 8 directories', level: 'info' },
      { t: '18:24:05', msg: 'Analyzing code with Groq LLM...', level: 'info' },
      { t: '18:24:17', msg: 'Analysis complete: score=91, issues=2, vulns=0', level: 'info' },
    ]
  },
  {
    id: 3, name: 'CI/CD',
    icon: '⚡', color: '#06b6d4',
    role: 'GitHub Actions management — triggers pipelines and monitors results',
    status: 'running', action: 'Workflow #8842 running — 48 tests executing',
    tools: ['trigger_github_actions', 'check_workflow_status', 'get_recent_commits'],
    model: 'llama-3.1-70b-versatile (Groq)',
    runs: 1021, successRate: 96.8, avgTime: '3m 45s',
    lastAction: 'Triggered workflow ci.yml on garvit1020/AgentOps',
    capabilities: ['GitHub Actions triggering', 'Build monitoring', 'Test result parsing', 'YAML generation', 'Failure analysis'],
    logs: [
      { t: '18:24:19', msg: 'Triggering GitHub Actions workflow: ci.yml', level: 'info' },
      { t: '18:24:22', msg: 'Workflow run #8842 started successfully', level: 'info' },
      { t: '18:24:25', msg: 'Build phase: compiling 12 modules...', level: 'info' },
      { t: '18:25:10', msg: 'Tests: 48/48 passed ✓', level: 'info' },
    ]
  },
  {
    id: 4, name: 'Deployment',
    icon: '🚀', color: '#10b981',
    role: 'Docker image builder + Kubernetes deployment manager',
    status: 'idle', action: 'Awaiting CI/CD completion...',
    tools: ['build_docker_image', 'push_docker_image', 'apply_k8s_manifest', 'get_deployment_status'],
    model: 'llama-3.1-70b-versatile (Groq)',
    runs: 968, successRate: 97.4, avgTime: '2m 30s',
    lastAction: 'Deployed agentops:1023 — 2/2 pods running',
    capabilities: ['Docker build & push', 'K8s manifest apply', 'Rolling updates', 'Rollback execution', 'Pod health checks'],
    logs: [
      { t: '17:20:01', msg: 'Building Docker image agentops:1023...', level: 'info' },
      { t: '17:21:15', msg: 'Image pushed to registry successfully', level: 'info' },
      { t: '17:21:18', msg: 'Applying K8s deployment manifest...', level: 'info' },
      { t: '17:22:30', msg: 'Rollout complete — 2/2 pods running ✓', level: 'info' },
    ]
  },
  {
    id: 5, name: 'Monitoring',
    icon: '📊', color: '#f59e0b',
    role: 'Prometheus metrics watcher + AI-powered anomaly detection & recovery',
    status: 'running', action: 'Watching 12 pod metrics — all healthy',
    tools: ['query_prometheus', 'get_cpu_usage', 'get_memory_usage', 'check_alerts', 'get_pod_logs'],
    model: 'llama-3.1-70b-versatile (Groq)',
    runs: 1024, successRate: 100, avgTime: 'continuous',
    lastAction: 'CPU: 42% · Memory: 68% · Error rate: 0.02%',
    capabilities: ['Prometheus PromQL queries', 'Anomaly detection', 'Alert management', 'Recovery suggestion', 'Auto-rollback trigger'],
    logs: [
      { t: '18:24:30', msg: 'Monitoring started for pipeline #1024', level: 'info' },
      { t: '18:25:00', msg: 'CPU usage: 42% (normal)', level: 'info' },
      { t: '18:25:00', msg: 'Memory usage: 68% (normal)', level: 'info' },
      { t: '18:25:01', msg: 'Error rate: 0.02% (normal)', level: 'info' },
    ]
  },
];

function AgentDetailCard({ agent }) {
  const [showLogs, setShowLogs] = useState(false);
  const statusCfg = {
    running: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', label: 'Running' },
    success: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', label: 'Complete' },
    idle:    { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.04)', border: 'var(--border)', label: 'Idle' },
    error:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', label: 'Error' },
  }[agent.status] || {};

  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)',
      borderRadius: 16, overflow: 'hidden',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${agent.color}40`; e.currentTarget.style.boxShadow = `0 0 24px ${agent.color}12`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Top bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${agent.color}, ${agent.color}44)` }} />

      <div style={{ padding: '20px 22px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: `${agent.color}15`, border: `1px solid ${agent.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
            }}>{agent.icon}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>{agent.name} Agent</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2, maxWidth: 320 }}>{agent.role}</div>
            </div>
          </div>
          <div style={{ padding: '5px 14px', borderRadius: 99, background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <div className={`status-dot ${agent.status}`} style={{ width: 7, height: 7 }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: statusCfg.color }}>{statusCfg.label}</span>
          </div>
        </div>

        {/* Current action */}
        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 9, padding: '9px 13px', marginBottom: 16, fontSize: '0.78rem', fontFamily: agent.status === 'running' ? 'JetBrains Mono, monospace' : 'inherit', color: agent.status === 'running' ? agent.color : 'var(--text-secondary)' }}>
          {agent.status === 'running' && <span style={{ marginRight: 6 }}>▶</span>}{agent.action}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Total Runs', val: agent.runs.toLocaleString() },
            { label: 'Success Rate', val: `${agent.successRate}%` },
            { label: 'Avg Time', val: agent.avgTime },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 9, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: agent.color }}>{s.val}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tools */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>LangChain Tools</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {agent.tools.map(t => (
              <span key={t} style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', background: `${agent.color}12`, border: `1px solid ${agent.color}25`, color: agent.color }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Capabilities */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Capabilities</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {agent.capabilities.map(c => (
              <span key={c} className="badge badge-gray" style={{ fontSize: '0.68rem' }}>✓ {c}</span>
            ))}
          </div>
        </div>

        {/* Model + Logs toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            🤖 <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{agent.model}</span>
          </span>
          <button onClick={() => setShowLogs(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
            borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
            fontSize: '0.72rem', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <Terminal size={12} />
            {showLogs ? 'Hide' : 'View'} Logs
            {showLogs ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>

        {/* Logs */}
        {showLogs && (
          <div style={{ marginTop: 12, background: '#000d1a', borderRadius: 10, padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', lineHeight: 2, maxHeight: 160, overflowY: 'auto' }}>
            {agent.logs.map((l, i) => (
              <div key={i} style={{ animation: 'fadeIn 0.3s ease forwards', color: l.level === 'error' ? '#fca5a5' : '#a5f3fc' }}>
                <span style={{ color: '#1e3a5f' }}>[{l.t}]</span> {l.msg}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Agents() {
  const running = AGENTS_DATA.filter(a => a.status === 'running').length;
  const done    = AGENTS_DATA.filter(a => a.status === 'success').length;
  const idle    = AGENTS_DATA.filter(a => a.status === 'idle').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 4 }}>AI Agents Fleet</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>5 specialized LangGraph agents powered by Groq LLM · Pipeline #1024 active</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="badge badge-blue" style={{ padding: '7px 14px' }}><div className="status-dot running" style={{ width: 7, height: 7 }} /> {running} Running</div>
          <div className="badge badge-green" style={{ padding: '7px 14px' }}>✓ {done} Complete</div>
          <div className="badge badge-gray"  style={{ padding: '7px 14px' }}>○ {idle} Idle</div>
        </div>
      </div>

      {/* LangGraph flow visual */}
      <div style={{ padding: '18px 24px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 14 }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>LangGraph Workflow</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', flexWrap: 'nowrap' }}>
          {['START', '🧠 Orchestrator', '🔍 Code Analysis', '⚡ CI/CD', '🚀 Deployment', '📊 Monitoring', '🔄 Recovery (if needed)', 'END'].map((s, i, a) => (
            <React.Fragment key={s}>
              <div style={{
                padding: '7px 14px', borderRadius: 99, whiteSpace: 'nowrap',
                background: s === 'START' || s === 'END' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${s === 'START' || s === 'END' ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                fontSize: '0.75rem', fontWeight: 700,
                color: s === 'START' || s === 'END' ? '#34d399' : 'var(--text-secondary)'
              }}>{s}</div>
              {i < a.length - 1 && <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', flexShrink: 0 }}>→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Agent cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '1.25rem' }}>
        {AGENTS_DATA.map(a => <AgentDetailCard key={a.id} agent={a} />)}
      </div>
    </div>
  );
}
