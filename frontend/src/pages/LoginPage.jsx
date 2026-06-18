import { useState } from 'react';

export default function LoginPage({ onLogin, onGoSignup }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    if (!id || !pw) { setErr('아이디와 비밀번호를 입력해주세요.'); return; }
    const users = JSON.parse(localStorage.getItem('kb_users') || '[]');
    const user = users.find(u => u.id === id && u.pw === pw);
    if (!user) { setErr('아이디 또는 비밀번호가 올바르지 않습니다.'); return; }
    localStorage.setItem('kb_current_user', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="auth-screen">
      <div className="auth-hero">
        <span className="auth-logo">🏠</span>
        <div className="auth-title">KB 부동산 가이드</div>
        <div className="auth-sub">처음 집 구할 때 든든한 파트너</div>
      </div>
      <div className="auth-body">
        {err && <div className="auth-err">{err}</div>}
        <label className="auth-label">아이디</label>
        <input className="auth-input" placeholder="아이디 입력" value={id}
          onChange={e => { setId(e.target.value); setErr(''); }} />
        <label className="auth-label">비밀번호</label>
        <input className="auth-input" type="password" placeholder="비밀번호 입력" value={pw}
          onChange={e => { setPw(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && submit()} />
        <button className="auth-btn" onClick={submit}>로그인</button>
        <div className="auth-switch">
          계정이 없으신가요?<span onClick={onGoSignup}>회원가입</span>
        </div>
      </div>
    </div>
  );
}
