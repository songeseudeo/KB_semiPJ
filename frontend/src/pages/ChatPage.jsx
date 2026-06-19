import { useState, useRef, useEffect } from 'react';
import { CHAT_QA } from '../data/checklistData';

const SUGGESTIONS = CHAT_QA.map(q => q.label);
const now = () => new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

function findAnswer(input) {
  const text = input.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const qa of CHAT_QA) {
    const score = qa.keywords.filter(kw => text.includes(kw.toLowerCase())).length;
    if (score > bestScore) { bestScore = score; best = qa; }
  }
  return bestScore >= 1 ? best.answer : null;
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: '안녕하세요! 👋\n하우지 AI입니다.\n\n집 구할 때 궁금한 점을 물어보세요.\n전세·월세·매매 모두 도와드릴게요!', time: now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setMessages(prev => [...prev, { role: 'user', content, time: now() }]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const answer = findAnswer(content);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: answer || '음.. 그 부분은 제가 정확히 답하기 어렵네요 😅\n\n아래 버튼에서 비슷한 질문을 찾아보시거나, 더 구체적으로 물어봐 주세요!',
        time: now(),
      }]);
      setLoading(false);
    }, 600);
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
