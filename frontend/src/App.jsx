import { useState } from 'react';
import HomePage from './pages/HomePage';
import ChecklistPage from './pages/ChecklistPage';
import MyListPage from './pages/MyListPage';
import ChatPage from './pages/ChatPage';
import TermsPage from './pages/TermsPage';
import LoanPage from './pages/LoanPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CustomChecklistPage from './pages/CustomChecklistPage';
import CustomChecklistViewPage from './pages/CustomChecklistViewPage';
import './App.css';

const TABS = [
  { id: 'home',      icon: '🏠', label: '홈' },
  { id: 'checklist', icon: '✅', label: '체크리스트' },
  { id: 'mylist',    icon: '📋', label: '내 목록' },
  { id: 'chat',      icon: '💬', label: 'AI 상담' },
];
const NAV_TABS = ['home', 'checklist', 'mylist', 'chat'];

export default function App() {
  const [authScreen, setAuthScreen] = useState('login');
  const [currentUser, setCurrentUser] = useState(
    () => JSON.parse(localStorage.getItem('kb_current_user') || 'null')
  );
  const [screen, setScreen] = useState('home');
  const [checklistType, setChecklistType] = useState('월세');
  const [viewingList, setViewingList] = useState(null);
  const [savedLists, setSavedLists] = useState(
    () => JSON.parse(localStorage.getItem('kb_lists') || '[]')
  );
  const [checkStates, setCheckStates] = useState(
    () => JSON.parse(localStorage.getItem('kb_states') || '{}')
  );
  const [showModal, setShowModal] = useState(false);
  const [modalName, setModalName] = useState('');
  const [modalAddr, setModalAddr] = useState('');
  const [modalType, setModalType] = useState('월세');

  const persistLists = (lists) => {
    setSavedLists(lists);
    localStorage.setItem('kb_lists', JSON.stringify(lists));
  };
  const persistStates = (states) => {
    setCheckStates(states);
    localStorage.setItem('kb_states', JSON.stringify(states));
  };

  const logout = () => {
    localStorage.removeItem('kb_current_user');
    setCurrentUser(null);
    setAuthScreen('login');
  };

  const openCreateModal = () => {
    setModalName(''); setModalAddr(''); setModalType('월세');
    setShowModal(true);
  };
  const createBasicList = () => {
    if (!modalName.trim()) return;
    persistLists([{ id: Date.now(), name: modalName.trim(), addr: modalAddr.trim() || '주소 미입력', type: modalType, date: new Date().toLocaleDateString('ko-KR'), isCustom: false }, ...savedLists]);
    setShowModal(false);
    setChecklistType(modalType);
    setScreen('checklist');
  };

  const openList = (list) => {
    if (list.isCustom) {
      setViewingList(list);
      setScreen('customView');
    } else {
      setChecklistType(list.type);
      setScreen('checklist');
    }
  };

  const updateList = (updated) => {
    const newLists = savedLists.map(l => l.id === updated.id ? updated : l);
    persistLists(newLists);
    setViewingList(updated);
  };

  const saveCustomList = (newList) => {
    persistLists([newList, ...savedLists]);
    setViewingList(newList);
    setScreen('customView');
  };

  const activeTab = NAV_TABS.includes(screen) ? screen : null;

  if (!currentUser) {
    return authScreen === 'login'
      ? <LoginPage onLogin={u => setCurrentUser(u)} onGoSignup={() => setAuthScreen('signup')} />
      : <SignupPage onGoLogin={() => setAuthScreen('login')} />;
  }

  return (
    <>
      <div className="screen">
        {screen === 'home' &&
          <HomePage user={currentUser} savedLists={savedLists}
            onGoChecklist={t => { setChecklistType(t); setScreen('checklist'); }}
            onGoMyList={() => setScreen('mylist')}
            onGoChat={() => setScreen('chat')}
            onGoTerms={() => setScreen('terms')}
            onGoLoan={() => setScreen('loan')}
            onCreateList={openCreateModal}
            onOpenList={openList}
            onLogout={logout}
          />}
        {screen === 'checklist' &&
          <ChecklistPage initialType={checklistType} checkStates={checkStates}
            onCheckStates={persistStates} onBack={() => setScreen('home')} />}
        {screen === 'mylist' &&
          <MyListPage savedLists={savedLists} checkStates={checkStates}
            onCreateList={openCreateModal}
            onCreateCustom={() => setScreen('customCreate')}
            onOpenList={openList}
            onDeleteList={id => persistLists(savedLists.filter(l => l.id !== id))} />}
        {screen === 'chat' && <ChatPage />}
        {screen === 'terms' && <TermsPage onBack={() => setScreen('home')} />}
        {screen === 'loan' && <LoanPage onBack={() => setScreen('home')} />}
        {screen === 'customCreate' &&
          <CustomChecklistPage onBack={() => setScreen('mylist')} onSave={saveCustomList} />}
        {screen === 'customView' && viewingList &&
          <CustomChecklistViewPage list={viewingList} onBack={() => setScreen('mylist')} onUpdateList={updateList} />}
      </div>

      <nav className="bottom-nav">
        {TABS.map(t => (
          <button key={t.id} className={`nav-item ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setScreen(t.id)}>
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-sheet">
            <div className="modal-handle" />
            <div className="modal-title">기본 체크리스트 만들기</div>
            <label className="modal-label">목록 이름 *</label>
            <input className="modal-input" placeholder="예: 강남구 원룸 매물"
              value={modalName} onChange={e => setModalName(e.target.value)} />
            <label className="modal-label">주소 (선택)</label>
            <input className="modal-input" placeholder="예: 서울시 강남구 역삼동"
              value={modalAddr} onChange={e => setModalAddr(e.target.value)} />
            <label className="modal-label">거래 유형</label>
            <div className="modal-type-btns">
              {['월세', '전세', '매매'].map(t => (
                <button key={t} className={`modal-type-btn ${modalType === t ? 'selected' : ''}`}
                  onClick={() => setModalType(t)}>
                  {t === '월세' ? '🏠 월세' : t === '전세' ? '🔑 전세' : '🏡 매매'}
                </button>
              ))}
            </div>
            <button className="modal-confirm-btn" onClick={createBasicList}>체크리스트 시작하기</button>
            <button className="modal-cancel-btn" onClick={() => setShowModal(false)}>취소</button>
          </div>
        </div>
      )}
    </>
  );
}
