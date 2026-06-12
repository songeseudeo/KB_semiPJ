export default function HomePage({ onNavigate, onGoChecklist }) {
  const tips = [
    '계약 전 등기부등본은 반드시 확인하세요!',
    '전세가율 80% 이상이면 위험 신호입니다.',
    '확정일자와 전입신고는 이사 당일 처리하세요.',
    'HUG 전세보증보험으로 보증금을 보호하세요.',
  ];
  const tip = tips[new Date().getDate() % tips.length];

  return (
    <>
      <div className="home-header">
        <div className="home-hero">
          <span className="hero-icon">🏦</span>
          <div>
            <div className="hero-tagline">KB 부동산<br />스마트 가이드</div>
            <div className="hero-sub">처음 집 구할 때 뭐부터 해야 할까?</div>
          </div>
        </div>
      </div>

      <div className="notice-banner">
        <span className="nb-icon">💡</span>
        <div className="nb-text">
          <strong>오늘의 팁</strong><br />{tip}
        </div>
      </div>

      <div className="section-title">거래 유형 선택</div>
      <div className="type-cards">
        {[
          { icon: '🏠', name: '월세', sub: '매달 월세 납부' },
          { icon: '🔑', name: '전세', sub: '목돈 보증금' },
          { icon: '🏡', name: '매매', sub: '내 집 마련' },
        ].map(t => (
          <div key={t.name} className="type-card" onClick={() => onGoChecklist(t.name)}>
            <div className="tc-icon">{t.icon}</div>
            <div className="tc-name">{t.name}</div>
            <div className="tc-sub">{t.sub}</div>
          </div>
        ))}
      </div>

      <div className="section-title">빠른 메뉴</div>
      <div className="quick-btns">
        <div className="quick-btn" onClick={() => onNavigate('checklist')}>
          <div className="qb-icon">✅</div>
          <div className="qb-text">
            <div className="t1">체크리스트</div>
            <div className="t2">계약 전 확인사항</div>
          </div>
        </div>
        <div className="quick-btn" onClick={() => onNavigate('loan')}>
          <div className="qb-icon">🏡</div>
          <div className="qb-text">
            <div className="t1">맞춤 집 추천</div>
            <div className="t2">내 상황에 맞는 유형 분석</div>
          </div>
        </div>
        <div className="quick-btn" onClick={() => onNavigate('chat')}>
          <div className="qb-icon">🤖</div>
          <div className="qb-text">
            <div className="t1">AI 상담</div>
            <div className="t2">부동산 궁금증 해결</div>
          </div>
        </div>
        <div className="quick-btn" onClick={() => onNavigate('terms')}>
          <div className="qb-icon">📖</div>
          <div className="qb-text">
            <div className="t1">용어 가이드</div>
            <div className="t2">어려운 용어 정리</div>
          </div>
        </div>
      </div>

      <div className="section-title">꼭 알아야 할 체크포인트</div>
      <div className="tip-cards">
        <div className="tip-card red">
          <span className="tip-tag">주의</span>
          <p>등기부등본에서 근저당·압류를 꼭 확인하세요</p>
        </div>
        <div className="tip-card blue">
          <span className="tip-tag">필수</span>
          <p>이사 당일 전입신고 + 확정일자 동시 처리</p>
        </div>
        <div className="tip-card green">
          <span className="tip-tag">보호</span>
          <p>HUG 전세보증보험으로 보증금을 지키세요</p>
        </div>
      </div>
    </>
  );
}
