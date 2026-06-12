import { useState } from 'react';
import HomePage from './pages/HomePage';
import ChecklistPage from './pages/ChecklistPage';
import LoanPage from './pages/LoanPage';
import ChatPage from './pages/ChatPage';
import './App.css';

const TABS = [
  { id: 'home',      icon: '🏠', label: '홈' },
  { id: 'checklist', icon: '✅', label: '체크리스트' },
  { id: 'loan',      icon: '💰', label: '대출추천' },
  { id: 'chat',      icon: '🤖', label: 'AI상담' },
];

export default function App() {
  const [tab, setTab] = useState('home');

  return (
    <div className="app-shell">
      <div className="page-container">
        {tab === 'home'      && <HomePage onNavigate={setTab} />}
        {tab === 'checklist' && <ChecklistPage />}
        {tab === 'loan'      && <LoanPage />}
        {tab === 'chat'      && <ChatPage />}
      </div>
      <nav className="bottom-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-item ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="ni-icon">{t.icon}</span>
            <span className="ni-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
