import { useState } from 'react';
import api from '../api/api';

const localRecommend = (form, priorities) => {
  const savings = parseInt(form.savings) || 0;
  const income = parseInt(form.income) || 0;
  const period = parseInt(form.period) || 1;
  const wantOwn = form.wish === '예';

  let rec = '월세';
  if (savings >= 30000 && wantOwn) rec = '매매';
  else if (savings >= 5000 && period >= 2) rec = '전세';

  const map = {
    월세: {
      emoji: '🏠',
      reason: `현재 저축액(${savings}만원)과 거주 기간(${period}년)을 고려했을 때 월세가 적합합니다.`,
      pros: '초기 비용이 적고 이사가 자유로워 유연한 생활이 가능합니다.',
      cons: '매달 고정 지출이 발생하며 장기적으로는 전세보다 비용이 높을 수 있습니다.',
      tip: '월 소득의 30% 이하로 월세를 정하고, 전입신고와 확정일자를 꼭 받으세요!',
    },
    전세: {
      emoji: '🔑',
      reason: `저축액(${savings}만원)이 충분하고 거주 기간(${period}년)도 여유가 있어 전세가 유리합니다.`,
      pros: '월 고정 지출 없이 거주 가능하며 보증금을 돌려받을 수 있습니다.',
      cons: '목돈이 묶이고 전세 사기 리스크가 있으므로 보증보험 가입이 필수입니다.',
      tip: 'HUG 전세보증보험 가입 필수! 전세가율 80% 이하 물건만 노리세요.',
    },
    매매: {
      emoji: '🏡',
      reason: `충분한 자금(${savings}만원)과 내 집 마련 의향이 있어 매매가 적합합니다.`,
      pros: '자산 증식 효과가 있고 장기 거주 안정성이 높습니다.',
      cons: '취득세, 대출이자 등 초기 비용이 크고 유동성이 낮습니다.',
      tip: '실거래가 조회 후 주변 시세를 꼼꼼히 비교하고 대출 DSR 40% 이내로 계획하세요.',
    },
  };
  const r = map[rec];
  return `${r.emoji} 추천 유형: ${rec}\n\n📌 추천 이유\n${r.reason}\n\n✅ 장점\n${r.pros}\n\n⚠️ 단점\n${r.cons}\n\n💡 핵심 팁\n${r.tip}`;
};

export default function LoanPage({ onBack }) {
  const [form, setForm] = useState({ income: '', savings: '', period: '', household: '1인', wish: '모르겠음' });
  const [priorities, setPriorities] = useState([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const togglePriority = v => setPriorities(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const submit = async () => {
    if (!form.income || !form.savings || !form.period) {
      alert('월 소득, 저축액, 거주 기간을 입력해주세요.');
      return;
    }
    setLoading(true);
    setResult('');

    const prompt = `당신은 부동산 전문 상담사입니다. 아래 정보를 바탕으로 월세/전세/매매 중 가장 적합한 유형을 추천하고, 이유·장단점·주의사항을 친근하게 설명해주세요.

- 월 소득: ${form.income}만원
- 저축액: ${form.savings}만원
- 거주 기간: ${form.period}년
- 가구: ${form.household}
- 내 집 마련 희망: ${form.wish}
- 우선순위: ${priorities.length ? priorities.join(', ') : '없음'}

이모지를 활용해 명확하게 답변해주세요.`;

    try {
      const res = await api.post('/api/chat', { messages: [{ role: 'user', content: prompt }] });
      setResult(res.data.reply);
    } catch {
      setResult(localRecommend(form, priorities));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="page-header-info">
          <div className="page-header-title">맞춤 집 추천</div>
          <div className="page-header-sub">내 상황에 맞는 유형을 찾아드려요</div>
        </div>
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
