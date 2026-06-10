// ═══════════════════════════════════════════════════════════
//  KB 부동산 가이드 — app.js
// ═══════════════════════════════════════════════════════════

// ── 상태 ──────────────────────────────────────────────────
let savedLists    = JSON.parse(localStorage.getItem('kb_lists') || '[]');
let checkStates   = JSON.parse(localStorage.getItem('kb_states') || '{}');
let selectedType  = '월세';
let selectedModalType = '월세';
let screenHistory = ['screen-home'];

// ── 화면 전환 ──────────────────────────────────────────────
function goScreen(id) {
  const current = screenHistory[screenHistory.length - 1];

  document.getElementById(current)?.classList.add('prev');
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  setTimeout(() => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('prev'));
  }, 340);

  document.getElementById(id).classList.add('active');
  screenHistory.push(id);

  // 화면별 렌더링
  if (id === 'screen-guide')    renderGuide();
  if (id === 'screen-mylist')   renderMyList();
  if (id === 'screen-checklist') renderChecklist(selectedType);
}

function goBack() {
  screenHistory.pop();
  const prev = screenHistory[screenHistory.length - 1] || 'screen-home';
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'prev'));
  document.getElementById(prev).classList.add('active');
}

// ── 하단 네비게이션 ───────────────────────────────────────
function switchNav(tab) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('nav-' + tab).classList.add('active');

  const map = {
    home:      'screen-home',
    checklist: 'screen-checklist',
    mylist:    'screen-mylist',
    chat:      'screen-chat',
  };

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'prev'));
  document.getElementById(map[tab]).classList.add('active');
  screenHistory = ['screen-home', map[tab]];

  if (tab === 'mylist')    renderMyList();
  if (tab === 'checklist') renderChecklist(selectedType);
}

// ── 체크리스트 타입 이동 ──────────────────────────────────
function goChecklist(type) {
  selectedType = type;
  document.querySelectorAll('.clt-tab').forEach((t, i) => {
    t.classList.toggle('active', ['월세', '전세', '매매'][i] === type);
  });
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('nav-checklist').classList.add('active');
  goScreen('screen-checklist');
}

function switchType(type, el) {
  selectedType = type;
  if (el) {
    document.querySelectorAll('.clt-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
  }
  renderChecklist(type);
}

// ── 체크리스트 렌더링 ────────────────────────────────────
function renderChecklist(type) {
  if (!checkStates[type]) checkStates[type] = {};

  const steps = CHECKLIST_DATA[type];
  let total = 0, done = 0;

  steps.forEach(s => s.items.forEach(() => total++));
  Object.values(checkStates[type]).forEach(v => { if (v) done++; });

  document.getElementById('progress-text').textContent = `${done} / ${total}`;
  document.getElementById('progress-fill').style.width =
    total ? `${Math.round(done / total * 100)}%` : '0%';

  const tagMap   = { important: 'tag-important', tip: 'tag-tip', legal: 'tag-legal' };
  const tagLabel = { important: '⚠️ 중요',       tip: '💡 팁',   legal: '⚖️ 법률'   };

  let html = '';
  steps.forEach((s, si) => {
    const sDone  = s.items.filter((_, ii) => checkStates[type][`${si}_${ii}`]).length;
    const allDone = sDone === s.items.length;

    html += `
      <div class="step-section">
        <div class="step-header">
          <div class="step-num">${si + 1}</div>
          <div class="step-title">${s.step}</div>
          <div class="step-badge ${allDone ? 'done' : 'ing'}">${allDone ? '완료' : '진행중'}</div>
        </div>`;

    s.items.forEach((item, ii) => {
      const ck = checkStates[type][`${si}_${ii}`] ? 'checked' : '';
      html += `
        <div class="check-item ${ck}" onclick="toggleCheck('${type}',${si},${ii})">
          <div class="ci-box"><span class="ci-check">✓</span></div>
          <div class="ci-content">
            <div class="ci-title">${item.t}</div>
            <div class="ci-desc">${item.d}</div>
            <span class="ci-tag ${tagMap[item.tag]}">${tagLabel[item.tag]}</span>
          </div>
        </div>`;
    });

    html += '</div>';
  });

  document.getElementById('checklist-content').innerHTML = html;
}

function toggleCheck(type, si, ii) {
  if (!checkStates[type]) checkStates[type] = {};
  checkStates[type][`${si}_${ii}`] = !checkStates[type][`${si}_${ii}`];
  saveStates();
  renderChecklist(type);
}

// ── 내 목록 렌더링 ───────────────────────────────────────
function renderMyList() {
  const el = document.getElementById('mylist-content');
  const recentEl = document.getElementById('recent-list');

  if (!savedLists.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">📋</div>
        <div class="es-title">저장된 체크리스트가 없어요</div>
        <div class="es-desc">새 목록을 만들어<br>부동산 거래를 단계별로 준비해보세요!</div>
        <br>
        <button class="submit-btn" style="width:auto;padding:12px 28px;margin:0 auto;display:block"
          onclick="showCreateModal()">+ 새 목록 만들기</button>
      </div>`;
    recentEl.innerHTML = '';
    return;
  }

  const badgeMap = { 월세: 'badge-monthly', 전세: 'badge-jeonse', 매매: 'badge-buy' };

  const cardHTML = (l, i) => `
    <div class="my-list-card" onclick="openSavedList(${i})">
      <div class="mlc-header">
        <div class="mlc-title">${l.name}</div>
        <div class="mlc-badge ${badgeMap[l.type]}">${l.type}</div>
      </div>
      <div class="mlc-date">📅 ${l.date}</div>
      <div class="mlc-progress">
        <div class="mlc-prog-fill" style="width:${l.progress}%"></div>
      </div>
      <div class="mlc-stat">완료 <span>${l.done}</span> / 전체 ${l.total} 항목 · ${l.progress}%</div>
    </div>`;

  el.innerHTML = savedLists.map((l, i) => cardHTML(l, i)).join('');
  recentEl.innerHTML = savedLists.slice(0, 2).map((l, i) => cardHTML(l, i)).join('');
}

function openSavedList(i) {
  const l = savedLists[i];
  selectedType = l.type;
  document.querySelectorAll('.clt-tab').forEach((t, idx) => {
    t.classList.toggle('active', ['월세', '전세', '매매'][idx] === l.type);
  });
  goScreen('screen-checklist');
  renderChecklist(l.type);
}

// ── 용어 가이드 렌더링 ───────────────────────────────────
function renderGuide() {
  document.getElementById('guide-content').innerHTML =
    TERMS_DATA.map(t => `
      <div class="term-card">
        <div class="term-header">
          <span class="term-icon">${t.icon}</span>
          <span class="term-name">${t.t}</span>
        </div>
        <div class="term-desc">${t.d}</div>
      </div>`).join('');
}

// ── 모달 ────────────────────────────────────────────────
function showCreateModal() {
  document.getElementById('create-modal').classList.add('open');
}

function closeModal() {
  document.getElementById('create-modal').classList.remove('open');
}

function selectModalType(t) {
  selectedModalType = t;
  ['월세', '전세', '매매'].forEach(x =>
    document.getElementById('ts-' + x).classList.toggle('sel', x === t)
  );
}

function createChecklist() {
  const name  = document.getElementById('form-name').value.trim()  || '새 체크리스트';
  const addr  = document.getElementById('form-addr').value.trim();
  const price = document.getElementById('form-price').value.trim();
  const type  = selectedModalType;
  const total = CHECKLIST_DATA[type].reduce((a, s) => a + s.items.length, 0);

  const now  = new Date();
  const date = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;

  savedLists.unshift({ name, type, addr, price, date, done: 0, total, progress: 0 });
  saveLists();

  closeModal();
  ['form-name', 'form-addr', 'form-price'].forEach(id => {
    document.getElementById(id).value = '';
  });

  goChecklist(type);
}

// ── 챗봇 ────────────────────────────────────────────────
function sendChat() {
  const input = document.getElementById('chat-input');
  const q = input.value.trim();
  if (!q) return;
  input.value = '';
  addChatMsg(q, 'user');
  hideSuggestions();
  setTimeout(() => addChatMsg(getAnswer(q), 'bot'), 650);
}

function askQuestion(q) {
  addChatMsg(q, 'user');
  hideSuggestions();
  setTimeout(() => addChatMsg(getAnswer(q), 'bot'), 650);
}

function hideSuggestions() {
  document.getElementById('chat-suggestions').style.display = 'none';
}

function getAnswer(q) {
  if (CHAT_ANSWERS[q]) return CHAT_ANSWERS[q];

  const lower = q.toLowerCase();
  if (lower.includes('월세') || lower.includes('전세'))
    return '월세·전세 관련 자세한 내용은 체크리스트 화면에서 확인하실 수 있어요! 📋\n\n궁금한 내용을 더 구체적으로 물어봐 주시면 도움드릴게요 😊';
  if (lower.includes('대출'))
    return '부동산 대출의 경우 주택담보대출(LTV), 전세자금대출, 청년버팀목전세대출 등 다양한 상품이 있어요.\n\n현재 소득과 자산 조건에 맞는 상품을 은행 상담을 통해 알아보시길 추천드려요! 💳';
  if (lower.includes('계약'))
    return '계약 시 가장 중요한 것은 등기부등본 확인과 확정일자 받기입니다!\n\n체크리스트에서 계약 단계를 단계별로 확인해보세요 ✅';

  return '궁금한 내용을 더 구체적으로 입력해주시면 더 정확한 답변을 드릴 수 있어요! 😊\n\n아래 자주 묻는 질문도 참고해보세요.';
}

function addChatMsg(text, role) {
  const msgs = document.getElementById('chat-messages');
  const wrap = document.createElement('div');
  wrap.className = `chat-row ${role}`;

  if (role === 'bot') {
    wrap.innerHTML = `
      <div class="chat-bot-name">KB 부동산 AI</div>
      <div class="chat-bubble bot">${text.replace(/\n/g, '<br>')}</div>`;
  } else {
    wrap.innerHTML = `<div class="chat-bubble user">${text}</div>`;
  }

  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
}

// ── localStorage 저장 ─────────────────────────────────────
function saveLists() {
  try { localStorage.setItem('kb_lists', JSON.stringify(savedLists)); } catch(e) {}
}

function saveStates() {
  try { localStorage.setItem('kb_states', JSON.stringify(checkStates)); } catch(e) {}
}

// ── 초기 렌더링 ───────────────────────────────────────────
(function init() {
  renderMyList();
  renderChecklist('월세');
  renderGuide();
})();
