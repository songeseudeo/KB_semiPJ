import { useState, useRef, useEffect } from 'react';
import { CHAT_ANSWERS } from '../data/checklistData';
import api from '../api/api';

const SUGGESTIONS = Object.keys(CHAT_ANSWERS);
const now = () => new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: '안녕하세요! 👋\n하우지 AI입니다.\n\n집 구할 때 궁금한 점을 물어보세요. 전세·월세·매매 모두 도와드릴게요!', time: now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setMessages(prev => [...prev, { role: 'user', content, time: now() }]);
    setInput('');
    setLoading(true);

    if (CHAT_ANSWERS[content]) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', content: CHAT_ANSWERS[content], time: now() }]);
        setLoading(false);
      }, 600);
      return;
    }

    try {
      const apiMessages = [...messages, { role: 'user', content }]
        .map(m => ({
          role: m.role === 'bot' ? 'assistant' : 'user',
          content: m.content,
        }));
      const res = await api.post('/api/chat', { messages: apiMessages });
      setMessages(prev => [...prev, { role: 'bot', content: res.data.reply, time: now() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: '잠시 연결이 원활하지 않아요 😅\n아래 자주 묻는 질문을 눌러보시거나, 잠시 후 다시 시도해 주세요.',
        time: now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="chat-header">
        <div className="chat-bot-icon">🏠</div>
        <div className="chat-bot-info">
          <div className="chat-bot-name">하우지 AI</div>
          <div className="chat-bot-status">온라인</div>
        </div>
      </div>

      <div className="chat-body">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.role === 'bot' && <div className="msg-avatar">🏠</div>}
            <div className="msg-bubble">{m.content}</div>
            <span className="msg-time">{m.time}</span>
          </div>
        ))}
        {loading && (
          <div className="msg bot">
            <div className="msg-avatar">🏠</div>
            <div className="msg-bubble">
              <span className="typing-dot">●</span>
              <span className="typing-dot">●</span>
              <span className="typing-dot">●</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-suggestions">
        {SUGGESTIONS.map(s => (
          <button key={s} className="suggestion-btn" onClick={() => send(s)}>{s}</button>
        ))}
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="궁금한 점을 입력하세요..."
          rows={1}
          disabled={loading}
        />
        <button className="chat-send-btn" onClick={() => send()} disabled={loading || !input.trim()}>
          ➤
        </button>
      </div>
    </>
  );
}
