import { useState } from 'react';

export default function SignupPage({ onGoLogin }) {
  const [form, setForm] = useState({ name: '', email: '', birth: '', id: '', pw: '', pw2: '' });
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErr(''); };

  const submit = () => {
    const { name, email, birth, id, pw, pw2 } = form;
    if (!name || !email || !birth || !id || !pw || !pw2) { setErr('모든 항목을 입력해주세요.'); return; }
    if (pw !== pw2) { setErr('비밀번호가 일치하지 않습니다.'); return; }
    if (pw.length < 6) { setErr('비밀번호는 6자 이상이어야 합니다.'); return; }
    const users = JSON.parse(localStorage.getItem('kb_users') || '[]');
    if (users.find(u => u.id === id)) { setErr('이미 사용 중인 아이디입니다.'); return; }
    const newUser = { name, email, birth, id, pw };
    localStorage.setItem('kb_users', JSON.stringify([...users, newUser]));
    setDone(true);
  };

  if (done) return (
    <div className="auth-screen">
      <div className="auth-hero">
        <span className="auth-logo">🎉</span>
        <div className="auth-title">가입 완료!</div>
        <div className="auth-sub">{form.name}님, 환영합니다</div>
      </div>
      <div className="auth-body">
        <button className="auth-btn" onClick={onGoLogin}>로그인 하러 가기</button>
      </div>
    </div>
  );

  return (
    <div className="auth-screen">
      <div className="auth-hero" style={{ padding: '40px 32px 28px' }}>
        <span className="auth-logo" style={{ fontSize: 40, marginBottom: 8 }}>✍️</span>
        <div className="auth-title">회원가입</div>
        <div className="auth-sub">간단하게 가입하고 시작하세요</div>
      </div>
      <div className="auth-body">
        {err && <div className="auth-err">{err}</div>}
        <label className="auth-label">이름 *</label>
        <input className="auth-input" placeholder="이름 입력" value={form.name}
          onChange={e => set('name', e.target.value)} />
        <label className="auth-label">이메일 *</label>
        <input className="auth-input" type="email" placeholder="example@email.com" value={form.email}
          onChange={e => set('email', e.target.value)} />
        <label className="auth-label">생년월일 *</label>
        <input className="auth-input" type="date" value={form.birth}
          onChange={e => set('birth', e.target.value)} />
        <label className="auth-label">아이디 *</label>
        <input className="auth-input" placeholder="영문/숫자 4자 이상" value={form.id}
          onChange={e => set('id', e.target.value)} />
        <label className="auth-label">비밀번호 *</label>
        <input className="auth-input" type="password" placeholder="6자 이상" value={form.pw}
          onChange={e => set('pw', e.target.value)} />
        <label className="auth-label">비밀번호 확인 *</label>
        <input className="auth-input" type="password" placeholder="비밀번호 재입력" value={form.pw2}
          onChange={e => set('pw2', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()} />
        <button className="auth-btn" onClick={submit}>가입하기</button>
        <div className="auth-switch">
          이미 계정이 있으신가요?<span onClick={onGoLogin}>로그인</span>
        </div>
      </div>
    </div>
  );
}
