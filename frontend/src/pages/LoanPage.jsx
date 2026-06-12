import { useState } from 'react';
import api from '../api/api';

const initialForm = {
  monthlyIncome: '',
  savings: '',
  stayPeriod: '2~3년',
  household: '1인 가구',
  ownershipWish: '상관없음',
  priority: '가격 안정성',
};

const OPTIONS = {
  stayPeriod:    ['1년 미만', '1~2년', '2~3년', '3~5년', '5년 이상'],
  household:     ['1인 가구', '2인 가구', '3인 이상'],
  ownershipWish: ['꼭 내 집 갖고 싶다', '있으면 좋겠다', '상관없음', '자유롭게 살고 싶다'],
  priority:      ['가격 안정성', '이사 자유도', '내 집 마련', '월 지출 최소화'],
};

export default function LoanPage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    const prompt = `당신은 KB국민은행 부동산 전문 상담사입니다. 아래 고객 정보를 바탕으로 월세/전세/매매 중 가장 적합한 주거 유형을 추천해주세요.

[고객 정보]
- 월 소득: ${form.monthlyIncome}만원
- 현재 모은 돈(예산): ${form.savings}만원
- 거주 계획 기간: ${form.stayPeriod}
- 가구 유형: ${form.household}
- 내 집 소유 희망: ${form.ownershipWish}
- 우선순위: ${form.priority}

다음 형식으로 답변해주세요:
1. **추천 유형**: 월세/전세/매매 중 하나 (가장 적합한 것)
2. **추천 이유**: 3가지 이유 (bullet point)
3. **주의사항**: 2가지 (bullet point)
4. **KB 한마디**: 한 문장 조언

답변은 친근하고 이해하기 쉽게 한국어로 작성해주세요.`;

    try {
      const res = await api.post('/api/chat', {
        messages: [{ role: 'user', content: prompt }],
      });
      setResult(res.data.reply);
    } catch {
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') || line.match(/^\d\./)) {
        return <div key={i} className="result-section-title">{line.replace(/\*\*/g, '')}</div>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <div key={i} className="result-bullet">{line}</div>;
      }
      if (line.trim() === '') return <div key={i} style={{ height: '6px' }} />;
      return <div key={i} className="result-text">{line}</div>;
    });
  };

  return (
    <>
      <div className="top-bar">
        <span className="title">맞춤 집 추천</span>
      </div>

      <form onSubmit={handleSubmit} className="loan-form">
        <div className="housing-intro">
          <span className="housing-intro-icon">🏡</span>
          <p>내 상황에 딱 맞는 주거 유형을<br />AI가 분석해드려요</p>
        </div>

        <div className="form-row">
          <label className="form-label">월 소득 (만원)</label>
          <input
            className="form-input"
            name="monthlyIncome"
            type="number"
            placeholder="예) 300"
            value={form.monthlyIncome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label className="form-label">현재 모은 돈 (만원)</label>
          <input
            className="form-input"
            name="savings"
            type="number"
            placeholder="예) 5000"
            value={form.savings}
            onChange={handleChange}
            required
          />
        </div>

        {[
          { name: 'stayPeriod',    label: '거주 계획 기간' },
          { name: 'household',     label: '가구 유형' },
          { name: 'ownershipWish', label: '내 집 소유 희망' },
          { name: 'priority',      label: '가장 중요한 것' },
        ].map(f => (
          <div key={f.name} className="form-row">
            <label className="form-label">{f.label}</label>
            <div className="option-chips">
              {OPTIONS[f.name].map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`chip ${form[f.name] === opt ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, [f.name]: opt })}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? '🤖 AI 분석 중...' : '맞춤 추천 받기 →'}
        </button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      {result && (
        <div className="housing-result">
          <div className="housing-result-header">
            <span>🏡</span>
            <span>AI 맞춤 추천 결과</span>
          </div>
          <div className="housing-result-body">
            {renderResult(result)}
          </div>
        </div>
      )}
    </>
  );
}
