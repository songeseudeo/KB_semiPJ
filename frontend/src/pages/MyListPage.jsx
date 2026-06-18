import { CHECKLIST_DATA } from '../data/checklistData';

export default function MyListPage({ savedLists, checkStates, onCreateList, onOpenList, onDeleteList }) {
  const getProgress = (list) => {
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
        <button className="ml-add-btn" onClick={onCreateList}>+ 새 목록</button>
      </div>

      <div className="ml-body">
        {savedLists.length === 0 ? (
          <div className="ml-empty">
            <span className="empty-icon">📋</span>
            <p>아직 목록이 없어요</p>
            <small>새 체크리스트를 만들어보세요!</small>
          </div>
        ) : (
          savedLists.map(list => {
            const { pct, done, total } = getProgress(list);
            return (
              <div key={list.id} className="ml-card" onClick={() => onOpenList(list)}>
                <div className="mlc-header">
                  <span className="mlc-name">{list.name}</span>
                  <span className="mlc-type">{list.type}</span>
                </div>
                <div className="mlc-addr">📍 {list.addr}</div>
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
