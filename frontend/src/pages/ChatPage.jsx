import { useState, useRef, useEffect } from 'react';
import api from '../api/api';

const SUGGESTIONS = ['전세 계약 주의사항', '전세 사기 예방법', '대출 조건 알려줘', '등기부등본 보는 법'];

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: '안녕하세요! KB부동산 AI 상담사입니다 🏠\n부동산 관련 궁금한 점을 물어보세요.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const content = text || input;
    if (!content.trim() || loading) return;
    const userMsg = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const apiMessages = newMessages
        .filter(m => m.role !== 'bot' || newMessages.indexOf(m) > 0)
        .map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }));
      const res = await api.post('/api/chat', { messages: apiMessages });
      setMessages(prev => [...prev, { role: 'bot', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', content: '오류가 발생했습니다. 다시 시도해주세요.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="top-bar">
        <span className="title">AI 부동산 상담</span>
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-row ${m.role === 'user' ? 'user' : ''}`}>
            {m.role === 'bot' && <div className="chat-bot-name">KB AI 상담사</div>}
            <div className={`chat-bubble ${m.role === 'user' ? 'user' : 'bot'}`}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-row">
            <div className="chat-bot-name">KB AI 상담사</div>
            <div className="chat-bubble bot">
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-suggestions">
        {SUGGESTIONS.map(s => (
          <button key={s} className="chat-sug-btn" onClick={() => send(s)}>{s}</button>
        ))}
      </div>

      <div className="chat-input-row">
        <textarea
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="궁금한 점을 입력하세요"
          rows={1}
          disabled={loading}
        />
        <button className="chat-send-btn" onClick={() => send()} disabled={loading}>➤</button>
      </div>
    </div>
  );
}
