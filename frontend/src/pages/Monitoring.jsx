import React, { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const styles = {
  container: {
    padding: '24px',
    color: '#f8fafc',
    '--blue': '#3b82f6',
    '--purple': '#8b5cf6',
    '--green': '#10b981',
    '--red': '#ef4444',
    '--border': 'rgba(255,255,255,0.07)',
    '--text-secondary': '#94a3b8',
    '--text-muted': '#475569',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
  },
  toggleGroup: {
    display: 'flex',
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  toggleButton: (isActive) => ({
    background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
    border: 'none',
    color: isActive ? '#fff' : 'var(--text-secondary)',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '400',
    transition: 'all 0.2s',
  }),
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  card: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '20px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '8px 0',
  },
  statLabel: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    margin: 0,
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  chartCard: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '20px',
    height: '300px',
    display: 'flex',
    flexDirection: 'column',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  chartTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '500',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    fontSize: '14px',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
    fontSize: '14px',
  },
  statusBadge: (status) => ({
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: status === 'Running' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
    color: status === 'Running' ? 'var(--green)' : 'var(--red)',
    border: `1px solid ${status === 'Running' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
    display: 'inline-block',
  }),
  quickLinks: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  linkBadge: {
    padding: '8px 16px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border)',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background 0.2s',
  }
};

const initialData = Array.from({ length: 20 }, (_, i) => {
  const time = new Date();
  time.setSeconds(time.getSeconds() - (19 - i) * 3);
  return {
    time: time.toLocaleTimeString([], { hour12: false }),
    cpu: Math.floor(Math.random() * 20) + 30,
    memory: Math.floor(Math.random() * 15) + 60,
    requests: Math.floor(Math.random() * 500) + 1000,
    errors: (Math.random() * 0.05).toFixed(3),
  };
});

const demoPods = [
  { name: 'orchestrator-pod-5f6b9c9f8-abcde', cpu: '142m', memory: '256Mi', status: 'Running', restarts: 0, age: '2d 5h' },
  { name: 'monitoring-pod-774f9d86b9-xyz12', cpu: '45m', memory: '128Mi', status: 'Running', restarts: 1, age: '5d 1h' },
  { name: 'auth-service-pod-c5d64477c-jkl90', cpu: '8m', memory: '64Mi', status: 'Running', restarts: 0, age: '12d 7h' },
  { name: 'database-pod-89b5c777d-qwe34', cpu: '850m', memory: '1.2Gi', status: 'Running', restarts: 0, age: '20d 2h' },
  { name: 'worker-node-1-pod-d89754f9d-rty56', cpu: '900m', memory: '4.5Gi', status: 'Error', restarts: 5, age: '1d 12h' },
  { name: 'worker-node-2-pod-a3b4c5d6e-uiop7', cpu: '30m', memory: '512Mi', status: 'Running', restarts: 2, age: '4d 18h' },
];

export default function Monitoring() {
  const [data, setData] = useState(initialData);
  const [timeRange, setTimeRange] = useState('1h');
  const [stats, setStats] = useState({
    cpu: 42,
    memory: 68,
    requests: 1200,
    errors: 0.02,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData.slice(1)];
        const time = new Date();
        const newCpu = Math.max(0, Math.min(100, prevData[19].cpu + (Math.random() * 10 - 5)));
        const newMemory = Math.max(0, Math.min(100, prevData[19].memory + (Math.random() * 4 - 2)));
        const newReqs = Math.max(0, prevData[19].requests + (Math.random() * 200 - 100));
        const newErrs = Math.max(0, prevData[19].errors - 0 + (Math.random() * 0.01 - 0.005));
        
        setStats({
          cpu: Math.round(newCpu),
          memory: Math.round(newMemory),
          requests: Math.round(newReqs),
          errors: newErrs.toFixed(2),
        });

        newData.push({
          time: time.toLocaleTimeString([], { hour12: false }),
          cpu: newCpu,
          memory: newMemory,
          requests: newReqs,
          errors: newErrs,
        });
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>System Monitoring</h1>
        <div style={styles.toggleGroup}>
          {['1h', '6h', '24h'].map(range => (
            <button
              key={range}
              style={styles.toggleButton(timeRange === range)}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <p style={styles.statLabel}>CPU Usage</p>
          <div style={styles.statValue}>{stats.cpu}%</div>
        </div>
        <div style={styles.card}>
          <p style={styles.statLabel}>Memory Usage</p>
          <div style={styles.statValue}>{stats.memory}%</div>
        </div>
        <div style={styles.card}>
          <p style={styles.statLabel}>Request Rate</p>
          <div style={styles.statValue}>{(stats.requests / 1000).toFixed(1)}k/s</div>
        </div>
        <div style={styles.card}>
          <p style={styles.statLabel}>Error Rate</p>
          <div style={styles.statValue}>{stats.errors}%</div>
        </div>
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>CPU Usage (%)</h3>
            <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--blue)'}}></div>
          </div>
          <div style={{flex: 1}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: 'var(--border)', borderRadius: 8, color: '#f8fafc'}} />
                <Area type="monotone" dataKey="cpu" stroke="var(--blue)" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Memory Usage (%)</h3>
            <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--purple)'}}></div>
          </div>
          <div style={{flex: 1}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--purple)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--purple)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: 'var(--border)', borderRadius: 8, color: '#f8fafc'}} />
                <Area type="monotone" dataKey="memory" stroke="var(--purple)" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Request Rate (req/s)</h3>
            <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--green)'}}></div>
          </div>
          <div style={{flex: 1}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--green)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: 'var(--border)', borderRadius: 8, color: '#f8fafc'}} />
                <Area type="monotone" dataKey="requests" stroke="var(--green)" strokeWidth={2} fillOpacity={1} fill="url(#colorReq)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Error Rate (%)</h3>
            <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--red)'}}></div>
          </div>
          <div style={{flex: 1}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: 'var(--border)', borderRadius: 8, color: '#f8fafc'}} />
                <Line type="monotone" dataKey="errors" stroke="var(--red)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={{...styles.chartTitle, marginBottom: 16}}>Pod Health</h3>
        <div style={{overflowX: 'auto'}}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Pod Name</th>
                <th style={styles.th}>CPU</th>
                <th style={styles.th}>Memory</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Restarts</th>
                <th style={styles.th}>Age</th>
              </tr>
            </thead>
            <tbody>
              {demoPods.map((pod, i) => (
                <tr key={i}>
                  <td style={{...styles.td, fontFamily: 'monospace'}}>{pod.name}</td>
                  <td style={styles.td}>{pod.cpu}</td>
                  <td style={styles.td}>{pod.memory}</td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(pod.status)}>{pod.status}</span>
                  </td>
                  <td style={styles.td}>{pod.restarts}</td>
                  <td style={{...styles.td, color: 'var(--text-secondary)'}}>{pod.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.quickLinks}>
        <a href="#" style={styles.linkBadge} onClick={(e) => e.preventDefault()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Prometheus Dashboard
        </a>
        <a href="#" style={styles.linkBadge} onClick={(e) => e.preventDefault()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          Grafana Live
        </a>
      </div>
    </div>
  );
}
