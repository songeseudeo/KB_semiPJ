export default function HomePage({ onNavigate }) {
  return (
    <>
      <div className="home-header">
        <div className="home-hero">
          <span className="hero-icon">🏦</span>
          <div className="hero-tagline">KB 부동산<br />스마트 가이드</div>
        </div>
      </div>

      <div className="notice-banner">
        <span className="nb-icon">📢</span>
        <div className="nb-text">
          <strong>전세 사기 주의!</strong> 계약 전 등기부등본 확인과 확정일자 신청을 꼭 하세요.
        </div>
      </div>

      <div className="section-title">거래 유형 선택</div>
      <div className="type-cards">
        {[
          { icon: '🏠', name: '월세', sub: '매달 월세 납부' },
          { icon: '🔑', name: '전세', sub: '보증금 거치' },
          { icon: '🏡', name: '매매', sub: '내 집 마련' },
        ].map(t => (
          <div key={t.name} className="type-card" onClick={() => onNavigate('checklist')}>
            <div className="tc-icon">{t.icon}</div>
            <div className="tc-name">{t.name}</div>
            <div className="tc-sub">{t.sub}</div>
          </div>
        ))}
      </div>

      <div className="section-title">빠른 메뉴</div>
      <div className="quick-btns">
        <div className="quick-btn" onClick={() => onNavigate('loan')}>
          <div className="qb-icon">💰</div>
          <div className="qb-text">
            <div className="t1">대출 추천</div>
            <div className="t2">자산 기반 맞춤 추천</div>
          </div>
        </div>
        <div className="quick-btn" onClick={() => onNavigate('chat')}>
          <div className="qb-icon">🤖</div>
          <div className="qb-text">
            <div className="t1">AI 상담</div>
            <div className="t2">부동산 궁금증 해결</div>
          </div>
        </div>
      </div>
    </>
  );
}
