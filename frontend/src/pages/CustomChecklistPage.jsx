import { useState } from 'react';
import api from '../api/api';

const fmt = (won) => {
  if (!won || won === 0) return '0';
  if (won >= 10000) return `${Math.floor(won / 10000)}억 ${won % 10000 > 0 ? (won % 10000) + '만' : ''}`;
  return `${won}만`;
};

const fallback = (region, tradeType, budget, priceData) => ({
  steps: [
    {
      step: "1단계: 예산 및 시세 확인",
      items: [
        { t: `${region} ${tradeType} 시세 파악`, d: priceData?.found ? `평균 ${fmt(priceData.avgPrice)}만원 (${priceData.count}건 거래)` : "실거래가 공개시스템에서 최근 시세 확인", tag: "important" },
        { t: "예산 대비 적정 물건 기준 설정", d: `예산 ${budget || '?'}만원 기준으로 가능한 면적·층수 파악`, tag: "tip" },
        { t: "추가 비용 계산", d: tradeType === "매매" ? "취득세(1~3%) + 중개수수료 + 이사비" : "중개수수료 + 이사비 + 관리비 예상", tag: "tip" },
      ]
    },
    {
      step: "2단계: 매물 탐색",
      items: [
        { t: `${region} 선호 동네 2~3곳 후보 선정`, d: "직장·학교·편의시설 접근성 비교", tag: "tip" },
        { t: "공인중개사 방문 및 매물 확인", d: "자격증 확인, 최소 2~3곳 이상 비교", tag: "important" },
        { t: "직접 방문 시 체크", d: "채광·소음·결로·누수·곰팡이·주차 확인", tag: "important" },
      ]
    },
    {
      step: "3단계: 서류 확인",
      items: [
        { t: "등기부등본 발급 및 확인", d: "인터넷등기소(700원) — 근저당·압류·가압류 확인", tag: "important" },
        { t: "건축물대장 확인", d: "불법 건축물·위반건축물 여부", tag: "legal" },
        { t: tradeType === "전세" ? "전세가율 확인 (80% 이하)" : tradeType === "매매" ? "실거래가 대비 적정 가격 확인" : "보증금 안전성 확인", d: tradeType === "전세" ? `${region} 매매가 대비 전세가 비율 확인 필수` : "국토부 실거래가 시스템 교차 확인", tag: "important" },
      ]
    },
    {
      step: "4단계: 계약 및 입주",
      items: [
        { t: "계약서 특약사항 기재", d: "수리 책임·퇴거 조건·선순위 채권 변동 금지 명시", tag: "legal" },
        { t: "이사 당일 전입신고 + 확정일자", d: `${region} 주민센터 또는 정부24에서 당일 처리`, tag: "important" },
        { t: tradeType === "전세" ? "HUG 전세보증보험 가입" : tradeType === "매매" ? "소유권이전등기 신청" : "월세 계약서 사본 보관", d: tradeType === "전세" ? "이사 후 1개월 이내 가입 필수" : tradeType === "매매" ? "잔금일 법무사를 통해 즉시 신청" : "분실 대비 사진 찍어 보관", tag: "legal" },
      ]
    }
  ]
});

export default function CustomChecklistPage({ onBack, onSave }) {
  const [region, setRegion] = useState('');
  const [tradeType, setTradeType] = useState('전세');
  const [budget, setBudget] = useState('');
  const [listName, setListName] = useState('');
  const [priceData, setPriceData] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [step, setStep] = useState(1);
  const [priceLoading, setPriceLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchPrice = async () => {
    if (!region.trim()) { alert('지역을 입력해주세요 (예: 강남구, 수원시)'); return; }
    setPriceLoading(true);
    try {
      const res = await api.get('/api/realestate/price', { params: { region: region.trim(), tradeType } });
      setPriceData(res.data);
    } catch {
      setPriceData({ found: false, message: '시세 조회 실패. AI로 체크리스트만 생성합니다.' });
    } finally {
      setPriceLoading(false);
      setStep(2);
    }
  };

  const generateChecklist = async () => {
    setAiLoading(true);
    const priceCtx = priceData?.found
      ? `${priceData.district} 최근 ${tradeType} 평균: ${fmt(priceData.avgPrice)}만원 (거래 ${priceData.count}건, 최저 ${fmt(priceData.minPrice)}~최고 ${fmt(priceData.maxPrice)}만원)`
      : '시세 데이터 없음';

    const prompt = `다음 조건에 맞는 맞춤 부동산 체크리스트를 JSON 형식으로만 출력하세요. 다른 설명 없이 JSON만 출력합니다.

조건:
- 지역: ${region}
- 거래유형: ${tradeType}
- 예산: ${budget || '미입력'}만원
- 시세: ${priceCtx}

JSON 형식 (4단계, 각 3개 항목):
{"steps":[{"step":"1단계: 단계명","items":[{"t":"항목명","d":"지역·예산·시세 반영한 설명","tag":"important"}]}]}

tag는 important/tip/legal 중 하나. 반드시 지역과 시세를 반영하세요.`;

    try {
      const res = await api.post('/api/chat', { messages: [{ role: 'user', content: prompt }] });
      const match = res.data.reply.match(/\{[\s\S]*\}/);
      setChecklist(match ? JSON.parse(match[0]) : fallback(region, tradeType, budget, priceData));
    } catch {
      setChecklist(fallback(region, tradeType, budget, priceData));
    } finally {
      setAiLoading(false);
      setStep(3);
    }
  };

  const save = () => {
    const name = listName.trim() || `${region} ${tradeType} 체크리스트`;
    onSave({
      id: Date.now(),
      name,
      addr: region,
      type: tradeType,
      budget,
      date: new Date().toLocaleDateString('ko-KR'),
      isCustom: true,
      customSteps: checklist.steps,
      customStates: {},
      priceInfo: priceData?.found ? { avg: priceData.avgPrice, min: priceData.minPrice, max: priceData.maxPrice, count: priceData.count } : null,
    });
  };

  const TAG_LABELS = { important: '⚠️ 중요', tip: '💡 팁', legal: '⚖️ 법률' };

  return (
    <>
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="page-header-info">
          <div className="page-header-title">맞춤 체크리스트 만들기</div>
          <div className="page-header-sub">지역·시세 기반 AI 생성</div>
        </div>
      </div>

      <div className="loan-body">
        {/* STEP 1: 입력 */}
        <div className="custom-step-box">
          <div className="custom-step-label">① 기본 정보 입력</div>
          <div className="loan-form-group">
            <label className="loan-label">📍 지역</label>
            <input className="loan-input" placeholder="예: 역삼동, 강남구, 수원시, 해운대구"
              value={region} onChange={e => { setRegion(e.target.value); setStep(1); setPriceData(null); setChecklist(null); }} />
          </div>
          <div className="loan-form-group">
            <label className="loan-label">🏠 거래 유형</label>
            <div className="chip-group">
              {['월세', '전세', '매매'].map(t => (
                <button key={t} className={`chip ${tradeType === t ? 'selected' : ''}`}
                  onClick={() => { setTradeType(t); setStep(1); setPriceData(null); setChecklist(null); }}>{t}</button>
              ))}
            </div>
          </div>
          <div className="loan-form-group">
            <label className="loan-label">💰 예산 (만원, 선택)</label>
            <input className="loan-input" type="number" placeholder="예: 30000"
              value={budget} onChange={e => setBudget(e.target.value)} />
          </div>
          <button className="loan-submit" onClick={fetchPrice} disabled={priceLoading}>
            {priceLoading ? '시세 조회 중...' : '📊 시세 조회하기'}
          </button>
        </div>

        {/* STEP 2: 시세 결과 */}
        {step >= 2 && priceData && (
          <div className="price-result-box">
            {priceData.found ? (
              <>
                <div className="price-result-title">📊 {priceData.district} {tradeType} 최근 시세</div>
                <div className="price-stats">
                  <div className="price-stat">
                    <span className="ps-label">평균</span>
                    <span className="ps-value">{fmt(priceData.avgPrice)}만원</span>
                  </div>
                  <div className="price-stat">
                    <span className="ps-label">최저</span>
                    <span className="ps-value">{fmt(priceData.minPrice)}만원</span>
                  </div>
                  <div className="price-stat">
                    <span className="ps-label">최고</span>
                    <span className="ps-value">{fmt(priceData.maxPrice)}만원</span>
                  </div>
                </div>
                <div className="price-meta">
                  {priceData.yearMonth.slice(0,4)}년 {parseInt(priceData.yearMonth.slice(4))}월 기준 · {priceData.count}건 거래
                  {budget && priceData.avgPrice > 0 && (
                    <span className={`budget-tag ${parseInt(budget) >= priceData.avgPrice ? 'ok' : 'warn'}`}>
                      {parseInt(budget) >= priceData.avgPrice ? '✅ 예산 충분' : '⚠️ 예산 부족'}
                    </span>
                  )}
                </div>
                {priceData.samples?.slice(0,2).map((s, i) => (
                  <div key={i} className="price-sample">
                    🏢 {s.아파트 || '아파트'} {s.전용면적 ? `${parseFloat(s.전용면적).toFixed(0)}㎡` : ''} — {fmt(parsePrice(s.거래금액))}만원
                  </div>
                ))}
              </>
            ) : (
              <div className="price-not-found">⚠️ {priceData.message}</div>
            )}
            <button className="loan-submit" style={{ marginTop: 16 }}
              onClick={generateChecklist} disabled={aiLoading}>
              {aiLoading ? 'AI 체크리스트 생성 중...' : '✨ 맞춤 체크리스트 생성'}
            </button>
          </div>
        )}

        {/* STEP 3: AI 체크리스트 */}
        {step >= 3 && checklist && (
          <div className="custom-checklist-preview">
            <div className="price-result-title">✨ AI 맞춤 체크리스트 미리보기</div>
            {checklist.steps.map((s, si) => (
              <div key={si} className="step-section">
                <div className="step-header">
                  <div className="step-num">{si + 1}</div>
                  <div className="step-title">{s.step.replace(/^\d+단계: /, '')}</div>
                </div>
                {s.items.map((item, ii) => (
                  <div key={ii} className="check-item" style={{ cursor: 'default' }}>
                    <div className="ci-box" />
                    <div className="ci-content">
                      <div className="ci-title">{item.t}</div>
                      <div className="ci-desc">{item.d}</div>
                      {item.tag && <span className={`ci-tag ${item.tag}`}>{TAG_LABELS[item.tag]}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div className="loan-form-group" style={{ marginTop: 16 }}>
              <label className="loan-label">📝 목록 이름 (선택)</label>
              <input className="loan-input" placeholder={`${region} ${tradeType} 체크리스트`}
                value={listName} onChange={e => setListName(e.target.value)} />
            </div>
            <button className="loan-submit" onClick={save}>💾 내 목록에 저장하기</button>
          </div>
        )}
      </div>
    </>
  );
}

function parsePrice(s) {
  try { return parseInt(s.replace(/[^0-9]/g, '')) || 0; } catch { return 0; }
}
