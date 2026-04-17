'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ===== RENDER MESSAGE WITH IMAGES =====
function renderMessageContent(content: string) {
  // Replace special token with image markdown (fallback injection)
  const processed = content.replace(/\{\{MITCHS_DREAM\}\}/g, '![Mitch\'s Dream](/images/mitchs-dream.png)');

  // Split on markdown image pattern: ![alt](url)
  const imageRegex = /(!\[[^\]]*\]\([^)]+\))/g;
  const parts = processed.split(imageRegex);

  return parts.map((part, i) => {
    // Check if this part is an image
    const imgMatch = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      return (
        <img
          key={i}
          src={imgMatch[2]}
          alt={imgMatch[1]}
          className="message-image"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      );
    }
    // Render text with newlines
    return (
      <span key={i} style={{ whiteSpace: 'pre-wrap' }}>
        {part}
      </span>
    );
  });
}

// ===== LOGIN COMPONENT =====
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        onLogin();
      } else {
        setError(data.error || 'Wrong password');
        setPassword('');
      }
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/images/rush-logo.png" alt="Rush" className="login-logo" />
        <h1>RushBot</h1>
        <p className="subtitle">
          Your personal Alex Lifeson chatbot<br />
          for the Rush LA Trip — June 2026
        </p>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="password"
            className="login-input"
            placeholder="Enter the password, man..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            disabled={loading}
          />
          {error && <p className="login-error">{error}</p>}
          <button
            type="submit"
            className="login-button"
            disabled={loading || !password}
          >
            {loading ? 'Checking...' : 'Enter the Limelight'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ===== CHAT COMPONENT =====
function ChatPage({ onLogout }: { onLogout: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    onLogout();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        // Add empty assistant message
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  assistantContent += parsed.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: 'assistant',
                      content: assistantContent,
                    };
                    return updated;
                  });
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Whoa, something went wrong with my amp! Error: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    "Where are we staying?",
    "Who has tickets for June 7th?",
    "What's your favorite guitar?",
    "Tell me about 2112",
  ];

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-avatar">🎸</div>
        <div className="chat-header-info">
          <h2>Alex Lifeson</h2>
          <p>RushBot • LA Trip June 2026</p>
        </div>
        <div className="chat-header-badge">🌟 Rush</div>
        <button className="logout-button" onClick={handleLogout} title="Back to login">
          ← Exit
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-container">
            <img src="/images/rush-logo.png" alt="Rush" className="welcome-logo" />
            <h2>Hey! It&apos;s Lerxst!</h2>
            <p>
              Welcome to the Rush LA Trip chatbot. Ask me about the trip details,
              tickets, housing — or anything about Rush. I&apos;ve been doing this
              for about 50 years, so I know a thing or two!
            </p>
            <div className="suggestion-chips">
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="suggestion-chip"
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'assistant' ? '🎸' : '👤'}
                </div>
                <div className="message-bubble">{renderMessageContent(msg.content)}</div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="typing-indicator">
                <div className="message-avatar">🎸</div>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask Alex anything about Rush or the LA trip..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="chat-send-button"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====
export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if already authenticated (cookie exists)
  useEffect(() => {
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    })
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <>
        <div className="starfield" />
        <div className="login-container">
          <div className="login-card">
            <span className="logo-emoji">🎸</span>
            <h1>RushBot</h1>
            <p className="subtitle">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="starfield" />
      {authenticated ? (
        <ChatPage onLogout={() => setAuthenticated(false)} />
      ) : (
        <LoginPage onLogin={() => setAuthenticated(true)} />
      )}
    </>
  );
}
