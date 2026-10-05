import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, Mail, Lock, Eye, EyeOff, User, ArrowRight, Check } from 'lucide-react';

const PLANS = [
  { id: 'free', label: 'Free', desc: '5 pipelines/month', color: 'var(--text-secondary)' },
  { id: 'pro',  label: 'Pro',  desc: 'Unlimited + monitoring', color: 'var(--blue-light)', popular: true },
];

const PERKS = [
  '5 specialized AI agents (Orchestrator, Code Analysis, CI/CD, Deployment, Monitoring)',
  'LangGraph workflow automation with Groq LLM',
  'GitHub webhook integration for automatic triggers',
  'Docker + Kubernetes deployment automation',
  'Prometheus + Grafana monitoring stack',
  'AI-powered failure detection & auto-recovery',
];

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
    { label: 'Special character', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= score ? colors[score] : 'var(--border)', transition: 'all 0.3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: colors[score] }}>{labels[score]}</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {checks.map((c, i) => (
            <span key={i} style={{ fontSize: '0.68rem', color: c.ok ? 'var(--green-light)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
              {c.ok ? <Check size={10} /> : '○'} {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '', plan: 'free' });
  const [showPass, setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [step, setStep]       = useState(1); // 1=form, 2=success

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('Please fill in all required fields.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);
    localStorage.setItem('agentops_user', JSON.stringify({ email: form.email, name: form.name, plan: form.plan }));
    setStep(2);
    setTimeout(() => navigate('/dashboard'), 2500);
  };

  /* ── SUCCESS ── */
  if (step === 2) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', position: 'relative' }}>
      <div className="orb orb-green" style={{ width: 500, height: 500, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.06, background: 'var(--green)' }} />
      <div style={{ textAlign: 'center', animation: 'fadeIn 0.6s ease' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
          background: 'linear-gradient(135deg, var(--green), var(--cyan))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(16,185,129,0.4)'
        }}>
          <Check size={36} color="#fff" />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>Welcome to AgentOps! 🎉</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Account created successfully for <strong>{form.email}</strong></p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Redirecting to your dashboard...</p>
        <div style={{ marginTop: 24, width: 180, height: 3, background: 'var(--border)', borderRadius: 99, margin: '24px auto 0', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--green), var(--cyan))', borderRadius: 99, animation: 'progress-fill 2.5s linear forwards' }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      {/* Orbs */}
      <div className="orb orb-purple" style={{ width: 500, height: 500, top: -100, right: 400, opacity: 0.1 }} />
      <div className="orb orb-cyan"   style={{ width: 350, height: 350, bottom: -50, left: -100, opacity: 0.08 }} />

      {/* Left — perks */}
      <div className="auth-left">
        <Link to="/" className="auth-brand">
          <div className="auth-logo"><Bot size={22} color="#fff" /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>Agent<span className="gradient-text">Ops</span></div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>Intelligent DevOps Automation</div>
          </div>
        </Link>

        <div style={{ maxWidth: 460 }}>
          <div className="badge badge-green" style={{ display: 'inline-flex', marginBottom: 20 }}>🆓 Free to get started</div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.03em' }}>
            Automate your entire<br />
            <span className="gradient-text-green">DevOps pipeline</span><br />
            in minutes.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 36 }}>
            Create your account and connect your GitHub repository. 
            AgentOps will set up all 5 AI agents and start automating your workflow immediately.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PERKS.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Check size={11} color="var(--green)" />
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 40, padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ display: 'flex' }}>
                {['AV','PS','RG','MK'].map((a,i) => (
                  <div key={i} style={{
                    width: 28, height: 28, borderRadius: '50%', marginLeft: i > 0 ? -8 : 0,
                    background: ['#3b82f6','#8b5cf6','#10b981','#f59e0b'][i],
                    border: '2px solid var(--bg-base)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 700
                  }}>{a}</div>
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>87+ teams</strong> automating DevOps with AgentOps
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="auth-right">
        <div className="auth-card animate-fade-in">
          <div style={{ marginBottom: 28, textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Create your account</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Free forever · No credit card required</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name */}
            <div className="input-group">
              <label className="input-label">Full name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input className="input-field" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Garvit Singh" />
              </div>
            </div>

            {/* Email */}
            <div className="input-group">
              <label className="input-label">Email address</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input className="input-field" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <Lock size={16} className="input-icon" />
                <input className="input-field" type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Create a strong password" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm */}
            <div className="input-group">
              <label className="input-label">Confirm password</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <Lock size={16} className="input-icon" />
                <input className="input-field" type={showConfirm ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handleChange} placeholder="Repeat your password" style={{ paddingRight: 44, borderColor: form.confirm && form.confirm !== form.password ? 'var(--red)' : '' }} />
                <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Plan */}
            <div className="input-group">
              <label className="input-label">Choose plan</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {PLANS.map(p => (
                  <button type="button" key={p.id} onClick={() => setForm(f => ({ ...f, plan: p.id }))} style={{
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                    background: form.plan === p.id ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${form.plan === p.id ? 'rgba(59,130,246,0.5)' : 'var(--border)'}`,
                    transition: 'all 0.2s', position: 'relative', textAlign: 'left'
                  }}>
                    {p.popular && <span style={{ position: 'absolute', top: -8, right: 8, background: 'linear-gradient(90deg,var(--blue),var(--purple))', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>POPULAR</span>}
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: form.plan === p.id ? 'var(--blue-light)' : 'var(--text-primary)' }}>{p.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ color: 'var(--red)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" style={{ padding: '13px', fontSize: '0.95rem', marginTop: 4 }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'rotate 0.7s linear infinite' }} />
                  Creating your account...
                </span>
              ) : (
                <><ArrowRight size={16} /> Create Free Account</>
              )}
            </button>

            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
              By creating an account you agree to our <span style={{ color: 'var(--blue-light)', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: 'var(--blue-light)', cursor: 'pointer' }}>Privacy Policy</span>.
            </p>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--blue-light)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
