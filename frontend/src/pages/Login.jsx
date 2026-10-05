import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Shield, Activity, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  { icon: '🤖', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', title: 'Orchestrator Agent', desc: 'Coordinates your entire DevOps workflow end-to-end using LangGraph.' },
  { icon: '🛡️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', title: 'AI Code Review', desc: 'LLM-powered security scanning and code quality analysis on every push.' },
  { icon: '🚀', color: '#10b981', bg: 'rgba(16,185,129,0.12)', title: 'Auto Deployment', desc: 'Docker + Kubernetes deployments triggered automatically, zero friction.' },
  { icon: '📊', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', title: 'Smart Monitoring', desc: 'Prometheus + Grafana with AI anomaly detection and auto-recovery.' },
];

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    /* Simulate auth — replace with real API call */
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    // Save user to localStorage for demo
    localStorage.setItem('agentops_user', JSON.stringify({ email: form.email, name: form.email.split('@')[0] }));
    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      {/* Orbs */}
      <div className="orb orb-blue"   style={{ width: 500, height: 500, top: -150, left: -150, opacity: 0.1 }} />
      <div className="orb orb-purple" style={{ width: 400, height: 400, bottom: -100, right: 400, opacity: 0.08 }} />

      {/* Left — branding */}
      <div className="auth-left">
        <Link to="/" className="auth-brand">
          <div className="auth-logo"><Bot size={22} color="#fff" /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
              Agent<span className="gradient-text">Ops</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>Intelligent DevOps Automation</div>
          </div>
        </Link>

        <div style={{ maxWidth: 480 }}>
          <div className="badge badge-blue" style={{ display: 'inline-flex', marginBottom: 20 }}>
            ✨ Powered by LangGraph + Groq LLM
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.03em' }}>
            Your AI-powered<br />
            <span className="gradient-text">DevOps command</span><br />
            center.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 40 }}>
            Five specialized AI agents handle your entire delivery pipeline — 
            from code analysis to Kubernetes deployment and self-healing recovery.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="auth-feature">
                <div className="auth-feature-icon" style={{ background: f.bg, border: `1px solid ${f.color}25` }}>
                  <span style={{ fontSize: '1.1rem' }}>{f.icon}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 3 }}>{f.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40, display: 'flex', gap: 20 }}>
            {[['12,840+', 'Pipelines Run'], ['99%', 'Success Rate'], ['5 AI', 'Agents']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontWeight: 800, fontSize: '1.3rem' }} className="gradient-text">{v}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="auth-right">
        <div className="auth-card animate-fade-in">
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Welcome back</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Sign in to your AgentOps dashboard
            </p>
          </div>

          {/* Demo credentials hint */}
          <div style={{
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: '0.8rem', color: 'var(--blue-light)'
          }}>
            💡 <strong>Demo:</strong> Use any email + password to sign in
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div className="input-group">
              <label className="input-label">Email address</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  className="input-field"
                  type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label">Password</label>
                <button type="button" style={{ fontSize: '0.78rem', color: 'var(--blue-light)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Forgot password?
                </button>
              </div>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <Lock size={16} className="input-icon" />
                <input
                  className="input-field"
                  type={showPass ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer'
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ color: 'var(--red)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" style={{ padding: '13px', marginTop: 4, fontSize: '0.95rem' }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'rotate 0.7s linear infinite' }} />
                  Signing in...
                </span>
              ) : (
                <><ArrowRight size={16} /> Sign In to Dashboard</>
              )}
            </button>

            <div className="divider" style={{ margin: '4px 0' }}>or continue with</div>

            <button type="button" className="btn btn-secondary btn-full" style={{ padding: '11px', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--blue-light)', fontWeight: 600 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
