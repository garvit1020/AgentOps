import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, Filter } from 'lucide-react';
import { useSocket } from '../services/websocket';

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const endRef = useRef(null);

  useSocket('log', (newLog) => {
    setLogs((prev) => {
      const updated = [...prev, newLog];
      if (updated.length > 500) return updated.slice(updated.length - 500);
      return updated;
    });
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const clearLogs = () => setLogs([]);

  const getLevelColor = (level) => {
    switch(level?.toUpperCase()) {
      case 'ERROR': return 'var(--accent-red)';
      case 'WARNING': return 'var(--accent-amber)';
      case 'SUCCESS': return 'var(--accent-green)';
      case 'INFO': return 'var(--accent-blue)';
      default: return 'var(--text-muted)';
    }
  };

  const getAgentColor = (agent) => {
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < (agent?.length || 0); i++) hash = agent.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#050914', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
          <Terminal size={16} color="var(--accent-blue)" />
          Live Agent Logs
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }} className="hover-lift">
            <Filter size={14} /> Filter
          </button>
          <button onClick={clearLogs} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }} className="hover-lift">
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-dark)', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>Waiting for logs...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', wordBreak: 'break-all' }}>
              <span style={{ color: 'var(--text-dark)', minWidth: '70px' }}>{new Date(log.timestamp || Date.now()).toLocaleTimeString()}</span>
              {log.agent && <span style={{ color: getAgentColor(log.agent), minWidth: '100px', fontWeight: 600 }}>[{log.agent}]</span>}
              {log.level && <span style={{ color: getLevelColor(log.level), minWidth: '60px' }}>{log.level}</span>}
              <span style={{ color: 'var(--text-main)' }}>{log.message}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default LogViewer;
