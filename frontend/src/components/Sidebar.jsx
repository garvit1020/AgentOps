import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bot, LayoutDashboard, GitBranch, Cpu, Server,
  Activity, TerminalSquare, LogOut, ChevronRight, Settings
} from 'lucide-react';

const NAV = [
  { path: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard, badge: null },
  { path: '/pipeline',    label: 'Pipeline',     icon: GitBranch,       badge: null },
  { path: '/agents',      label: 'AI Agents',    icon: Cpu,             badge: '5' },
  { path: '/deployments', label: 'Deployments',  icon: Server,          badge: null },
  { path: '/monitoring',  label: 'Monitoring',   icon: Activity,        badge: null },
  { path: '/logs',        label: 'Logs',         icon: TerminalSquare,  badge: null },
  { path: '/settings',    label: 'Settings',     icon: Settings,        badge: null },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const raw  = localStorage.getItem('agentops_user');
  const user = raw ? JSON.parse(raw) : { name: 'Developer', email: 'dev@agentops.io' };
  const initials = (user.name || 'D').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('agentops_user');
    navigate('/login');
  };

  return (
    <aside style={{
      width: 256, flexShrink: 0,
      background: 'rgba(3,13,26,0.95)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      backdropFilter: 'blur(20px)',
      position: 'relative', zIndex: 10
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(59,130,246,0.4)', flexShrink: 0
          }}>
            <Bot size={19} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
              Agent<span className="gradient-text">Ops</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 1 }}>AI DevOps Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 10px 4px' }}>
          Navigation
        </div>
        {NAV.map(item => (
          <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '10px 12px', borderRadius: 10,
            color: isActive ? '#fff' : 'var(--text-secondary)',
            background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
            border: `1px solid ${isActive ? 'rgba(59,130,246,0.3)' : 'transparent'}`,
            fontWeight: isActive ? 600 : 400, fontSize: '0.875rem',
            textDecoration: 'none', transition: 'all 0.2s ease',
            boxShadow: isActive ? '0 0 12px rgba(59,130,246,0.15)' : 'none'
          })}>
            {({ isActive }) => (
              <>
                <item.icon size={17} color={isActive ? '#60a5fa' : 'var(--text-muted)'} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    background: isActive ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)',
                    color: isActive ? '#93c5fd' : 'var(--text-muted)',
                    fontSize: '0.65rem', fontWeight: 700,
                    padding: '1px 7px', borderRadius: 99
                  }}>{item.badge}</span>
                )}
                {isActive && <ChevronRight size={14} color="#60a5fa" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, marginBottom: 12 }}>
          <div className="status-dot" style={{ background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.6)', animation: 'pulse-blue 2s infinite', flexShrink: 0, width: 7, height: 7 }} />
          <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>All Systems Operational</span>
        </div>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 700
          }}>{initials}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
          </div>
          <button onClick={handleLogout} title="Sign out" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
