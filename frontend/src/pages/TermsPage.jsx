const TERMS = [
  { icon: '📜', t: '등기부등본',        d: '부동산의 소유자, 근저당, 압류 등 권리관계를 기록한 공문서. 계약 전 반드시 확인해야 합니다.' },
  { icon: '📊', t: '전세가율',          d: '매매가 대비 전세 보증금 비율. 80% 이상이면 역전세 위험이 있습니다.' },
  { icon: '🗓️', t: '확정일자',         d: '임대차 계약서에 날짜를 확인해주는 도장. 전입신고와 함께 보증금 보호의 기본입니다.' },
  { icon: '🛡️', t: '대항력',          d: '집이 팔려도 세입자가 계속 살 수 있는 권리. 전입신고 + 실제 거주로 발생합니다.' },
  { icon: '🏦', t: '근저당',            d: '집을 담보로 설정한 대출. 등기부등본에서 확인 가능하며, 경매 시 먼저 변제됩니다.' },
  { icon: '💳', t: 'DSR',             d: '총부채원리금상환비율. 연 소득 대비 모든 대출의 원리금 비율로 대출 가능 한도를 제한합니다.' },
  { icon: '🏠', t: 'LTV',             d: '주택담보대출비율. 집값 대비 빌릴 수 있는 최대 대출 비율입니다.' },
  { icon: '✅', t: 'HUG 전세보증보험', d: '주택도시보증공사에서 운영하는 전세보증금 반환 보험. 집주인이 돌려주지 않을 때 HUG가 대신 지급합니다.' },
  { icon: '💰', t: '취득세',           d: '부동산 취득 시 내는 세금. 보통 매매가의 1~3% 수준입니다.' },
  { icon: '🏢', t: '건축물대장',       d: '건물의 용도, 구조, 면적 등을 기록한 공문서. 불법 건축물 여부 확인에 사용됩니다.' },
];

export default function TermsPage({ onBack }) {
  return (
    <>
      <div className="top-bar">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="title">부동산 용어 가이드</span>
      </div>

      <div style={{ padding: '12px 16px 20px' }}>
        {TERMS.map((term) => (
          <div key={term.t} className="term-card">
            <div className="term-header">
              <span className="term-icon">{term.icon}</span>
              <span className="term-name">{term.t}</span>
            </div>
            <p className="term-desc">{term.d}</p>
          </div>
        ))}
      </div>
    </>
  );
}
