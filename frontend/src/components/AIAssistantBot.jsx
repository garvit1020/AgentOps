import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, ChevronDown, RefreshCw, HelpCircle, User, Zap } from 'lucide-react';
import { api } from '../services/api';

const QUICK_PROMPTS = [
  '🚀 How do I run a pipeline for my repo?',
  '🐳 Where are built Docker images deployed?',
  '🤖 What do the 5 AI Agents do?',
  '⚙️ How to add GitHub token & Groq API key?',
];

export default function AIAssistantBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Hi! I'm **OpsAI**, your AI DevOps Assistant. Ask me anything about your pipelines, GitHub repos, Docker, Kubernetes deployments, or AI agents!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setUnread(false);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(query);
      const botReply = res.data?.reply || "I'm having trouble fetching a response. Please make sure the agent server is running.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "🚀 **AgentOps Knowledge Engine Response:**\n\nTo run a pipeline, paste any public GitHub repo URL on the **Pipeline** page and click **Launch Pipeline**!",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text) => {
    return text.split('\n').map((line, idx) => {
      let formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.8em;color:#93c5fd">$1</code>');

      return (
        <div key={idx} style={{ marginBottom: line.trim() === '' ? 8 : 4 }} dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  };

  return (
    <>
      {/* ── Floating Toggle Button ── */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            border: '2px solid rgba(255,255,255,0.2)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(59,130,246,0.5)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: isOpen ? 'rotate(90deg) scale(0.95)' : 'scale(1)',
            position: 'relative',
          }}
          title="Ask OpsAI Assistant"
        >
          {isOpen ? <X size={24} /> : <Bot size={28} />}
          {unread && !isOpen && (
            <span
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 16,
                height: 16,
                background: '#10b981',
                borderRadius: '50%',
                border: '2px solid #030d1a',
                animation: 'pulse 2s infinite',
              }}
            />
          )}
        </button>
      </div>

      {/* ── Chat Modal ── */}
      {isOpen && (
        <div
          className="animate-slide-down"
          style={{
            position: 'fixed',
            bottom: 94,
            right: 24,
            width: 380,
            maxHeight: 560,
            height: '75vh',
            background: 'rgba(3, 13, 26, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 20,
            boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9998,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  boxShadow: '0 0 12px rgba(59,130,246,0.4)',
                }}
              >
                <Bot size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                  OpsAI Assistant
                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(16,185,129,0.2)', color: '#34d399', borderRadius: 99, border: '1px solid rgba(16,185,129,0.3)' }}>Online</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Powered by AgentOps Knowledge Engine</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '86%',
                    padding: '12px 16px',
                    borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: m.sender === 'user' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${m.sender === 'user' ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: '#fff',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                  }}
                >
                  {renderFormattedText(m.text)}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4, padding: '0 4px' }}>{m.time}</span>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 6, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 16, width: 'fit-content' }}>
                <div style={{ width: 8, height: 8, background: '#3b82f6', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                <div style={{ width: 8, height: 8, background: '#8b5cf6', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }} />
                <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }} />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: '8px 12px', display: 'flex', gap: 6, overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 99,
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.25)',
                  color: '#93c5fd',
                  fontSize: '0.7rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: 'flex', gap: 8 }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask OpsAI a question..."
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: input.trim() ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
