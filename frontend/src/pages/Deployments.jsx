import React, { useState } from 'react';
import {
  Server, RotateCcw, CheckCircle2, AlertTriangle, Loader2,
  Container, Globe, ChevronRight, ExternalLink, Clock,
  GitBranch, ArrowUpCircle, Package, Activity, Zap
} from 'lucide-react';

const DEPLOYMENTS = [
  {
    id: 'dep-1024', service: 'agentops-api', image: 'agentops:1024',
    version: 'v2.4.1', env: 'Production', status: 'healthy',
    pods: { running: 3, total: 3 }, cpu: 42, memory: 68,
    endpoint: 'api.agentops.io', branch: 'main', time: '1h ago',
    pipeline: '#1023', namespace: 'agentops'
  },
  {
    id: 'dep-1023', service: 'agentops-frontend', image: 'agentops-frontend:1024',
    version: 'v2.4.1', env: 'Production', status: 'healthy',
    pods: { running: 2, total: 2 }, cpu: 18, memory: 44,
    endpoint: 'app.agentops.io', branch: 'main', time: '1h ago',
    pipeline: '#1023', namespace: 'agentops'
  },
  {
    id: 'dep-998', service: 'user-service', image: 'user-service:998',
    version: 'v1.4.2', env: 'Production', status: 'healthy',
    pods: { running: 5, total: 5 }, cpu: 61, memory: 74,
    endpoint: 'users.agentops.io', branch: 'main', time: '2d ago',
    pipeline: '#998', namespace: 'production'
  },
  {
    id: 'dep-995', service: 'payment-api', image: 'payment-api:995',
    version: 'v2.1.0', env: 'Production', status: 'degraded',
    pods: { running: 2, total: 4 }, cpu: 89, memory: 91,
    endpoint: 'pay.agentops.io', branch: 'main', time: '5h ago',
    pipeline: '#995', namespace: 'production'
  },
  {
    id: 'dep-1020', service: 'frontend-beta', image: 'agentops-frontend:1020',
    version: 'v2.5.0-beta', env: 'Staging', status: 'deploying',
    pods: { running: 1, total: 3 }, cpu: 22, memory: 38,
    endpoint: 'staging.agentops.io', branch: 'develop', time: 'Just now',
    pipeline: '#1020', namespace: 'staging'
  },
  {
    id: 'dep-980', service: 'auth-service', image: 'auth-service:980',
    version: 'v1.1.9', env: 'Production', status: 'healthy',
    pods: { running: 3, total: 3 }, cpu: 28, memory: 52,
    endpoint: 'auth.agentops.io', branch: 'main', time: '1w ago',
    pipeline: '#980', namespace: 'production'
  },
];

const STATUS_CFG = {
  healthy:   { label: 'Healthy',   color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', dot: 'success', icon: CheckCircle2 },
  deploying: { label: 'Deploying', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)', dot: 'running', icon: Loader2 },
  degraded:  { label: 'Degraded',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', dot: 'warning', icon: AlertTriangle },
  failed:    { label: 'Failed',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',  dot: 'error',   icon: AlertTriangle },
};

function PodBar({ running, total, color }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: 3,
          background: i < running ? color : 'rgba(255,255,255,0.1)',
          transition: 'all 0.3s ease'
        }} />
      ))}
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 4 }}>{running}/{total}</span>
    </div>
  );
}

function UsageBar({ pct, color }) {
  const c = pct > 85 ? '#ef4444' : pct > 70 ? '#f59e0b' : color;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: c, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: '0.7rem', color: pct > 85 ? '#fca5a5' : 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', minWidth: 34 }}>{pct}%</span>
    </div>
  );
}

function DeployCard({ dep, onRollback }) {
  const st = STATUS_CFG[dep.status] || STATUS_CFG.healthy;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)',
      borderRadius: 14, overflow: 'hidden',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${st.color}40`; e.currentTarget.style.boxShadow = `0 4px 24px ${st.color}12`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ height: 3, background: st.color, opacity: 0.7 }} />
      <div style={{ padding: '18px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${st.color}15`, border: `1px solid ${st.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Container size={18} color={st.color} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.925rem' }}>{dep.service}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{dep.image}</div>
            </div>
          </div>
          <div style={{ padding: '4px 12px', borderRadius: 99, background: st.bg, border: `1px solid ${st.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className={`status-dot ${st.dot}`} style={{ width: 6, height: 6 }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: st.color }}>{st.label}</span>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          <span className="badge badge-gray" style={{ fontSize: '0.68rem' }}>
            <GitBranch size={10} /> {dep.branch}
          </span>
          <span className="badge badge-gray" style={{ fontSize: '0.68rem' }}>{dep.version}</span>
          <span className={`badge ${dep.env === 'Production' ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: '0.68rem' }}>{dep.env}</span>
          <span className="badge badge-gray" style={{ fontSize: '0.68rem' }}>{dep.namespace}</span>
        </div>

        {/* Pods */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pods</span>
          </div>
          <PodBar running={dep.pods.running} total={dep.pods.total} color={st.color} />
        </div>

        {/* CPU + Memory */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600 }}>CPU</div>
            <UsageBar pct={dep.cpu} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600 }}>Memory</div>
            <UsageBar pct={dep.memory} color="#8b5cf6" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span><Clock size={11} style={{ display: 'inline', marginRight: 4 }} />{dep.time}</span>
            <span title="Endpoint"><Globe size={11} style={{ display: 'inline', marginRight: 4 }} />{dep.endpoint}</span>
          </div>
          <button onClick={() => onRollback(dep)} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
            borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
            fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.color = '#fcd34d'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <RotateCcw size={11} /> Rollback
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Deployments() {
  const [filter, setFilter] = useState('all');
  const [rollbackTarget, setRollbackTarget] = useState(null);

  const filtered = filter === 'all' ? DEPLOYMENTS : DEPLOYMENTS.filter(d => d.status === filter);
  const stats = {
    total:     DEPLOYMENTS.length,
    healthy:   DEPLOYMENTS.filter(d => d.status === 'healthy').length,
    deploying: DEPLOYMENTS.filter(d => d.status === 'deploying').length,
    degraded:  DEPLOYMENTS.filter(d => d.status === 'degraded').length,
    pods:      DEPLOYMENTS.reduce((s, d) => s + d.pods.running, 0),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', animation: 'fadeIn 0.4s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 4 }}>Deployments</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Docker + Kubernetes deployment management · {stats.total} active services</p>
        </div>
        <button className="btn btn-primary btn-sm">
          <Zap size={14} /> New Deployment
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Services', val: stats.total,     color: '#3b82f6', icon: Container },
          { label: 'Healthy',        val: stats.healthy,   color: '#10b981', icon: CheckCircle2 },
          { label: 'Deploying',      val: stats.deploying, color: '#3b82f6', icon: Loader2 },
          { label: 'Degraded',       val: stats.degraded,  color: '#f59e0b', icon: AlertTriangle },
          { label: 'Running Pods',   val: stats.pods,      color: '#8b5cf6', icon: Server },
        ].map(s => (
          <div key={s.label} style={{ padding: '16px 18px', background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</span>
              <s.icon size={14} color={s.color} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['all', 'healthy', 'deploying', 'degraded'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 18px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            background: filter === f ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${filter === f ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`,
            color: filter === f ? '#60a5fa' : 'var(--text-secondary)',
            transition: 'all 0.2s', textTransform: 'capitalize'
          }}>
            {f === 'all' ? `All (${stats.total})` : `${f} (${stats[f] ?? 0})`}
          </button>
        ))}
      </div>

      {/* Deployment cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
        {filtered.map(dep => <DeployCard key={dep.id} dep={dep} onRollback={setRollbackTarget} />)}
      </div>

      {/* Rollback confirm modal */}
      {rollbackTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#061023', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '32px', width: 440, animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12, textAlign: 'center' }}>⏪</div>
            <h3 style={{ fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>Confirm Rollback</h3>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.875rem', marginBottom: 24 }}>
              Roll back <strong style={{ color: '#fcd34d' }}>{rollbackTarget.service}</strong> from <code style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{rollbackTarget.version}</code> to the previous version?
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setRollbackTarget(null)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={() => { alert(`Rollback initiated for ${rollbackTarget.service}`); setRollbackTarget(null); }}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 10, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d', fontWeight: 700, cursor: 'pointer' }}>
                <RotateCcw size={15} /> Rollback Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
