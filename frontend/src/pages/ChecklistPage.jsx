import { useState, useEffect } from 'react';
import api from '../api/api';

export default function ChecklistPage() {
  const [tradeType, setTradeType] = useState('전세');
  const [checklists, setChecklists] = useState([]);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    api.get(`/api/checklist?tradeType=${tradeType}`)
      .then(res => { setChecklists(res.data); setChecked({}); })
      .catch(() => setChecklists([]));
  }, [tradeType]);

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const total = checklists.length;
  const pct = total > 0 ? Math.round(checkedCount / total * 100) : 0;

  return (
    <>
      <div className="top-bar">
        <span className="title">계약 체크리스트</span>
      </div>

      <div className="checklist-type-tabs">
        {['월세', '전세', '매매'].map(t => (
          <button key={t} className={`clt-tab ${tradeType === t ? 'active' : ''}`} onClick={() => setTradeType(t)}>{t}</button>
        ))}
      </div>

      <div className="progress-bar-wrap">
        <div className="pb-label">
          <span className="pbl-text">진행률</span>
          <span className="pbl-num">{checkedCount}/{total}</span>
        </div>
        <div className="pb-track">
          <div className="pb-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="step-section">
        {checklists.length === 0 ? (
          <div className="empty-state">
            <div className="es-icon">📋</div>
            <div className="es-title">체크리스트가 없습니다</div>
            <div className="es-desc">서버에서 데이터를 불러오는 중이에요.</div>
          </div>
        ) : (
          checklists.map((item, i) => (
            <div
              key={item.id}
              className={`check-item ${checked[item.id] ? 'checked' : ''}`}
              onClick={() => toggle(item.id)}
            >
              <div className="ci-box">
                <span className="ci-check">✓</span>
              </div>
              <div>
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
