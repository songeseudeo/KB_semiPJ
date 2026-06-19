const TAG_LABELS = { important: '⚠️ 중요', tip: '💡 팁', legal: '⚖️ 법률' };
const fmt = (won) => {
  if (!won || won === 0) return '-';
  if (won >= 10000) return `${Math.floor(won / 10000)}억 ${won % 10000 > 0 ? (won % 10000) + '만' : ''}`;
  return `${won}만`;
};

export default function CustomChecklistViewPage({ list, onBack, onUpdateList }) {
  const steps = list.customSteps || [];
  const states = list.customStates || {};
  const allKeys = steps.flatMap((s, si) => s.items.map((_, ii) => `${si}_${ii}`));
  const doneCount = allKeys.filter(k => states[k]).length;
  const total = allKeys.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const toggle = (si, ii) => {
    const key = `${si}_${ii}`;
    const newStates = { ...states, [key]: !states[key] };
    onUpdateList({ ...list, customStates: newStates });
  };

  const isStepDone = (si) => steps[si].items.every((_, ii) => states[`${si}_${ii}`]);

  return (
    <>
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="page-header-info">
          <div className="page-header-title">{list.name}</div>
          <div className="page-header-sub">📍 {list.addr} · {list.type}</div>
        </div>
      </div>

      {list.priceInfo && (
        <div style={{ margin: '12px 20px 0', background: '#EEF0FF', borderRadius: 12, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#5B6EF5', marginBottom: 6 }}>📊 조회 당시 시세</div>
          <div style={{ fontSize: 13, color: '#3D4F7C' }}>
            평균 {fmt(list.priceInfo.avg)}만원 · 최저 {fmt(list.priceInfo.min)} ~ 최고 {fmt(list.priceInfo.max)}만원 ({list.priceInfo.count}건)
          </div>
        </div>
      )}

      <div className="cl-progress" style={{ marginTop: 12 }}>
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
              const checked = !!states[`${si}_${ii}`];
              return (
                <div key={ii} className={`check-item ${checked ? 'checked' : ''}`} onClick={() => toggle(si, ii)}>
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
