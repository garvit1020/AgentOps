import React from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AlertPanel = ({ alerts = [], onResolve }) => {
  const getSeverityConfig = (severity) => {
    switch(severity) {
      case 'critical': return { icon: AlertCircle, color: 'var(--accent-red)', glow: 'glow-red' };
      case 'warning': return { icon: AlertTriangle, color: 'var(--accent-amber)', glow: 'glow-amber' };
      default: return { icon: Info, color: 'var(--accent-blue)', glow: 'glow-blue' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Active Alerts</h3>
        <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
          {alerts.length} Active
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle size={32} color="var(--accent-green)" style={{ margin: '0 auto 1rem' }} />
          No active alerts. All systems healthy.
        </div>
      ) : (
        alerts.map(alert => {
          const config = getSeverityConfig(alert.severity);
          const Icon = config.icon;
          
          return (
            <motion.div key={alert.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`glass-panel ${config.glow}`} style={{ padding: '1rem', borderLeft: `4px solid ${config.color}` }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Icon size={24} color={config.color} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>{alert.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{alert.description}</p>
                  
                  {alert.suggestion && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--accent-blue)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>🤖 AI Suggestion:</span>
                      {alert.suggestion}
                    </div>
                  )}
                  
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => onResolve(alert.id)} style={{ padding: '0.4rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', transition: 'all 0.2s' }} className="hover-lift">
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default AlertPanel;
