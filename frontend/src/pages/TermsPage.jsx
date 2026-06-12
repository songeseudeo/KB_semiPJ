import { TERMS_DATA } from '../data/checklistData';

export default function TermsPage({ onBack }) {
  return (
    <>
      <div className="terms-header">
        <button className="terms-back-btn" onClick={onBack}>←</button>
        <div className="terms-header-title">부동산 용어 가이드</div>
      </div>

      <div className="terms-body">
        {TERMS_DATA.map((term, i) => (
          <div key={i} className="term-card">
            <div className="term-icon">{term.icon}</div>
            <div className="term-content">
              <div className="term-title">{term.t}</div>
              <div className="term-desc">{term.d}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
