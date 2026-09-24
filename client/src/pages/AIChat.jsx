import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Edit3, Check, Feather } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AIChat() {
  const { user } = useAuth();
  const [botName, setBotName] = useState(() => localStorage.getItem('chatbotName') || 'Karr');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(botName);

  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${user?.name?.split(' ')[0] || 'friend'}. I am your personal memory companion and reflection listener. Share whatever is on your mind today — from small reflections to major life goals.`
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const saveBotName = (name) => {
    const clean = name.trim() || 'Karr';
    setBotName(clean);
    setTempName(clean);
    localStorage.setItem('chatbotName', clean);
    setIsEditingName(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const promptSuggestions = [
    "Reflect on my recent journal entries",
    "What goals have I set recently?",
    "Help me summarize my progress this week",
    "I want to build a daily writing habit"
  ];

  const handleSend = async (textToSend) => {
    const messageText = typeof textToSend === 'string' ? textToSend : query;
    if (!messageText || !messageText.trim() || isTyping) return;

    const trimmedText = messageText.trim();
    const userMsg = {
      sender: 'user',
      text: trimmedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setQuery('');
    setIsTyping(true);

    try {
      const historyPayload = newMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedText,
          query: trimmedText,
          botName,
          history: historyPayload
        })
      });
      const data = await res.json();

      const aiMsg = {
        sender: 'ai',
        text: data.answer || `I am listening. What else would you like to reflect on?`,
        card: data.updatedGoal || null,
        action: data.action || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `I am here with you. Please ensure the backend server is running.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="animate-fade-in reading-width" style={{
      padding: '2rem 1.5rem',
      height: 'calc(100vh - 90px)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      
      {/* Header Bar */}
      <div className="paper-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={18} />
          </div>

          <div>
            {isEditingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveBotName(tempName); }}
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.9rem', width: '120px' }}
                />
                <button onClick={() => saveBotName(tempName)} className="btn-ghost" style={{ padding: '0.2rem' }}>
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 600, lineHeight: 1.25, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                {botName}
                <button onClick={() => setIsEditingName(true)} className="btn-ghost" style={{ padding: '0.2rem', color: 'var(--text-subtle)' }}>
                  <Edit3 size={13} />
                </button>
              </h2>
            )}
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Memory Companion</p>
          </div>
        </div>

        <span className="badge badge-accent">
          <span className="pulse-dot"></span> Active RAG
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="paper-card paper-texture" style={{
        flex: 1,
        padding: '1.5rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                gap: '0.35rem'
              }}
            >
              <div style={{
                maxWidth: '82%',
                padding: '0.9rem 1.25rem',
                borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: isUser ? 'var(--accent)' : 'var(--bg-main)',
                color: isUser ? '#FFFFFF' : 'var(--text-main)',
                border: isUser ? 'none' : '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap'
              }}>
                {msg.text}
              </div>

              {msg.timestamp && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', padding: '0 0.5rem' }}>
                  {msg.timestamp}
                </span>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Sparkles size={14} className="animate-spin" />
            <span>{botName} is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {promptSuggestions.map((ps, i) => (
          <button
            key={i}
            onClick={() => handleSend(ps)}
            className="btn-ghost"
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              fontSize: '0.78rem',
              whiteSpace: 'nowrap'
            }}
          >
            {ps}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          placeholder={`Talk to ${botName}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          style={{
            flex: 1,
            borderRadius: 'var(--radius-full)',
            padding: '0.8rem 1.25rem'
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={!query.trim() || isTyping}
          className="btn-primary"
          style={{ padding: '0.8rem 1.25rem', opacity: !query.trim() ? 0.6 : 1 }}
        >
          <Send size={16} />
        </button>
      </div>

    </div>
  );
}
