import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Bell, Wifi, WifiOff, Github, Search, X, ChevronDown, Settings, User } from 'lucide-react';
import { socket } from '../services/websocket';
import { api } from '../services/api';

const PAGE_TITLES = {
  '/dashboard':   { title: 'Overview Dashboard',  sub: 'Real-time pipeline & agent status' },
  '/pipeline':    { title: 'Pipeline Center',      sub: 'Monitor & trigger CI/CD runs' },
  '/agents':      { title: 'AI Agents',            sub: 'LangGraph agent orchestration' },
  '/deployments': { title: 'Deployments',          sub: 'Docker & Kubernetes deployments' },
  '/monitoring':  { title: 'Monitoring',           sub: 'Prometheus · Grafana · Loki' },
  '/logs':        { title: 'Live Logs',            sub: 'Real-time agent & pipeline logs' },
};

export default function Header() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [time, setTime]           = useState(new Date());
  const [connected, setConnected] = useState(false);
  const [showTrigger, setShowTrigger] = useState(false);
  const [repoUrl, setRepoUrl]     = useState('');
  const [branch, setBranch]       = useState('main');
  const [launching, setLaunching] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, msg: 'Pipeline #1024 completed successfully', time: '2m ago', color: '#10b981' },
    { id: 2, msg: 'Code Analysis: score 91/100',           time: '5m ago', color: '#3b82f6' },
    { id: 3, msg: 'Deployed agentops:v1.2.0 to K8s',       time: '8m ago', color: '#8b5cf6' },
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const triggerRef = useRef(null);

  const raw  = localStorage.getItem('agentops_user');
  const user = raw ? JSON.parse(raw) : { name: 'Developer', email: '' };
  const page = PAGE_TITLES[location.pathname] || { title: 'AgentOps', sub: '' };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const onConnect    = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    setConnected(socket.connected);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('pipeline:completed', d => {
      setNotifications(n => [{
        id: Date.now(), color: d.success ? '#10b981' : '#ef4444',
        msg: `Pipeline ${d.success ? 'completed' : 'failed'}`, time: 'just now'
      }, ...n].slice(0, 8));
    });
    return () => { clearInterval(timer); socket.off('connect', onConnect); socket.off('disconnect', onDisconnect); };
  }, []);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = e => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        setShowTrigger(false); setShowNotifs(false); setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLaunch = async () => {
    if (!repoUrl.trim()) return;
    setLaunching(true);
    try {
      await api.triggerPipeline({ repo_url: repoUrl.trim(), branch: branch.trim() || 'main' });
    } catch (err) {
      /* backend may be offline in demo mode — still navigate */
      console.log('Pipeline trigger (demo mode):', err?.message);
    }
    setLaunching(false);
    setShowTrigger(false);
    navigate('/pipeline');
  };

  return (
    <header style={{
      height: 64, flexShrink: 0,
      background: 'rgba(3,13,26,0.9)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', gap: 16, position: 'relative', zIndex: 50
    }} ref={triggerRef}>

      {/* Left — page title */}
      <div>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>{page.title}</h2>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>{page.sub}</p>
      </div>

      {/* Right — controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* Clock */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', minWidth: 72 }}>
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>

        {/* Connection badge */}
        <div title={connected ? 'Backend connected' : 'Backend offline'} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600,
          background: connected ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${connected ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          color: connected ? '#34d399' : '#fca5a5'
        }}>
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connected ? 'Live' : 'Offline'}
        </div>

        {/* ── TRIGGER PIPELINE BUTTON ── */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowTrigger(v => !v); setShowNotifs(false); setShowProfile(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#fff', padding: '8px 16px', borderRadius: 10,
              fontWeight: 600, fontSize: '0.85rem', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.4)'; }}
          >
            <Play size={14} fill="#fff" />
            Run Pipeline
            <ChevronDown size={14} style={{ transform: showTrigger ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
          </button>

          {/* Trigger dropdown */}
          {showTrigger && (
            <div className="animate-slide-down" style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 380, background: '#061023',
              border: '1px solid var(--border-blue)', borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)', overflow: 'hidden', zIndex: 100
            }}>
              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>🚀 Launch Pipeline</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>AgentOps will analyze, build, and deploy your repo</div>
                </div>
                <button onClick={() => setShowTrigger(false)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <div style={{ padding: '20px' }}>
                {/* Pipeline steps preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: '10px 14px', background: 'rgba(59,130,246,0.06)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.15)', overflowX: 'auto' }}>
                  {['Code Analysis', 'CI/CD', 'Docker', 'K8s Deploy', 'Monitor'].map((s, i, arr) => (
                    <React.Fragment key={s}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--blue-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>{s}</span>
                      {i < arr.length - 1 && <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>→</span>}
                    </React.Fragment>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Repo URL */}
                  <div className="input-group">
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Github size={13} /> GitHub Repository URL
                    </label>
                    <input
                      className="input-field"
                      value={repoUrl}
                      onChange={e => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/username/repo"
                      style={{ fontSize: '0.82rem' }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      {['https://github.com/garvit1020/AgentOps', 'https://github.com/facebook/react'].map(r => (
                        <button key={r} onClick={() => setRepoUrl(r)}
                          style={{
                            fontSize: '0.65rem', padding: '3px 9px', borderRadius: 99, cursor: 'pointer',
                            background: repoUrl === r ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${repoUrl === r ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`,
                            color: repoUrl === r ? 'var(--blue-light)' : 'var(--text-muted)',
                            transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160
                          }}
                        >{r.replace('https://github.com/', '')}</button>
                      ))}
                    </div>
                  </div>

                  {/* Branch */}
                  <div className="input-group">
                    <label className="input-label">Branch</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        className="input-field"
                        value={branch}
                        onChange={e => setBranch(e.target.value)}
                        placeholder="main"
                        style={{ fontSize: '0.82rem', flex: 1 }}
                      />
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['main', 'develop', 'staging'].map(b => (
                          <button key={b} onClick={() => setBranch(b)} style={{
                            padding: '0 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                            background: branch === b ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${branch === b ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`,
                            color: branch === b ? 'var(--blue-light)' : 'var(--text-muted)', transition: 'all 0.2s'
                          }}>{b}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Launch button */}
                  <button
                    onClick={handleLaunch}
                    disabled={!repoUrl.trim() || launching}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      background: repoUrl.trim() ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(255,255,255,0.05)',
                      color: repoUrl.trim() ? '#fff' : 'var(--text-muted)',
                      padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem',
                      border: 'none', cursor: repoUrl.trim() ? 'pointer' : 'not-allowed',
                      boxShadow: repoUrl.trim() ? '0 4px 14px rgba(59,130,246,0.4)' : 'none',
                      transition: 'all 0.2s', width: '100%', marginTop: 4
                    }}
                  >
                    {launching ? (
                      <>
                        <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'rotate 0.7s linear infinite' }} />
                        Starting pipeline...
                      </>
                    ) : (
                      <><Play size={15} fill="#fff" /> Launch AI Pipeline</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowNotifs(v => !v); setShowTrigger(false); setShowProfile(false); }} style={{
            width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: showNotifs ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${showNotifs ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
            cursor: 'pointer', position: 'relative', transition: 'all 0.2s'
          }}>
            <Bell size={16} color="var(--text-secondary)" />
            {notifications.length > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: '#ef4444', borderRadius: '50%', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-base)' }}>
                {notifications.length}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className="animate-slide-down" style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 320,
              background: '#061023', border: '1px solid var(--border)', borderRadius: 14,
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)', overflow: 'hidden', zIndex: 100
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifications</span>
                <button onClick={() => setNotifications([])} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No new notifications</div>
              ) : notifications.map(n => (
                <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8rem' }}>{n.msg}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowProfile(v => !v); setShowTrigger(false); setShowNotifs(false); }} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 10px 5px 5px', borderRadius: 10,
            background: showProfile ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${showProfile ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
            cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.68rem', fontWeight: 700, flexShrink: 0
            }}>{(user.name || 'U').slice(0, 2).toUpperCase()}</div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
            <ChevronDown size={13} color="var(--text-muted)" style={{ transform: showProfile ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
          </button>
          {showProfile && (
            <div className="animate-slide-down" style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 220,
              background: '#061023', border: '1px solid var(--border)', borderRadius: 12,
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)', overflow: 'hidden', zIndex: 100
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.email}</div>
                <div className="badge badge-blue" style={{ display: 'inline-flex', marginTop: 6, fontSize: '0.65rem' }}>{user.plan || 'Free'} Plan</div>
              </div>
              {[
                { icon: User, label: 'Profile Settings', tab: 'profile' },
                { icon: Github, label: 'GitHub Integration', tab: 'integrations' },
                { icon: Settings, label: 'Preferences', tab: 'notifications' },
              ].map(({ icon: Icon, label, tab }) => (
                <button
                  key={label}
                  onClick={() => {
                    navigate('/settings', { state: { tab } });
                    setShowProfile(false);
                  }}
                  style={{
                    width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
                    fontSize: '0.82rem', transition: 'background 0.15s', textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => {
                    localStorage.removeItem('agentops_token');
                    localStorage.removeItem('agentops_user');
                    setShowProfile(false);
                    navigate('/login');
                  }}
                  style={{
                    width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
                    background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', fontSize: '0.82rem', transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
