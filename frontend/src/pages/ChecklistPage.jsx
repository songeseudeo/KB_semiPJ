import { useState, useEffect } from 'react';
import api from '../api/api';

export default function ChecklistPage({ initialType = '전세' }) {
  const [tradeType, setTradeType] = useState(initialType);
  const [checklists, setChecklists] = useState([]);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/checklist?tradeType=${tradeType}`)
      .then(res => { setChecklists(res.data); setChecked({}); })
      .catch(() => setChecklists([]))
      .finally(() => setLoading(false));
  }, [tradeType]);

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const total = checklists.length;
  const pct = total > 0 ? Math.round(checkedCount / total * 100) : 0;

  const typeIcons = { 월세: '🏠', 전세: '🔑', 매매: '🏡' };

  return (
    <>
      <div className="top-bar">
        <span className="title">계약 체크리스트</span>
      </div>

      <div className="checklist-type-tabs">
        {['월세', '전세', '매매'].map(t => (
          <button key={t} className={`clt-tab ${tradeType === t ? 'active' : ''}`} onClick={() => setTradeType(t)}>
            {typeIcons[t]} {t}
          </button>
        ))}
      </div>

      <div className="progress-bar-wrap">
        <div className="pb-label">
          <span className="pbl-text">전체 진행률</span>
          <span className="pbl-num">{checkedCount} / {total}</span>
        </div>
        <div className="pb-track">
          <div className="pb-fill" style={{ width: `${pct}%` }} />
        </div>
        {total > 0 && checkedCount === total && (
          <div className="pb-done">✅ 모든 항목 완료! 계약 준비가 됐어요.</div>
        )}
      </div>

      <div className="step-section">
        {loading ? (
          <div className="empty-state">
            <div className="es-icon">⏳</div>
            <div className="es-title">불러오는 중...</div>
          </div>
        ) : checklists.length === 0 ? (
          <div className="empty-state">
            <div className="es-icon">📋</div>
            <div className="es-title">데이터를 불러올 수 없습니다</div>
            <div className="es-desc">서버 연결을 확인해주세요.</div>
          </div>
        ) : (
          checklists.map((item) => (
            <div
              key={item.id}
              className={`check-item ${checked[item.id] ? 'checked' : ''}`}
              onClick={() => toggle(item.id)}
            >
              <div className="ci-box">
                <span className="ci-check">✓</span>
              </div>
              <div className="ci-content">
                <div className="ci-title">{item.title}</div>
                {item.description && <div className="ci-desc">{item.description}</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
