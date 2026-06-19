import { useState } from 'react';
import { CHECKLIST_DATA } from '../data/checklistData';

const TAG_LABELS = { important: '⚠️ 중요', tip: '💡 팁', legal: '⚖️ 법률' };

export default function ChecklistPage({ initialType = '월세', listId, checkStates, onCheckStates, onBack }) {
  const [activeType, setActiveType] = useState(initialType);
  const steps = CHECKLIST_DATA[activeType] || [];

  // listId가 있으면 목록별 독립 상태, 없으면 자유 탐색 상태
  const stateKey = listId ? listId : `free_${activeType}`;
  const typeStates = checkStates[stateKey] || {};

  const allKeys = steps.flatMap((s, si) => s.items.map((_, ii) => `${si}_${ii}`));
  const doneCount = allKeys.filter(k => typeStates[k]).length;
  const total = allKeys.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const toggle = (si, ii) => {
    const key = `${si}_${ii}`;
    onCheckStates({ ...checkStates, [stateKey]: { ...typeStates, [key]: !typeStates[key] } });
  };

  const isStepDone = (si) => steps[si].items.every((_, ii) => typeStates[`${si}_${ii}`]);

  return (
    <>
      <div className="page-header">
        {onBack && <button className="back-btn" onClick={onBack}>←</button>}
        <div className="page-header-info">
          <div className="page-header-title">부동산 체크리스트</div>
          <div className="page-header-sub">계약 전 빠짐없이 확인하세요</div>
        </div>
      </div>

      <div className="cl-tabs">
        {['월세', '전세', '매매'].map(t => (
          <button key={t} className={`cl-tab ${activeType === t ? 'active' : ''}`}
            onClick={() => setActiveType(t)}>
            {t === '월세' ? '🏠 월세' : t === '전세' ? '🔑 전세' : '🏡 매매'}
          </button>
        ))}
      </div>

      <div className="cl-progress">
        <div className="progress-label">
          <span>진행률</span><span>{doneCount} / {total} 완료</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="cl-body">
        {steps.map((step, si) => (
          <div key={si} className="step-section">
            <div className="step-header">
              <div className="step-num">{si + 1}</div>
              <div className="step-title">{step.step.replace(/^\d+단계: /, '')}</div>
              <span className={`step-badge ${isStepDone(si) ? 'done' : 'progress'}`}>
                {isStepDone(si) ? '✅ 완료' : '진행중'}
              </span>
            </div>
            {step.items.map((item, ii) => {
              const checked = !!typeStates[`${si}_${ii}`];
              return (
                <div key={ii} className={`check-item ${checked ? 'checked' : ''}`}
                  onClick={() => toggle(si, ii)}>
                  <div className="ci-box">{checked ? '✓' : ''}</div>
                  <div className="ci-content">
                    <div className="ci-title">{item.t}</div>
                    <div className="ci-desc">{item.d}</div>
                    {item.tag && <span className={`ci-tag ${item.tag}`}>{TAG_LABELS[item.tag]}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
