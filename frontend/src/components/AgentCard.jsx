import React from 'react';
import { motion } from 'framer-motion';

const AgentCard = ({ agent }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'running': return 'var(--accent-blue)';
      case 'success': return 'var(--accent-green)';
      case 'error': return 'var(--accent-red)';
      default: return 'var(--text-dark)';
    }
  };

  const getGlowClass = (status) => {
    switch(status) {
      case 'running': return 'glow-blue';
      case 'success': return 'glow-green';
      case 'error': return 'glow-red';
      default: return '';
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      style={{
        background: 'var(--bg-panel)',
        border: `1px solid ${getStatusColor(agent.status)}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden'
      }}
      className={`glass-panel ${getGlowClass(agent.status)}`}
    >
      {agent.status === 'running' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', background: 'var(--accent-blue)', width: '60%', animation: 'pulse 2s infinite' }}></div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.25rem' }}>{agent.icon || '🤖'}</span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{agent.name}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{agent.role}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`status-dot ${agent.status}`}></span>
          <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: 'var(--text-muted)' }}>{agent.status}</span>
        </div>
      </div>
      
      <div style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Current Action:</div>
        <div style={{ fontFamily: 'monospace', color: agent.status === 'error' ? 'var(--accent-red)' : 'var(--accent-blue)' }}>
          {agent.currentAction || 'Idle'}
        </div>
      </div>
      
      <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-dark)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Last run: {agent.lastRun || 'N/A'}</span>
      </div>
    </motion.div>
  );
};

export default AgentCard;
