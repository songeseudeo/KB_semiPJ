import { useState } from 'react';
import api from '../api/api';

const initialForm = {
  annualIncome: '', totalAssets: '', totalDebt: '',
  creditScore: '', employmentType: '정규직', tradeType: '전세', targetPrice: '',
};

export default function LoanPage() {
  const [form, setForm] = useState(initialForm);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/loan/recommend', {
        ...form,
        annualIncome: Number(form.annualIncome),
        totalAssets: Number(form.totalAssets),
        totalDebt: Number(form.totalDebt),
        creditScore: Number(form.creditScore),
        targetPrice: Number(form.targetPrice),
      });
      setResults(res.data);
    } catch {
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="top-bar">
        <span className="title">대출 추천</span>
      </div>

      <form onSubmit={handleSubmit} className="loan-form">
        {[
          { name: 'annualIncome', label: '연소득 (만원)' },
          { name: 'totalAssets',  label: '총 자산 (만원)' },
          { name: 'totalDebt',    label: '총 부채 (만원)' },
          { name: 'creditScore',  label: '신용점수 (0~1000)' },
          { name: 'targetPrice',  label: '목표 금액 (만원)' },
        ].map(f => (
          <div key={f.name} className="form-row">
            <div className="form-label">{f.label}</div>
            <input className="form-input" name={f.name} type="number" value={form[f.name]} onChange={handleChange} required />
          </div>
        ))}
        <div className="form-row">
          <div className="form-label">직장 유형</div>
          <select className="form-input" name="employmentType" value={form.employmentType} onChange={handleChange}>
            {['정규직','계약직','자영업','무직'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-label">거래 유형</div>
          <select className="form-input" name="tradeType" value={form.tradeType} onChange={handleChange}>
            {['월세','전세','매매'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? '분석 중...' : '대출 추천 받기'}
        </button>
      </form>

      {results && (
        <div className="loan-results">
          <h3>추천 대출 상품 {results.length}개</h3>
          {results.map((r, i) => (
            <div key={i} className="loan-card">
              <div className="loan-card-header">
                <h4>{r.productName}</h4>
                <span className="match-score">적합도 {r.matchScore}%</span>
              </div>
              <p><b>종류:</b> {r.loanType}</p>
              <p><b>금리:</b> {r.interestRate}</p>
              <p><b>최대 대출:</b> {r.maxLoanAmount.toLocaleString()}만원</p>
              <p><b>자격:</b> {r.eligibility}</p>
              <p className="desc">{r.description}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
