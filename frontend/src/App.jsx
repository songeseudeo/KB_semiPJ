import { useState } from 'react';
import HomePage from './pages/HomePage';
import ChecklistPage from './pages/ChecklistPage';
import LoanPage from './pages/LoanPage';
import ChatPage from './pages/ChatPage';
import TermsPage from './pages/TermsPage';
import './App.css';

const TABS = [
  { id: 'home',      icon: '🏠', label: '홈' },
  { id: 'checklist', icon: '✅', label: '체크리스트' },
  { id: 'loan',      icon: '🏡', label: '맞춤추천' },
  { id: 'chat',      icon: '🤖', label: 'AI상담' },
];

export default function App() {
  const [tab, setTab] = useState('home');
  const [selectedTradeType, setSelectedTradeType] = useState('전세');

  const goChecklist = (type) => {
    setSelectedTradeType(type);
    setTab('checklist');
  };

  return (
    <div className="app-shell">
      <div className="page-container">
        {tab === 'home'      && <HomePage onNavigate={setTab} onGoChecklist={goChecklist} />}
        {tab === 'checklist' && <ChecklistPage initialType={selectedTradeType} />}
        {tab === 'loan'      && <LoanPage />}
        {tab === 'chat'      && <ChatPage />}
        {tab === 'terms'     && <TermsPage onBack={() => setTab('home')} />}
      </div>
      {tab !== 'terms' && (
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
      )}
    </div>
  );
}
