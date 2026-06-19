import { CHECKLIST_DATA } from '../data/checklistData';

const fmt = (won) => {
  if (!won || won === 0) return '-';
  if (won >= 10000) return `${Math.floor(won / 10000)}억 ${won % 10000 > 0 ? (won % 10000) + '만' : ''}`;
  return `${won}만`;
};

export default function MyListPage({ savedLists, checkStates, onCreateList, onCreateCustom, onOpenList, onDeleteList }) {
  const getProgress = (list) => {
    if (list.isCustom) {
      const steps = list.customSteps || [];
      const states = list.customStates || {};
      const total = steps.reduce((s, step) => s + step.items.length, 0);
      if (total === 0) return { pct: 0, done: 0, total: 0 };
      const done = Object.values(states).filter(Boolean).length;
      return { pct: Math.round((done / total) * 100), done, total };
    }
    const data = CHECKLIST_DATA[list.type] || [];
    const total = data.reduce((s, step) => s + step.items.length, 0);
    if (total === 0) return { pct: 0, done: 0, total: 0 };
    const states = checkStates[list.type] || {};
    const done = Object.values(states).filter(Boolean).length;
    return { pct: Math.round((done / total) * 100), done, total };
  };

  return (
    <>
      <div className="ml-header">
        <div>
          <div className="ml-header-title">내 체크리스트</div>
          <div className="ml-header-sub">저장된 목록 {savedLists.length}개</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ml-add-btn" style={{ background: '#fff', color: '#5B6EF5', border: '1.5px solid #5B6EF5' }} onClick={onCreateList}>기본</button>
          <button className="ml-add-btn" onClick={onCreateCustom}>✨ 맞춤</button>
        </div>
      </div>

      <div style={{ margin: '0 20px 16px', background: '#EEF0FF', borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#3D4F7C', marginBottom: 4 }}>✨ 맞춤 체크리스트란?</div>
        <div style={{ fontSize: 12, color: '#6B7A99', lineHeight: 1.6 }}>
          지역 실거래가를 조회하고 AI가 내 상황에 맞는 체크리스트를 생성해드려요.<br />
          기본 체크리스트와 달리 지역·예산·시세가 반영됩니다.
        </div>
      </div>

      <div className="ml-body" style={{ paddingTop: 0 }}>
        {savedLists.length === 0 ? (
          <div className="ml-empty">
            <span className="empty-icon">📋</span>
            <p>아직 목록이 없어요</p>
            <small>"✨ 맞춤" 버튼으로 AI 체크리스트를 만들어보세요!</small>
          </div>
        ) : (
          savedLists.map(list => {
            const { pct, done, total } = getProgress(list);
            return (
              <div key={list.id} className="ml-card" onClick={() => onOpenList(list)}>
                <div className="mlc-header">
                  <span className="mlc-name">{list.name}</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {list.isCustom && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: '#EEF0FF', color: '#5B6EF5' }}>✨ AI맞춤</span>}
                    <span className="mlc-type">{list.type}</span>
                    <button onClick={e => { e.stopPropagation(); if (window.confirm(`"${list.name}" 목록을 삭제할까요?`)) onDeleteList(list.id); }}
                      style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', padding: '2px 4px', color: '#C0C8D8', lineHeight: 1 }}>🗑️</button>
                  </div>
                </div>
                <div className="mlc-addr">📍 {list.addr}</div>
                {list.isCustom && list.priceInfo && (
                  <div style={{ fontSize: 12, color: '#5B6EF5', marginBottom: 8, fontWeight: 600 }}>
                    📊 평균 {fmt(list.priceInfo.avg)}만원 ({list.priceInfo.count}건)
                  </div>
                )}
                <div className="mlc-progress">
                  <div className="mlc-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="mlc-meta">
                  <span>{list.date}</span>
                  <span>{done}/{total} ({pct}%)</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
