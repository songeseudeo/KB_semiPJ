import { useState } from 'react';
import api from '../api/api';

export default function LoanPage({ onBack }) {
  const [form, setForm] = useState({
    income: '',
    savings: '',
    period: '',
    household: '1인',
    wish: '모르겠음',
  });
  const [priorities, setPriorities] = useState([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const togglePriority = (v) =>
    setPriorities(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const submit = async () => {
    if (!form.income || !form.savings || !form.period) {
      alert('월 소득, 저축액, 거주 기간을 입력해주세요.');
      return;
    }
    setLoading(true);
    setResult('');
    const prompt = `
당신은 부동산 전문 상담사입니다. 아래 사용자 정보를 바탕으로 월세/전세/매매 중 어떤 유형이 가장 적합한지 추천하고, 이유와 주의사항을 친근하게 설명해주세요.

- 월 소득: ${form.income}만원
- 현재 저축액: ${form.savings}만원
- 예상 거주 기간: ${form.period}년
- 가구 구성: ${form.household}
- 향후 내 집 마련 희망: ${form.wish}
- 주거 선택 시 우선순위: ${priorities.length ? priorities.join(', ') : '없음'}

추천 결과를 이모지와 함께 명확하게 알려주시고, 각 유형의 장단점도 간단히 비교해주세요.
`.trim();

    try {
      const res = await api.post('/api/chat', {
        messages: [{ role: 'user', content: prompt }]
      });
      setResult(res.data.reply);
    } catch {
      setResult('AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="loan-header">
        <button className="loan-back-btn" onClick={onBack}>←</button>
        <div className="loan-header-title">맞춤 집 추천</div>
      </div>

      <div className="loan-body">
        <div className="loan-form-group">
          <label className="loan-label">💰 월 소득 (만원)</label>
          <input className="loan-input" type="number" placeholder="예: 300"
            value={form.income} onChange={e => setForm({...form, income: e.target.value})} />
        </div>
        <div className="loan-form-group">
          <label className="loan-label">🏦 현재 저축액 (만원)</label>
          <input className="loan-input" type="number" placeholder="예: 3000"
            value={form.savings} onChange={e => setForm({...form, savings: e.target.value})} />
        </div>
        <div className="loan-form-group">
          <label className="loan-label">📅 예상 거주 기간 (년)</label>
          <input className="loan-input" type="number" placeholder="예: 2"
            value={form.period} onChange={e => setForm({...form, period: e.target.value})} />
        </div>
        <div className="loan-form-group">
          <label className="loan-label">👥 가구 구성</label>
          <div className="chip-group">
            {['1인', '2인', '가족(3인+)'].map(v => (
              <button key={v} className={`chip ${form.household === v ? 'selected' : ''}`}
                onClick={() => setForm({...form, household: v})}>{v}</button>
            ))}
          </div>
        </div>
        <div className="loan-form-group">
          <label className="loan-label">🏡 향후 내 집 마련 희망</label>
          <div className="chip-group">
            {['예', '아니오', '모르겠음'].map(v => (
              <button key={v} className={`chip ${form.wish === v ? 'selected' : ''}`}
                onClick={() => setForm({...form, wish: v})}>{v}</button>
            ))}
          </div>
        </div>
        <div className="loan-form-group">
          <label className="loan-label">⭐ 주거 우선순위 (복수 선택)</label>
          <div className="chip-group">
            {['저렴한 비용', '안전성', '위치/교통', '공간 크기', '안정적 거주'].map(v => (
              <button key={v} className={`chip ${priorities.includes(v) ? 'selected' : ''}`}
                onClick={() => togglePriority(v)}>{v}</button>
            ))}
          </div>
        </div>

        <button className="loan-submit" onClick={submit} disabled={loading}>
          {loading ? 'AI 분석 중...' : '🔍 맞춤 추천 받기'}
        </button>

        {result && (
          <div className="loan-result">
            <div className="loan-result-title">🏠 AI 추천 결과</div>
            {result}
          </div>
        )}
      </div>
    </>
  );
}
