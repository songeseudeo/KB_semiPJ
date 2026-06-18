import { TERMS_DATA } from '../data/checklistData';

export default function TermsPage({ onBack }) {
  return (
    <>
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="page-header-info">
          <div className="page-header-title">부동산 용어 가이드</div>
          <div className="page-header-sub">꼭 알아야 할 핵심 용어 정리</div>
        </div>
      </div>
      <div className="terms-body">
        {TERMS_DATA.map((term, i) => (
          <div key={i} className="term-card">
            <div className="term-icon">{term.icon}</div>
            <div>
              <div className="term-title">{term.t}</div>
              <div className="term-desc">{term.d}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
