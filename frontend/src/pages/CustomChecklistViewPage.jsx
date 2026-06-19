import { useState } from 'react';

const TAG_LABELS = { important: '⚠️ 중요', tip: '💡 팁', legal: '⚖️ 법률' };
const TAGS = ['important', 'tip', 'legal'];

const fmt = (won) => {
  if (!won || won === 0) return '-';
  if (won >= 10000) return `${Math.floor(won / 10000)}억 ${won % 10000 > 0 ? (won % 10000) + '만' : ''}`;
  return `${won}만`;
};

export default function CustomChecklistViewPage({ list, onBack, onUpdateList, onDelete }) {
  const [steps, setSteps] = useState(list.customSteps || []);
  const [states, setStates] = useState(list.customStates || {});
  const [editMode, setEditMode] = useState(false);
  // 항목 추가용
  const [addingStep, setAddingStep] = useState(null); // step index
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTag, setNewTag] = useState('tip');
  // 항목 수정용
  const [editingItem, setEditingItem] = useState(null); // {si, ii}

  const allKeys = steps.flatMap((s, si) => s.items.map((_, ii) => `${si}_${ii}`));
  const doneCount = allKeys.filter(k => states[k]).length;
  const total = allKeys.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const save = (newSteps, newStates = states) => {
    setSteps(newSteps);
    onUpdateList({ ...list, customSteps: newSteps, customStates: newStates });
  };

  const toggle = (si, ii) => {
    if (editMode) return;
    const key = `${si}_${ii}`;
    const newStates = { ...states, [key]: !states[key] };
    setStates(newStates);
    onUpdateList({ ...list, customSteps: steps, customStates: newStates });
  };

  const isStepDone = (si) => steps[si].items.every((_, ii) => states[`${si}_${ii}`]);

  // 항목 삭제
  const deleteItem = (si, ii) => {
    const newSteps = steps.map((s, i) => i !== si ? s : {
      ...s, items: s.items.filter((_, j) => j !== ii)
    });
    save(newSteps);
  };

  // 항목 추가
  const addItem = (si) => {
    if (!newTitle.trim()) return;
    const newSteps = steps.map((s, i) => i !== si ? s : {
      ...s, items: [...s.items, { t: newTitle.trim(), d: newDesc.trim(), tag: newTag }]
    });
    save(newSteps);
    setAddingStep(null);
    setNewTitle(''); setNewDesc(''); setNewTag('tip');
  };

  // 항목 수정 저장
  const saveEdit = () => {
    const { si, ii, t, d, tag } = editingItem;
    const newSteps = steps.map((s, i) => i !== si ? s : {
      ...s, items: s.items.map((item, j) => j !== ii ? item : { t, d, tag })
    });
    save(newSteps);
    setEditingItem(null);
  };

  return (
    <>
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="page-header-info">
          <div className="page-header-title">{list.name}</div>
          <div className="page-header-sub">📍 {list.addr} · {list.type}</div>
        </div>
        <button onClick={() => setEditMode(e => !e)} style={{
          marginLeft: 'auto', background: editMode ? '#5B6EF5' : '#EEF0FF',
          color: editMode ? '#fff' : '#5B6EF5', border: 'none', borderRadius: 20,
          padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>{editMode ? '✅ 완료' : '✏️ 편집'}</button>
      </div>

      {list.priceInfo && (
        <div style={{ margin: '12px 20px 0', background: '#EEF0FF', borderRadius: 12, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#5B6EF5', marginBottom: 4 }}>📊 조회 당시 시세</div>
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
              {!editMode && (
                <span className={`step-badge ${isStepDone(si) ? 'done' : 'progress'}`}>
                  {isStepDone(si) ? '✅ 완료' : '진행중'}
                </span>
              )}
            </div>

            {step.items.map((item, ii) => {
              const checked = !!states[`${si}_${ii}`];
              const isEditing = editingItem?.si === si && editingItem?.ii === ii;

              if (isEditing) return (
                <div key={ii} className="check-item" style={{ flexDirection: 'column', gap: 8, alignItems: 'stretch', cursor: 'default' }}>
                  <input className="loan-input" style={{ marginBottom: 0 }} value={editingItem.t}
                    onChange={e => setEditingItem(v => ({ ...v, t: e.target.value }))} placeholder="항목명" />
                  <input className="loan-input" style={{ marginBottom: 0 }} value={editingItem.d}
                    onChange={e => setEditingItem(v => ({ ...v, d: e.target.value }))} placeholder="설명 (선택)" />
                  <div style={{ display: 'flex', gap: 6 }}>
                    {TAGS.map(tag => (
                      <button key={tag} onClick={() => setEditingItem(v => ({ ...v, tag }))}
                        className={`chip ${editingItem.tag === tag ? 'selected' : ''}`} style={{ fontSize: 11 }}>
                        {TAG_LABELS[tag]}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="loan-submit" style={{ flex: 1, padding: '8px', fontSize: 13 }} onClick={saveEdit}>저장</button>
                    <button onClick={() => setEditingItem(null)} style={{ flex: 1, padding: '8px', fontSize: 13, background: '#EEF0FF', color: '#5B6EF5', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}>취소</button>
                  </div>
                </div>
              );

              return (
                <div key={ii} className={`check-item ${checked && !editMode ? 'checked' : ''}`}
                  onClick={() => toggle(si, ii)}
                  style={{ cursor: editMode ? 'default' : 'pointer' }}>
                  {!editMode && <div className="ci-box">{checked ? '✓' : ''}</div>}
                  <div className="ci-content" style={{ flex: 1 }}>
                    <div className="ci-title">{item.t}</div>
                    {item.d && <div className="ci-desc">{item.d}</div>}
                    {item.tag && <span className={`ci-tag ${item.tag}`}>{TAG_LABELS[item.tag]}</span>}
                  </div>
                  {editMode && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setEditingItem({ si, ii, t: item.t, d: item.d || '', tag: item.tag || 'tip' })}
                        style={{ background: '#EEF0FF', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#5B6EF5', cursor: 'pointer', fontWeight: 700 }}>수정</button>
                      <button onClick={() => deleteItem(si, ii)}
                        style={{ background: '#FFE8E8', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#E05555', cursor: 'pointer', fontWeight: 700 }}>삭제</button>
                    </div>
                  )}
                </div>
              );
            })}

            {editMode && (
              addingStep === si ? (
                <div style={{ padding: '12px 16px', background: '#F7F9FF', borderRadius: 12, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input className="loan-input" style={{ marginBottom: 0 }} value={newTitle}
                    onChange={e => setNewTitle(e.target.value)} placeholder="새 항목 이름 *" autoFocus />
                  <input className="loan-input" style={{ marginBottom: 0 }} value={newDesc}
                    onChange={e => setNewDesc(e.target.value)} placeholder="설명 (선택)" />
                  <div style={{ display: 'flex', gap: 6 }}>
                    {TAGS.map(tag => (
                      <button key={tag} onClick={() => setNewTag(tag)}
                        className={`chip ${newTag === tag ? 'selected' : ''}`} style={{ fontSize: 11 }}>
                        {TAG_LABELS[tag]}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="loan-submit" style={{ flex: 1, padding: '8px', fontSize: 13 }} onClick={() => addItem(si)}>추가</button>
                    <button onClick={() => setAddingStep(null)} style={{ flex: 1, padding: '8px', fontSize: 13, background: '#EEF0FF', color: '#5B6EF5', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}>취소</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setAddingStep(si); setNewTitle(''); setNewDesc(''); setNewTag('tip'); }}
                  style={{ width: '100%', padding: '10px', background: '#F0F3FF', border: '1.5px dashed #B0B8E0', borderRadius: 12, color: '#5B6EF5', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
                  + 항목 추가
                </button>
              )
            )}
          </div>
        ))}

        {editMode && (
          <button onClick={() => { if (window.confirm('이 체크리스트를 삭제할까요?')) onDelete(list.id); }}
            style={{ width: '100%', padding: '14px', background: '#FFE8E8', border: 'none', borderRadius: 14, color: '#E05555', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
            🗑️ 체크리스트 삭제
          </button>
        )}
      </div>
    </>
  );
}
