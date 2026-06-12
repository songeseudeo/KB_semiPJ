import { CHECKLIST_DATA } from '../data/checklistData';

export default function HomePage({
  savedLists,
  onGoChecklist,
  onGoMyList,
  onGoChat,
  onGoTerms,
  onGoLoan,
  onCreateList,
  onOpenList,
}) {
  const getProgress = (list) => {
    const data = CHECKLIST_DATA[list.type] || [];
    const total = data.reduce((s, step) => s + step.items.length, 0);
    if (total === 0) return 0;
    const stored = JSON.parse(localStorage.getItem('kb_states') || '{}');
    const states = stored[list.type] || {};
    const done = Object.values(states).filter(Boolean).length;
    return Math.round((done / total) * 100);
  };

  return (
    <>
      <div className="hero">
        <span className="hero-icon">🏠</span>
        <div className="hero-title">처음 집 구할 때<br />뭐부터 해야 할까?</div>
        <div className="hero-sub">KB 부동산 스마트 가이드와 함께 시작하세요</div>
      </div>

      <div className="notice-banner">
        <span>💡</span>
        <span>전세 계약 전 <strong>등기부등본</strong> 확인은 필수입니다!</span>
      </div>

      <div className="type-cards">
        {[
          { icon: '🏠', name: '월세', sub: '매달 납부' },
          { icon: '🔑', name: '전세', sub: '목돈 보증' },
          { icon: '🏡', name: '매매', sub: '내 집 마련' },
        ].map(t => (
          <div key={t.name} className="type-card" onClick={() => onGoChecklist(t.name)}>
            <span className="tc-icon">{t.icon}</span>
            <div className="tc-label">{t.name}</div>
            <div className="tc-sub">{t.sub}</div>
          </div>
        ))}
      </div>

      <div className="section-title">빠른 메뉴</div>
      <div className="quick-grid">
        <button className="quick-btn" onClick={onGoMyList}>
          <span className="quick-btn-icon">📋</span>
          <span className="quick-btn-label">내 체크리스트</span>
          <span className="quick-btn-sub">저장된 목록 보기</span>
        </button>
        <button className="quick-btn" onClick={onGoChat}>
          <span className="quick-btn-icon">💬</span>
          <span className="quick-btn-label">AI 상담하기</span>
          <span className="quick-btn-sub">부동산 Q&amp;A</span>
        </button>
        <button className="quick-btn" onClick={onGoLoan}>
          <span className="quick-btn-icon">🏡</span>
          <span className="quick-btn-label">맞춤 집 추천</span>
          <span className="quick-btn-sub">내 상황 분석</span>
        </button>
        <button className="quick-btn" onClick={onGoTerms}>
          <span className="quick-btn-icon">📖</span>
          <span className="quick-btn-label">용어 가이드</span>
          <span className="quick-btn-sub">어려운 용어 정리</span>
        </button>
      </div>

      <div className="section-title">최근 체크리스트</div>
      <div className="recent-section">
        {savedLists.length === 0 ? (
          <div className="recent-empty">
            <span className="empty-icon">📋</span>
            아직 저장된 체크리스트가 없어요<br />
            <button
              style={{ marginTop: 12, background: '#8B4513', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 20px', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              onClick={onCreateList}
            >
              + 새 목록 만들기
            </button>
          </div>
        ) : (
          savedLists.slice(0, 3).map(list => {
            const pct = getProgress(list);
            return (
              <div key={list.id} className="recent-card" onClick={() => onOpenList(list)}>
                <div className="rc-header">
                  <span className="rc-name">{list.name}</span>
                  <span className="rc-type">{list.type}</span>
                </div>
                <div className="rc-progress">
                  <div className="rc-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="rc-meta">
                  <span>{list.addr}</span>
                  <span>{pct}% 완료</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
