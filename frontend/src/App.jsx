import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing    from './pages/Landing';
import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import Pipeline   from './pages/Pipeline';
import Agents     from './pages/Agents';
import Deployments from './pages/Deployments';
import Monitoring from './pages/Monitoring';
import Logs       from './pages/Logs';
import Settings   from './pages/Settings';
import Sidebar    from './components/Sidebar';
import Header     from './components/Header';
import AIAssistantBot from './components/AIAssistantBot';

/* ── Auth guard ── */
function ProtectedLayout({ children }) {
  const user = localStorage.getItem('agentops_user');
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Header />
        <main className="page-body">{children}</main>
      </div>
      <AIAssistantBot />
    </div>
  );
}

/* ── Public guard (redirect if already logged in) ── */
function PublicRoute({ children }) {
  const user = localStorage.getItem('agentops_user');
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected */}
        <Route path="/dashboard"   element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/pipeline"    element={<ProtectedLayout><Pipeline /></ProtectedLayout>} />
        <Route path="/agents"      element={<ProtectedLayout><Agents /></ProtectedLayout>} />
        <Route path="/deployments" element={<ProtectedLayout><Deployments /></ProtectedLayout>} />
        <Route path="/monitoring"  element={<ProtectedLayout><Monitoring /></ProtectedLayout>} />
        <Route path="/logs"        element={<ProtectedLayout><Logs /></ProtectedLayout>} />
        <Route path="/settings"    element={<ProtectedLayout><Settings /></ProtectedLayout>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
