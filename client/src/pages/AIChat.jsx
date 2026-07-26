import React, { useState } from 'react';
import { Send, Bot, Sparkles, CheckCircle2, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AIChat() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hey ${user?.name?.split(' ')[0] || 'Alex'}! 😊 I'm ChatGPT, your super friendly, caring AI companion and journal life coach! 💖\n\nI remember all your past journal memories, goals, and milestones.\n\n✨ How can I support you today? You can ask me anything about your reflections, or ask me to change/add any of your goals right here!`
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const promptSuggestions = [
    "Change my goal 'Learn Machine Learning' to 'Master Deep Learning & PyTorch'",
    "Mark 'Run 5km 3x a week' as completed",
    "Add goal: Read 20 pages of AI books daily",
    "What are my active goals?",
    "Summarize this week lovingly.",
    "How has my mood evolved?"
  ];

  const handleSend = async (textToSend) => {
    const messageText = textToSend || query;
    if (!messageText.trim() || isTyping) return;

    const userMsg = {
      sender: 'user',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: messageText.trim() })
      });
      const data = await res.json();

      const aiMsg = {
        sender: 'ai',
        text: data.answer || "I'm right here with you! How else can I assist with your journal or goals today? 💖",
        card: data.updatedGoal || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "I'm always here for you, my friend! 💖 Make sure your backend server is connected.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', height: 'calc(100vh - 110px)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #10A37F, #22C55E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 6px 18px rgba(16, 163, 127, 0.4)' }}>
            <Bot size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ChatGPT OpenAI Companion <Heart size={20} color="#F43F5E" fill="#F43F5E" />
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Super friendly, empathetic companion & instant goal customizer
            </p>
          </div>
        </div>
        <span className="badge badge-emerald" style={{ padding: '0.5rem 0.9rem' }}>
          <Sparkles size={14} /> GPT 4o Best Friend Persona
        </span>
      </div>

      {/* Suggested Prompts Grid */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: '#10A37F',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            💬 {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="glass-card" style={{
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
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                gap: '0.75rem'
              }}
            >
              {!isUser && (
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #10A37F, #16A34A)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={20} />
                </div>
              )}

              <div style={{ maxWidth: '78%' }}>
                <div style={{
                  padding: '1rem 1.25rem',
                  borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: isUser ? 'linear-gradient(135deg, #10A37F 0%, #16A34A 100%)' : 'var(--bg-card)',
                  color: isUser ? '#ffffff' : 'var(--text-main)',
                  border: isUser ? 'none' : '1px solid var(--border-color)',
                  boxShadow: isUser ? '0 4px 14px rgba(16, 163, 127, 0.35)' : 'var(--shadow-sm)',
                  fontSize: '0.98rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                </div>

                {msg.card && (
                  <div style={{ marginTop: '0.5rem', padding: '0.85rem 1rem', background: 'rgba(16, 163, 127, 0.12)', border: '1px solid #10A37F', borderRadius: '14px', color: '#10A37F', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} />
                    <span>Updated Goal: "{msg.card.title}"</span>
                    <span className="badge badge-emerald" style={{ marginLeft: 'auto' }}>{msg.card.status} ({msg.card.progress}%)</span>
                  </div>
                )}

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem', textAlign: isUser ? 'right' : 'left' }}>
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                  alt="User avatar"
                  style={{ width: '38px', height: '38px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                />
              )}
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #10A37F, #16A34A)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} />
            </div>
            <span className="animate-pulse-glow">ChatGPT is crafting a warm response for you... 💖</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '20px' }}>
        <input
          type="text"
          placeholder="Ask ChatGPT anything or say: 'Change my goal X to Y'..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none', outline: 'none',
            color: 'var(--text-main)',
            fontSize: '1rem'
          }}
        />
        <button
          onClick={() => handleSend()}
          className="btn-primary"
          disabled={!query.trim() || isTyping}
          style={{ padding: '0.65rem 1.25rem', borderRadius: '14px' }}
        >
          <Send size={18} />
          <span>Send</span>
        </button>
      </div>

    </div>
  );
}
