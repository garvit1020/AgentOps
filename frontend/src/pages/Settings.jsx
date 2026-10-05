import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  User, Github, Bell, Shield, Key, Globe, Database,
  Save, Eye, EyeOff, CheckCircle2, AlertTriangle, Trash2,
  Copy, RefreshCw, Lock, Webhook, Bot, Settings as SettingsIcon
} from 'lucide-react';

const TABS = [
  { id: 'profile',      label: 'Profile',       icon: User },
  { id: 'integrations', label: 'Integrations',  icon: Github },
  { id: 'notifications',label: 'Notifications', icon: Bell },
  { id: 'security',     label: 'Security',      icon: Shield },
  { id: 'api',          label: 'API Keys',      icon: Key },
];

function Section({ title, desc, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{title}</h3>
        {desc && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</p>}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, desc, children, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ flex: 1, marginRight: 24 }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
        {desc && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
      background: on ? '#3b82f6' : 'rgba(255,255,255,0.1)',
      position: 'relative', transition: 'background 0.3s', flexShrink: 0
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3, left: on ? 23 : 3,
        transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
      }} />
    </button>
  );
}

function SaveButton({ onClick, saving }) {
  return (
    <button onClick={onClick} className="btn btn-primary btn-sm" disabled={saving}>
      {saving
        ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'rotate 0.7s linear infinite' }} /> Saving...</>
        : <><Save size={13} /> Save Changes</>}
    </button>
  );
}

export default function Settings() {
  const location = useLocation();
  const raw  = localStorage.getItem('agentops_user');
  const user = raw ? JSON.parse(raw) : { name: 'Developer', email: 'dev@example.com' };

  const [tab, setTab]   = useState(location.state?.tab || 'profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [showKey, setShowKey] = useState(false);

  const [profile, setProfile] = useState({
    name:  user.name || 'Developer',
    email: user.email || 'dev@example.com',
    org:   'UPES B.Tech Project',
    bio:   'Building AI-powered DevOps automation with AgentOps.'
  });

  const [integrations, setIntegrations] = useState({
    githubToken: 'ghp_••••••••••••••••••••••••••••••••••••••••',
    groqKey:     'gsk_••••••••••••••••••••••••••••••••••••••••',
    dockerhub:   'garvit1020',
    k8sNamespace:'agentops',
    webhookUrl:  'http://localhost:5000/api/webhook/github',
    repoUrl:     '',
  });

  const [notifs, setNotifs] = useState({
    pipelineComplete: true,
    pipelineFailed:   true,
    deploymentAlert:  true,
    securityScan:     false,
    weeklyReport:     true,
    agentErrors:      true,
  });

  const [apiKey] = useState('aops_live_a7f2b91c3d4e5f6a7b8c9d0e1f2a3b4c');

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    const updated = { ...user, name: profile.name, email: profile.email };
    localStorage.setItem('agentops_user', JSON.stringify(updated));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease', maxWidth: 900 }}>

      {/* Header */}
      <div>
        <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 4 }}>Settings</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Manage your account, integrations, and platform preferences</p>
      </div>

      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, animation: 'fadeIn 0.3s ease' }}>
          <CheckCircle2 size={16} color="#10b981" />
          <span style={{ fontSize: '0.875rem', color: '#34d399' }}>Settings saved successfully!</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Sidebar */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                background: tab === t.id ? 'rgba(59,130,246,0.12)' : 'transparent',
                border: `1px solid ${tab === t.id ? 'rgba(59,130,246,0.3)' : 'transparent'}`,
                color: tab === t.id ? '#60a5fa' : 'var(--text-secondary)',
                fontWeight: tab === t.id ? 600 : 400, fontSize: '0.875rem',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <div>
              <Section title="Personal Information" desc="Your name and email visible across the platform">
                {[
                  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Garvit Singh' },
                  { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
                  { key: 'org', label: 'Organization', type: 'text', placeholder: 'UPES' },
                ].map((f, i, arr) => (
                  <SettingRow key={f.key} label={f.label} last={i === arr.length - 1}>
                    <input className="input-field" type={f.type} value={profile[f.key]} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: 260, fontSize: '0.85rem' }} />
                  </SettingRow>
                ))}
              </Section>

              <Section title="Bio" desc="A short description about you or your project">
                <div style={{ padding: '16px 20px' }}>
                  <textarea className="input-field" value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} style={{ width: '100%', resize: 'vertical', fontSize: '0.85rem' }} />
                </div>
              </Section>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <SaveButton onClick={handleSave} saving={saving} />
              </div>
            </div>
          )}

          {/* ── INTEGRATIONS ── */}
          {tab === 'integrations' && (
            <div>
              <Section title="GitHub Integration" desc="Connect your GitHub repositories">
                <SettingRow label="GitHub Personal Token" desc="Used to fetch repos, trigger workflows, and read commits">
                  <input className="input-field" type="password" value={integrations.githubToken} onChange={e => setIntegrations(p => ({ ...p, githubToken: e.target.value }))} style={{ width: 260, fontSize: '0.85rem', fontFamily: 'JetBrains Mono, monospace' }} />
                </SettingRow>
                <SettingRow label="Default Repository" desc="Pre-filled when triggering pipelines" last>
                  <input className="input-field" type="text" value={integrations.repoUrl} onChange={e => setIntegrations(p => ({ ...p, repoUrl: e.target.value }))} style={{ width: 260, fontSize: '0.82rem' }} />
                </SettingRow>
              </Section>

              <Section title="AI Configuration" desc="Groq LLM API for all 5 AI agents">
                <SettingRow label="Groq API Key" desc="Powers llama-3.1-70b-versatile model" last>
                  <input className="input-field" type="password" value={integrations.groqKey} onChange={e => setIntegrations(p => ({ ...p, groqKey: e.target.value }))} style={{ width: 260, fontSize: '0.85rem', fontFamily: 'JetBrains Mono, monospace' }} />
                </SettingRow>
              </Section>

              <Section title="Docker & Kubernetes" desc="Container registry and cluster config">
                <SettingRow label="Docker Hub Username" desc="Registry for image push/pull">
                  <input className="input-field" type="text" value={integrations.dockerhub} onChange={e => setIntegrations(p => ({ ...p, dockerhub: e.target.value }))} style={{ width: 200, fontSize: '0.85rem' }} />
                </SettingRow>
                <SettingRow label="K8s Namespace" desc="Target namespace for deployments" last>
                  <input className="input-field" type="text" value={integrations.k8sNamespace} onChange={e => setIntegrations(p => ({ ...p, k8sNamespace: e.target.value }))} style={{ width: 160, fontSize: '0.85rem' }} />
                </SettingRow>
              </Section>

              <Section title="Webhook" desc="GitHub sends push events to this URL">
                <SettingRow label="Webhook URL" desc="Point your GitHub repo webhook here" last>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <code style={{ fontSize: '0.72rem', padding: '6px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: 7, color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{integrations.webhookUrl}</code>
                    <button onClick={() => navigator.clipboard.writeText(integrations.webhookUrl)} style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer' }}>
                      <Copy size={13} />
                    </button>
                  </div>
                </SettingRow>
              </Section>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <SaveButton onClick={handleSave} saving={saving} />
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === 'notifications' && (
            <div>
              <Section title="Pipeline Alerts" desc="Get notified about your CI/CD pipeline status">
                {Object.entries({
                  pipelineComplete: { label: 'Pipeline Completed', desc: 'When a pipeline finishes successfully' },
                  pipelineFailed:   { label: 'Pipeline Failed',    desc: 'When a pipeline encounters an error' },
                  deploymentAlert:  { label: 'Deployment Updates', desc: 'Pod health changes and rollout status' },
                  securityScan:     { label: 'Security Scan Results', desc: 'Code analysis security findings' },
                  weeklyReport:     { label: 'Weekly Report', desc: 'Summary of deployments and metrics' },
                  agentErrors:      { label: 'Agent Errors', desc: 'When any AI agent encounters an exception' },
                }).map(([key, cfg], i, arr) => (
                  <SettingRow key={key} label={cfg.label} desc={cfg.desc} last={i === arr.length - 1}>
                    <Toggle on={notifs[key]} onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
                  </SettingRow>
                ))}
              </Section>
            </div>
          )}

          {/* ── SECURITY ── */}
          {tab === 'security' && (
            <div>
              <Section title="Password" desc="Update your account password">
                {[
                  { label: 'Current Password', ph: 'Enter current password' },
                  { label: 'New Password',     ph: 'Enter new password' },
                  { label: 'Confirm Password', ph: 'Repeat new password' },
                ].map((f, i, arr) => (
                  <SettingRow key={f.label} label={f.label} last={i === arr.length - 1}>
                    <input className="input-field" type="password" placeholder={f.ph} style={{ width: 240, fontSize: '0.85rem' }} />
                  </SettingRow>
                ))}
              </Section>

              <Section title="Danger Zone" desc="Irreversible actions — proceed with caution">
                <SettingRow label="Delete Account" desc="Permanently delete your account and all data" last>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    <Trash2 size={13} /> Delete Account
                  </button>
                </SettingRow>
              </Section>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <SaveButton onClick={handleSave} saving={saving} />
              </div>
            </div>
          )}

          {/* ── API KEYS ── */}
          {tab === 'api' && (
            <div>
              <Section title="Your API Key" desc="Use this key to access the AgentOps REST API">
                <div style={{ padding: '20px' }}>
                  <div style={{ background: '#000d1a', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: '#60a5fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{showKey ? apiKey : apiKey.replace(/./g, (c, i) => i < 5 ? c : '•')}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setShowKey(v => !v)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => navigator.clipboard.writeText(apiKey)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#fcd34d' }}>
                      <AlertTriangle size={14} /> Never share this key. Treat it like a password.
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600 }}>Example usage:</div>
                    <div style={{ background: '#000d1a', borderRadius: 10, padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#a5f3fc', lineHeight: 1.8 }}>
                      <div><span style={{ color: '#34d399' }}>curl</span> -X POST http://localhost:5000/api/pipeline/trigger \</div>
                      <div>&nbsp;&nbsp;-H <span style={{ color: '#fcd34d' }}>"Authorization: Bearer {showKey ? apiKey : '••••••••'}"</span> \</div>
                      <div>&nbsp;&nbsp;-d <span style={{ color: '#c4b5fd' }}>'&#123;"repo_url": "https://github.com/garvit1020/AgentOps"&#125;'</span></div>
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
