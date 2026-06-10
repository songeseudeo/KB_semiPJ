// ═══════════════════════════════════════════════════════════
//  KB 부동산 가이드 — server.js
//  실행: node server.js
//  접속: http://localhost:3000
// ═══════════════════════════════════════════════════════════

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT    = 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// ── .env 로드 ─────────────────────────────────────────────
function loadEnv() {
  try {
    fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
      .split('\n')
      .forEach(line => {
        const [k, ...v] = line.split('=');
        if (k && v.length) process.env[k.trim()] = v.join('=').trim();
      });
  } catch { /* .env 없으면 무시 */ }
}
loadEnv();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// ── 부동산 전문가 시스템 프롬프트 ────────────────────────
const SYSTEM_PROMPT = `당신은 KB 부동산 가이드의 AI 상담사입니다.
사회초년생과 신혼부부를 위해 부동산 거래(월세·전세·매매)를 쉽고 친절하게 안내합니다.

답변 규칙:
- 항상 한국어로 답변하세요
- 전문 용어는 쉽게 풀어서 설명하세요
- 중요한 주의사항은 ⚠️ 이모지로 강조하세요
- 팁은 💡, 법률 관련은 ⚖️, 비용 관련은 💰 이모지를 활용하세요
- 답변은 3~5문장으로 간결하게, 필요시 번호 목록 사용
- 구체적인 법률 해석이나 투자 조언은 전문가 상담을 권장한다고 안내하세요`;

// ── DB 유틸 ───────────────────────────────────────────────
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { return { lists: [], checkStates: {} }; }
}

let dbWriteTimer = null;
function writeDB(data) {
  // 짧은 시간 내 연속 쓰기 요청을 하나로 합쳐 파일 경합 방지
  clearTimeout(dbWriteTimer);
  dbWriteTimer = setTimeout(() => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  }, 50);
}

// ── MIME 타입 ─────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
};

// ── 공통 헬퍼 ─────────────────────────────────────────────
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end',  () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
    req.on('error', reject);
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

function serveStatic(res, filePath) {
  const mimeType = MIME[path.extname(filePath)] || 'text/plain';
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(content);
  });
}

// ── Gemini API 호출 ───────────────────────────────────────
function callGemini(messages) {
  return new Promise((resolve, reject) => {

    // Gemini는 contents 배열 형식 사용
    // 대화 히스토리를 Gemini 포맷으로 변환
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const body = JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path:     `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, apiRes => {
      let data = '';
      apiRes.on('data', chunk => { data += chunk; });
      apiRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error.message));
            return;
          }
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            reject(new Error('응답 형식 오류'));
            return;
          }
          resolve(text);
        } catch(e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── HTTP 서버 ─────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url    = req.url.split('?')[0];
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
    });
    res.end();
    return;
  }

  // ── POST /api/chat ─────────────────────────────────────
  if (method === 'POST' && url === '/api/chat') {
    if (!GEMINI_API_KEY) {
      return sendJSON(res, 400, {
        error: 'API_KEY_MISSING',
        reply: '⚠️ API 키가 설정되지 않았습니다.\n\n.env 파일에 GEMINI_API_KEY를 설정하고 서버를 재시작해주세요.',
      });
    }

    const body     = await parseBody(req);
    const messages = body.messages || [];
    if (!messages.length) return sendJSON(res, 400, { error: '메시지 없음' });

    try {
      console.log(`[챗봇] 질문: "${messages[messages.length - 1]?.content}"`);
      const reply = await callGemini(messages);
      console.log(`[챗봇] 답변 완료 (${reply.length}자)`);
      return sendJSON(res, 200, { reply });
    } catch(e) {
      console.error('[챗봇] Gemini API 오류:', e.message);
      return sendJSON(res, 500, {
        error: e.message,
        reply: '⚠️ AI 연결에 문제가 발생했습니다.\n\nAPI 키가 올바른지 확인해주세요.',
      });
    }
  }

  // ── GET /api/chat/status ───────────────────────────────
  if (method === 'GET' && url === '/api/chat/status') {
    return sendJSON(res, 200, { configured: !!GEMINI_API_KEY });
  }

  // ── GET /api/lists ─────────────────────────────────────
  if (method === 'GET' && url === '/api/lists') {
    return sendJSON(res, 200, readDB().lists);
  }

  // ── POST /api/lists ────────────────────────────────────
  if (method === 'POST' && url === '/api/lists') {
    const body = await parseBody(req);
    const db   = readDB();
    const item = {
      id:       Date.now().toString(),
      name:     body.name  || '새 체크리스트',
      type:     body.type  || '월세',
      addr:     body.addr  || '',
      price:    body.price || '',
      date:     new Date().toLocaleDateString('ko-KR', {
                  year:'numeric', month:'2-digit', day:'2-digit'
                }).replace(/\. /g,'.').replace('.',''),
      done:     0,
      total:    body.total || 0,
      progress: 0,
    };
    db.lists.unshift(item);
    writeDB(db);
    console.log(`[생성] ${item.type} - "${item.name}"`);
    return sendJSON(res, 201, item);
  }

  // ── DELETE /api/lists/:id ──────────────────────────────
  if (method === 'DELETE' && url.startsWith('/api/lists/')) {
    const id = url.replace('/api/lists/', '');
    const db = readDB();
    db.lists = db.lists.filter(l => l.id !== id);
    delete db.checkStates[id];
    writeDB(db);
    console.log(`[삭제] id=${id}`);
    return sendJSON(res, 200, { ok: true });
  }

  // ── GET /api/states/:id ────────────────────────────────
  if (method === 'GET' && url.startsWith('/api/states/')) {
    const id = url.replace('/api/states/', '');
    return sendJSON(res, 200, readDB().checkStates[id] || {});
  }

  // ── PUT /api/states/:id ────────────────────────────────
  if (method === 'PUT' && url.startsWith('/api/states/')) {
    const id   = url.replace('/api/states/', '');
    const body = await parseBody(req);
    const db   = readDB();
    db.checkStates[id] = body.states || {};
    const idx = db.lists.findIndex(l => l.id === id);
    if (idx !== -1) {
      const total = db.lists[idx].total;
      const done  = Object.values(db.checkStates[id]).filter(Boolean).length;
      db.lists[idx].done     = done;
      db.lists[idx].progress = total ? Math.round(done / total * 100) : 0;
    }
    writeDB(db);
    return sendJSON(res, 200, { ok: true });
  }

  // ── 정적 파일 ──────────────────────────────────────────
  const filePath = url === '/'
    ? path.join(__dirname, 'index.html')
    : path.join(__dirname, url);

  // path traversal 방지: __dirname 바깥 경로 차단
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  serveStatic(res, filePath);
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ┌──────────────────────────────────────────┐');
  console.log('  │   부동산 가이드 서버 시작!             │');
  console.log(`  │   http://localhost:${PORT}                │`);
  console.log('  │   종료: Ctrl + C                          │');
  console.log('  └──────────────────────────────────────────┘');
  console.log('');

  if (!GEMINI_API_KEY) {
    console.log('  ⚠️  Gemini API 키가 없습니다. 챗봇을 사용하려면:');
    console.log('');
    console.log('  1. https://aistudio.google.com/app/apikey 접속');
    console.log('  2. [Create API Key] 클릭 후 복사');
    console.log('  3. 프로젝트 폴더에 .env 파일 생성 후 아래 내용 입력:');
    console.log('');
    console.log('     GEMINI_API_KEY=여기에_키_붙여넣기');
    console.log('');
    console.log('  4. 서버 재시작 (Ctrl+C → node server.js)');
    console.log('');
  } else {
    console.log('  ✅ Gemini API 키 확인됨 — AI 챗봇 사용 가능!');
    console.log('');
  }
});
