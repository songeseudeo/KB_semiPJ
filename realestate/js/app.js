// ═══════════════════════════════════════════════════════════
//  KB 부동산 가이드 — app.js
//  데이터 저장: API → data/db.json
// ═══════════════════════════════════════════════════════════

// ── 상태 ──────────────────────────────────────────────────
let savedLists        = [];      // 서버에서 불러온 목록
let checkStates       = {};      // { listId: { "0_0": true, ... } }
let currentListId     = null;    // 현재 열려있는 목록 id
let selectedType      = '월세';
let selectedModalType = '월세';
let screenHistory     = ['screen-home'];

// ── API 헬퍼 ──────────────────────────────────────────────
const API = {
  async get(url) {
    const r = await fetch(url);
    return r.json();
  },
  async post(url, body) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return r.json();
  },
  async put(url, body) {
    const r = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return r.json();
  },
  async delete(url) {
    const r = await fetch(url, { method: 'DELETE' });
    return r.json();
  },
};

// ── 화면 전환 ──────────────────────────────────────────────
function goScreen(id) {
  const current = screenHistory[screenHistory.length - 1];
  document.getElementById(current)?.classList.add('prev');
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  setTimeout(() => document.querySelectorAll('.screen').forEach(s => s.classList.remove('prev')), 340);

  document.getElementById(id).classList.add('active');
  screenHistory.push(id);

  if (id === 'screen-guide')    renderGuide();
  if (id === 'screen-mylist')   loadAndRenderMyList();
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
  const map = { home:'screen-home', checklist:'screen-checklist', mylist:'screen-mylist', chat:'screen-chat' };
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'prev'));
  document.getElementById(map[tab]).classList.add('active');
  screenHistory = ['screen-home', map[tab]];

  if (tab === 'mylist')    loadAndRenderMyList();
  if (tab === 'checklist') renderChecklist(selectedType);
}

// ── 체크리스트 타입 이동 ──────────────────────────────────
function goChecklist(type) {
  selectedType = type;
  currentListId = null; // 새 탐색 시 목록 id 초기화
  document.querySelectorAll('.clt-tab').forEach((t, i) => {
    t.classList.toggle('active', ['월세','전세','매매'][i] === type);
  });
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('nav-checklist').classList.add('active');
  goScreen('screen-checklist');
}

function switchType(type, el) {
  selectedType = type;
  // 저장된 목록을 보던 중 다른 탭으로 이동하면 목록 연결 해제
  if (currentListId && savedLists.find(l => l.id === currentListId)?.type !== type) {
    currentListId = null;
  }
  if (el) {
    document.querySelectorAll('.clt-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
  }
  renderChecklist(type);
}

// ── 체크리스트 렌더링 ────────────────────────────────────
function renderChecklist(type) {
  const states = currentListId ? (checkStates[currentListId] || {}) : {};
  const steps  = CHECKLIST_DATA[type];
  let total = 0, done = 0;

  steps.forEach(s => s.items.forEach(() => total++));
  Object.values(states).forEach(v => { if (v) done++; });

  document.getElementById('progress-text').textContent = `${done} / ${total}`;
  document.getElementById('progress-fill').style.width = total ? `${Math.round(done/total*100)}%` : '0%';

  const tagMap   = { important:'tag-important', tip:'tag-tip', legal:'tag-legal' };
  const tagLabel = { important:'⚠️ 중요',       tip:'💡 팁',   legal:'⚖️ 법률' };

  let html = '';
  steps.forEach((s, si) => {
    const sDone  = s.items.filter((_, ii) => states[`${si}_${ii}`]).length;
    const allDone = sDone === s.items.length;

    html += `
      <div class="step-section">
        <div class="step-header">
          <div class="step-num">${si+1}</div>
          <div class="step-title">${s.step}</div>
          <div class="step-badge ${allDone?'done':'ing'}">${allDone?'완료':'진행중'}</div>
        </div>`;

    s.items.forEach((item, ii) => {
      const ck = states[`${si}_${ii}`] ? 'checked' : '';
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

// ── 체크 토글 → 서버 저장 ────────────────────────────────
async function toggleCheck(type, si, ii) {
  if (!currentListId) {
    // 저장된 목록 없이 탐색 중일 땐 임시 상태로만 관리
    if (!checkStates['_temp']) checkStates['_temp'] = {};
    checkStates['_temp'][`${si}_${ii}`] = !checkStates['_temp'][`${si}_${ii}`];
    // 임시 상태를 렌더링에 반영하기 위해 잠깐 currentListId 없이 처리
    const tmpStates = checkStates['_temp'];
    const steps = CHECKLIST_DATA[type];
    let total = 0, done = 0;
    steps.forEach(s => s.items.forEach(() => total++));
    Object.values(tmpStates).forEach(v => { if(v) done++; });
    document.getElementById('progress-text').textContent = `${done} / ${total}`;
    document.getElementById('progress-fill').style.width = total ? `${Math.round(done/total*100)}%` : '0%';

    const key = `${si}_${ii}`;
    const el = document.querySelectorAll('.check-item')[
      steps.slice(0, si).reduce((a,s)=>a+s.items.length,0) + ii
    ];
    if (el) el.classList.toggle('checked', !!tmpStates[key]);
    const badge = el?.closest('.step-section')?.querySelector('.step-badge');
    if (badge) {
      const sItems = steps[si].items;
      const allDone = sItems.every((_,i2)=>tmpStates[`${si}_${i2}`]);
      badge.className = `step-badge ${allDone?'done':'ing'}`;
      badge.textContent = allDone ? '완료' : '진행중';
    }
    return;
  }

  if (!checkStates[currentListId]) checkStates[currentListId] = {};
  const key = `${si}_${ii}`;
  checkStates[currentListId][key] = !checkStates[currentListId][key];

  // 즉시 UI 업데이트 (서버 응답 기다리지 않음)
  renderChecklist(type);

  // 서버에 비동기 저장
  try {
    await API.put(`/api/states/${currentListId}`, { states: checkStates[currentListId] });
    // 홈 최근 목록도 갱신
    const updatedLists = await API.get('/api/lists');
    savedLists = updatedLists;
    renderRecentList();
  } catch(e) {
    console.warn('저장 실패:', e);
  }
}

// ── 내 목록 불러오기 + 렌더링 ────────────────────────────
async function loadAndRenderMyList() {
  try {
    savedLists = await API.get('/api/lists');
  } catch(e) {
    console.warn('목록 로드 실패 (서버 미실행?):', e);
  }
  renderMyList();
  renderRecentList();
}

function renderMyList() {
  const el = document.getElementById('mylist-content');
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
    return;
  }

  const badgeMap = { 월세:'badge-monthly', 전세:'badge-jeonse', 매매:'badge-buy' };
  el.innerHTML = savedLists.map(l => `
    <div class="my-list-card" onclick="openSavedList('${l.id}')">
      <div class="mlc-header">
        <div class="mlc-title">${l.name}</div>
        <div class="mlc-badge ${badgeMap[l.type]}">${l.type}</div>
      </div>
      <div class="mlc-date">📅 ${l.date}</div>
      <div class="mlc-progress">
        <div class="mlc-prog-fill" style="width:${l.progress}%"></div>
      </div>
      <div class="mlc-stat">
        완료 <span>${l.done}</span> / 전체 ${l.total} 항목 · ${l.progress}%
        <span style="float:right;color:#C0392B;cursor:pointer"
          onclick="event.stopPropagation();deleteList('${l.id}')">🗑️</span>
      </div>
    </div>`).join('');
}

function renderRecentList() {
  const el = document.getElementById('recent-list');
  if (!el) return;
  const badgeMap = { 월세:'badge-monthly', 전세:'badge-jeonse', 매매:'badge-buy' };
  el.innerHTML = savedLists.slice(0, 2).map(l => `
    <div class="my-list-card" onclick="openSavedList('${l.id}')">
      <div class="mlc-header">
        <div class="mlc-title">${l.name}</div>
        <div class="mlc-badge ${badgeMap[l.type]}">${l.type}</div>
      </div>
      <div class="mlc-progress">
        <div class="mlc-prog-fill" style="width:${l.progress}%"></div>
      </div>
      <div class="mlc-stat">완료 <span>${l.done}</span> / 전체 ${l.total} 항목</div>
    </div>`).join('');
}

// ── 저장된 목록 열기 ─────────────────────────────────────
async function openSavedList(id) {
  const list = savedLists.find(l => l.id === id);
  if (!list) return;

  currentListId = id;
  selectedType  = list.type;

  // 체크 상태 서버에서 로드
  try {
    checkStates[id] = await API.get(`/api/states/${id}`);
  } catch(e) {
    checkStates[id] = {};
  }

  document.querySelectorAll('.clt-tab').forEach((t, idx) => {
    t.classList.toggle('active', ['월세','전세','매매'][idx] === list.type);
  });
  goScreen('screen-checklist');
  renderChecklist(list.type);
}

// ── 목록 삭제 ────────────────────────────────────────────
async function deleteList(id) {
  if (!confirm('이 체크리스트를 삭제할까요?')) return;
  try {
    await API.delete(`/api/lists/${id}`);
    savedLists = savedLists.filter(l => l.id !== id);
    delete checkStates[id];
    renderMyList();
    renderRecentList();
  } catch(e) {
    alert('삭제 실패: 서버가 실행 중인지 확인하세요.');
  }
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
  ['월세','전세','매매'].forEach(x =>
    document.getElementById('ts-' + x).classList.toggle('sel', x === t)
  );
}

// ── 새 목록 생성 → 서버 저장 ─────────────────────────────
async function createChecklist() {
  const name  = document.getElementById('form-name').value.trim() || '새 체크리스트';
  const addr  = document.getElementById('form-addr').value.trim();
  const price = document.getElementById('form-price').value.trim();
  const type  = selectedModalType;
  const total = CHECKLIST_DATA[type].reduce((a, s) => a + s.items.length, 0);

  let newItem;
  try {
    newItem = await API.post('/api/lists', { name, addr, price, type, total });
  } catch(e) {
    alert('저장 실패: 서버가 실행 중인지 확인하세요.\n(node server.js)');
    return;
  }

  savedLists.unshift(newItem);
  currentListId = newItem.id;

  // 목록 없이 탐색 중 체크한 임시 상태를 새 목록에 이관
  const tempStates = checkStates['_temp'] || {};
  checkStates[newItem.id] = type === selectedModalType ? { ...tempStates } : {};
  delete checkStates['_temp'];

  // 이관된 상태가 있으면 서버에도 저장
  if (Object.keys(checkStates[newItem.id]).length) {
    try {
      await API.put(`/api/states/${newItem.id}`, { states: checkStates[newItem.id] });
    } catch(e) {
      console.warn('임시 상태 이관 저장 실패:', e);
    }
  }

  closeModal();
  ['form-name','form-addr','form-price'].forEach(id => {
    document.getElementById(id).value = '';
  });

  selectedType = type;
  document.querySelectorAll('.clt-tab').forEach((t, i) => {
    t.classList.toggle('active', ['월세','전세','매매'][i] === type);
  });
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('nav-checklist').classList.add('active');
  goScreen('screen-checklist');
  renderChecklist(type);
}

// ── 챗봇 ────────────────────────────────────────────────
// 대화 히스토리 (Claude API는 멀티턴 지원)
let chatHistory = [];
let isChatLoading = false;

async function sendChat() {
  const input = document.getElementById('chat-input');
  const q = input.value.trim();
  if (!q || isChatLoading) return;
  input.value = '';
  await processChat(q);
}

async function askQuestion(q) {
  if (isChatLoading) return;
  hideSuggestions();
  await processChat(q);
}

function hideSuggestions() {
  document.getElementById('chat-suggestions').style.display = 'none';
}

async function processChat(userText) {
  addChatMsg(userText, 'user');
  hideSuggestions();

  // 히스토리에 사용자 메시지 추가
  chatHistory.push({ role: 'user', content: userText });

  // 로딩 버블 표시
  const loadingId = showLoadingBubble();
  isChatLoading = true;
  document.getElementById('chat-input').disabled = true;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory }),
    });

    const data = await res.json();
    removeLoadingBubble(loadingId);

    const reply = data.reply || '⚠️ 응답을 받지 못했습니다. 다시 시도해주세요.';

    // 히스토리에 AI 응답 추가 (멀티턴 유지)
    chatHistory.push({ role: 'assistant', content: reply });

    // 히스토리가 너무 길어지면 앞 메시지 제거 (최근 10턴 유지)
    if (chatHistory.length > 20) {
      chatHistory = chatHistory.slice(chatHistory.length - 20);
    }

    addChatMsg(reply, 'bot');

  } catch(e) {
    removeLoadingBubble(loadingId);
    chatHistory.pop(); // 실패 시 히스토리 롤백
    addChatMsg('⚠️ 연결에 실패했습니다.\n서버가 실행 중인지 확인해주세요.', 'bot');
  } finally {
    isChatLoading = false;
    document.getElementById('chat-input').disabled = false;
    document.getElementById('chat-input').focus();
  }
}

// 로딩 말풍선 (점 세 개 애니메이션)
function showLoadingBubble() {
  const id   = 'loading-' + Date.now();
  const msgs = document.getElementById('chat-messages');
  const wrap = document.createElement('div');
  wrap.className = 'chat-row bot';
  wrap.id = id;
  wrap.innerHTML = `
    <div class="chat-bot-name">KB 부동산 AI</div>
    <div class="chat-bubble bot">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>`;
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
  return id;
}

function removeLoadingBubble(id) {
  document.getElementById(id)?.remove();
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

// API 키 설정 여부 확인 후 안내
async function checkChatStatus() {
  try {
    const res  = await fetch('/api/chat/status');
    const data = await res.json();
    if (!data.configured) {
      addChatMsg(
        '⚠️ API 키가 설정되지 않아 AI 답변을 사용할 수 없어요.\n\n' +
        '프로젝트 폴더에 <b>.env</b> 파일을 만들고\n' +
        '<b>GEMINI_API_KEY=여기에_키_입력</b> 를 입력 후\n' +
        '서버를 재시작해주세요! 🔑',
        'bot'
      );
    }
  } catch { /* 무시 */ }
}

// ── 초기화 ────────────────────────────────────────────────
(async function init() {
  renderGuide();
  renderChecklist('월세');
  await loadAndRenderMyList();
})();

// 앱 초기화 시 챗봇 API 상태도 체크
document.addEventListener('DOMContentLoaded', () => {
  checkChatStatus();
});
