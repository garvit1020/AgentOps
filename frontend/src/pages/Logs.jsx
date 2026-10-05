import React, { useState, useEffect, useRef } from 'react';

const styles = {
  container: {
    padding: '24px',
    color: '#f8fafc',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
  },
  logCount: {
    color: '#94a3b8',
    fontSize: '14px',
  },
  controls: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  button: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#fff',
    padding: '8px 12px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background 0.2s',
  },
  input: {
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#fff',
    padding: '8px 12px',
    fontSize: '14px',
    outline: 'none',
    minWidth: '200px',
  },
  select: {
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#fff',
    padding: '8px 12px',
    fontSize: '14px',
    outline: 'none',
  },
  filtersContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  filterBtn: (active, color) => ({
    background: active ? `rgba(${color}, 0.2)` : 'transparent',
    border: `1px solid rgba(${color}, ${active ? '0.5' : '0.2'})`,
    color: `rgb(${color})`,
    borderRadius: '16px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  terminalContainer: {
    flex: 1,
    background: '#000d1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '16px',
    overflowY: 'auto',
    fontFamily: '"JetBrains Mono", Consolas, monospace',
    fontSize: '0.72rem',
    lineHeight: '1.5',
    position: 'relative',
    minHeight: '400px',
  },
  logLine: {
    display: 'flex',
    gap: '12px',
    marginBottom: '4px',
    wordBreak: 'break-all',
  },
  timestamp: {
    color: '#64748b',
    whiteSpace: 'nowrap',
  },
  agent: {
    color: '#c4b5fd',
    whiteSpace: 'nowrap',
    minWidth: '120px',
  },
  levelInfo: { color: '#a5f3fc', whiteSpace: 'nowrap', minWidth: '50px' },
  levelWarn: { color: '#fcd34d', whiteSpace: 'nowrap', minWidth: '50px' },
  levelError: { color: '#fca5a5', whiteSpace: 'nowrap', minWidth: '50px' },
  levelDebug: { color: '#94a3b8', whiteSpace: 'nowrap', minWidth: '50px' },
  message: {
    color: '#e2e8f0',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b',
  }
};

const AGENTS = ['Orchestrator', 'CodeAnalysis', 'CI', 'CD', 'Deployment', 'Monitoring'];
const LEVELS = ['info', 'warn', 'error', 'debug'];
const MESSAGES = [
  'Starting new deployment sequence',
  'Analyzing code complexity metrics',
  'Failed to connect to database cluster',
  'Retrying connection in 5 seconds...',
  'Build successful in 45.2s',
  'Cache miss for artifact v2.1.4',
  'Scaling up worker nodes to 5',
  'Memory usage exceeded 80% threshold',
  'Health check passed for all services',
  'Updating routing configuration',
];

const generateLog = (id) => {
  const level = LEVELS[Math.floor(Math.random() * LEVELS.length)];
  const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
  const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  const time = new Date().toLocaleTimeString([], { hour12: false });
  
  return { id, timestamp: time, level, agent, message };
};

const LEVEL_COLORS = {
  all: '255, 255, 255',
  info: '165, 243, 252',
  warn: '252, 211, 77',
  error: '252, 165, 165',
  debug: '148, 163, 184',
};

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLevel, setActiveLevel] = useState('all');
  const [activeAgent, setActiveAgent] = useState('All');
  const terminalRef = useRef(null);
  
  // Initial logs
  useEffect(() => {
    const initial = Array.from({length: 50}, (_, i) => generateLog(i));
    setLogs(initial);
  }, []);

  // Live streaming
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = generateLog(prev.length > 0 ? prev[prev.length - 1].id + 1 : 1);
        const newLogs = [...prev, newLog];
        if (newLogs.length > 200) return newLogs.slice(newLogs.length - 200);
        return newLogs;
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isPaused]);

  // Auto scroll
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => {
    if (activeLevel !== 'all' && log.level !== activeLevel) return false;
    if (activeAgent !== 'All' && log.agent !== activeAgent) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return log.message.toLowerCase().includes(q) || log.agent.toLowerCase().includes(q);
    }
    return true;
  });

  const getLevelStyle = (level) => {
    switch (level) {
      case 'info': return styles.levelInfo;
      case 'warn': return styles.levelWarn;
      case 'error': return styles.levelError;
      case 'debug': return styles.levelDebug;
      default: return styles.levelInfo;
    }
  };

  const handleExport = () => {
    alert('Logs exported to CSV');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleContainer}>
          <h1 style={styles.title}>System Logs</h1>
          <span style={styles.logCount}>Showing {filteredLogs.length} of {logs.length} logs</span>
        </div>
        
        <div style={styles.controls}>
          <input 
            type="text" 
            placeholder="Search logs..." 
            style={styles.input}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            style={styles.select} 
            value={activeAgent} 
            onChange={(e) => setActiveAgent(e.target.value)}
          >
            <option value="All">All Agents</option>
            {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button style={styles.button} onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button style={styles.button} onClick={handleExport}>
            Export
          </button>
        </div>
      </div>

      <div style={styles.filtersContainer}>
        {['all', 'info', 'warn', 'error', 'debug'].map(level => (
          <button 
            key={level}
            style={styles.filterBtn(activeLevel === level, LEVEL_COLORS[level])}
            onClick={() => setActiveLevel(level)}
          >
            {level.toUpperCase()}
          </button>
        ))}
        <div style={{flex: 1}}></div>
        <button 
          style={{...styles.filterBtn(autoScroll, '255,255,255'), border: 'none'}}
          onClick={() => setAutoScroll(!autoScroll)}
        >
          {autoScroll ? '↓ Auto-scroll ON' : 'Auto-scroll OFF'}
        </button>
      </div>

      <div style={styles.terminalContainer} ref={terminalRef}>
        {filteredLogs.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No logs found matching your filters.</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} style={styles.logLine}>
              <span style={styles.timestamp}>[{log.timestamp}]</span>
              <span style={styles.agent}>[{log.agent}]</span>
              <span style={getLevelStyle(log.level)}>[{log.level.toUpperCase()}]</span>
              <span style={styles.message}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
