import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { socket } from '../services/websocket';
import { api } from '../services/api';

/* ─────────────────────────────────────────
   App Context — global shared state
───────────────────────────────────────── */
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const raw  = localStorage.getItem('agentops_user');
  const [user, setUser] = useState(raw ? JSON.parse(raw) : null);

  /* ── Saved repos / projects ── */
  const storedProjects = localStorage.getItem('agentops_projects');
  const [projects, setProjects] = useState(storedProjects ? JSON.parse(storedProjects) : [
    { id: 1, name: 'AgentOps',     url: 'https://github.com/garvit1020/AgentOps', branch: 'main',    addedAt: new Date().toISOString(), lastRun: '2h ago',    runs: 12, status: 'success' },
    { id: 2, name: 'React Demo',   url: 'https://github.com/facebook/react',      branch: 'main',    addedAt: new Date().toISOString(), lastRun: '1d ago',    runs: 3,  status: 'success' },
    { id: 3, name: 'Next.js App',  url: 'https://github.com/vercel/next.js',      branch: 'canary',  addedAt: new Date().toISOString(), lastRun: 'Never',     runs: 0,  status: 'idle'    },
  ]);

  /* ── Live pipeline state ── */
  const [activePipeline, setActivePipeline] = useState(null);
  const [pipelineStep,   setPipelineStep]   = useState(0);
  const [notifications,  setNotifications]  = useState([
    { id: 1, msg: 'Pipeline #1024 completed successfully', time: '2m ago',  color: '#10b981', read: false },
    { id: 2, msg: 'Code Analysis score: 91/100',           time: '5m ago',  color: '#3b82f6', read: false },
    { id: 3, msg: 'Deployed agentops:v1.2.0 to K8s',       time: '8m ago',  color: '#8b5cf6', read: false },
  ]);
  const [wsConnected, setWsConnected] = useState(socket.connected);

  /* ── Socket wiring ── */
  useEffect(() => {
    const onConnect    = () => setWsConnected(true);
    const onDisconnect = () => setWsConnected(false);
    const onStep       = (d) => { setPipelineStep(d.step ?? 0); };
    const onComplete   = (d) => {
      setActivePipeline(null);
      pushNotif({ msg: `Pipeline ${d.success ? 'completed ✓' : 'failed ✗'}`, color: d.success ? '#10b981' : '#ef4444' });
    };

    setWsConnected(socket.connected);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('pipeline:step', onStep);
    socket.on('pipeline:completed', onComplete);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('pipeline:step', onStep);
      socket.off('pipeline:completed', onComplete);
    };
  }, []);

  /* ── Helper: push notification ── */
  const pushNotif = useCallback(({ msg, color = '#3b82f6' }) => {
    setNotifications(n => [{ id: Date.now(), msg, time: 'just now', color, read: false }, ...n].slice(0, 20));
  }, []);

  /* ── Save projects to localStorage on change ── */
  useEffect(() => {
    localStorage.setItem('agentops_projects', JSON.stringify(projects));
  }, [projects]);

  /* ── Add project ── */
  const addProject = useCallback((url, branch = 'main') => {
    const name = url.replace('https://github.com/', '').split('/').pop() || 'Project';
    const newP = { id: Date.now(), name, url, branch, addedAt: new Date().toISOString(), lastRun: 'Never', runs: 0, status: 'idle' };
    setProjects(p => [...p, newP]);
    return newP;
  }, []);

  /* ── Remove project ── */
  const removeProject = useCallback((id) => {
    setProjects(p => p.filter(pr => pr.id !== id));
  }, []);

  /* ── Trigger pipeline ── */
  const triggerPipeline = useCallback(async (url, branch = 'main') => {
    const pid = `#${1024 + Math.floor(Math.random() * 100)}`;
    setActivePipeline({ id: pid, url, branch, startedAt: new Date() });
    setPipelineStep(0);
    pushNotif({ msg: `Pipeline ${pid} started for ${url.split('/').pop()}`, color: '#3b82f6' });
    // Update project lastRun
    setProjects(p => p.map(pr => pr.url === url ? { ...pr, lastRun: 'just now', runs: (pr.runs || 0) + 1, status: 'running' } : pr));
    try {
      await api.triggerPipeline({ repo_url: url, branch });
    } catch {
      /* demo mode — simulate pipeline steps */
      let step = 0;
      const sim = setInterval(() => {
        step++;
        setPipelineStep(step);
        if (step >= 6) {
          clearInterval(sim);
          setActivePipeline(null);
          setProjects(p => p.map(pr => pr.url === url ? { ...pr, status: 'success', lastRun: 'just now' } : pr));
          pushNotif({ msg: `Pipeline completed for ${url.split('/').pop()} ✓`, color: '#10b981' });
        }
      }, 1500);
    }
  }, [pushNotif]);

  /* ── Mark notifications read ── */
  const markAllRead = useCallback(() => setNotifications(n => n.map(x => ({ ...x, read: true }))), []);
  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    user, setUser,
    projects, addProject, removeProject,
    activePipeline, pipelineStep,
    notifications, pushNotif, markAllRead, unreadCount,
    wsConnected,
    triggerPipeline,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};
