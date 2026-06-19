const https = require('https');
const { URL } = require('url');

const CODES = {
  '종로구':'11110','중구':'11140','용산구':'11170','성동구':'11200','광진구':'11215',
  '동대문구':'11230','중랑구':'11260','성북구':'11290','강북구':'11305','도봉구':'11320',
  '노원구':'11350','은평구':'11380','서대문구':'11410','마포구':'11440','양천구':'11470',
  '강서구':'11500','구로구':'11530','금천구':'11545','영등포구':'11560','동작구':'11590',
  '관악구':'11620','서초구':'11650','강남구':'11680','송파구':'11710','강동구':'11740',
  '수원시':'41110','성남시':'41130','분당구':'41135','고양시':'41280','용인시':'41460',
  '부천시':'41190','안산시':'41270','안양시':'41170','남양주시':'41360','화성시':'41590',
  '평택시':'41220','의정부시':'41150','시흥시':'41390','파주시':'41480','김포시':'41570',
  '광명시':'41210','하남시':'41450','군포시':'41410','광주시':'41610','이천시':'41500',
  '오산시':'41370','구리시':'41310','의왕시':'41430','과천시':'41290',
  '남동구':'28200','부평구':'28237','계양구':'28245','연수구':'28185','미추홀구':'28177',
  '서구':'28260','강화군':'28710',
  '해운대구':'26350','부산진구':'26230','동래구':'26260','수영구':'26500','사하구':'26380',
  '금정구':'26410','연제구':'26470','사상구':'26530','북구':'26320','남구':'26290',
  '동구':'26170','기장군':'26710',
  '수성구':'27200','달서구':'27290','달성군':'27710',
  '유성구':'30200','대덕구':'30230','광산구':'29200','울주군':'31710','세종시':'36110',
};

const DONG_TO_GU = {
  '역삼동':'강남구','삼성동':'강남구','청담동':'강남구','논현동':'강남구','압구정동':'강남구',
  '신사동':'강남구','개포동':'강남구','대치동':'강남구','도곡동':'강남구','수서동':'강남구',
  '서초동':'서초구','반포동':'서초구','잠원동':'서초구','방배동':'서초구','양재동':'서초구',
  '잠실동':'송파구','가락동':'송파구','문정동':'송파구','방이동':'송파구','석촌동':'송파구',
  '천호동':'강동구','강일동':'강동구','고덕동':'강동구','암사동':'강동구','둔촌동':'강동구',
  '합정동':'마포구','망원동':'마포구','서교동':'마포구','연남동':'마포구','상암동':'마포구','공덕동':'마포구',
  '이태원동':'용산구','한남동':'용산구','이촌동':'용산구',
  '성수동':'성동구','왕십리동':'성동구','금호동':'성동구','옥수동':'성동구',
  '광장동':'광진구','자양동':'광진구','구의동':'광진구',
  '상계동':'노원구','중계동':'노원구','하계동':'노원구',
  '화곡동':'강서구','가양동':'강서구','마곡동':'강서구',
  '여의도동':'영등포구','당산동':'영등포구','문래동':'영등포구',
  '사당동':'동작구','노량진동':'동작구','상도동':'동작구','흑석동':'동작구',
  '신림동':'관악구','봉천동':'관악구',
  '불광동':'은평구','응암동':'은평구',
  '하대원동':'성남시','상대원동':'성남시','분당동':'성남시','서현동':'성남시',
  '야탑동':'성남시','정자동':'성남시','수내동':'성남시',
  '영통동':'수원시','매탄동':'수원시','인계동':'수원시','권선동':'수원시',
  '화정동':'고양시','행신동':'고양시','주엽동':'고양시','대화동':'고양시','백석동':'고양시',
  '수지동':'용인시','동천동':'용인시','죽전동':'용인시','기흥동':'용인시',
  '해운대동':'해운대구','우동':'해운대구','좌동':'해운대구','재송동':'해운대구',
};

function extractDistrict(region) {
  const t = String(region || '').trim();
  if (DONG_TO_GU[t]) return DONG_TO_GU[t];
  for (const [dong, gu] of Object.entries(DONG_TO_GU)) {
    if (t.startsWith(dong)) return gu;
  }
  const parts = t.split(/[\s,]+/);
  for (let i = parts.length - 1; i >= 0; i--) {
    if (/[구시군]$/.test(parts[i])) return parts[i];
  }
  return t;
}

function findCode(district) {
  if (CODES[district]) return CODES[district];
  for (const [k, v] of Object.entries(CODES)) {
    if (k.startsWith(district) || district.startsWith(k)) return v;
  }
  return null;
}

function parsePrice(s) {
  return parseInt(String(s || '').replace(/[^0-9]/g, '')) || 0;
}

function parseXml(xml, tradeType) {
  const items = [];
  const matches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  for (const item of matches) {
    const get = tag => {
      const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? m[1].trim() : '';
    };
    const obj = { 아파트: get('아파트'), 전용면적: get('전용면적'), 법정동: get('법정동') };
    obj.거래금액 = tradeType === '매매' ? get('거래금액') : get('보증금액');
    if (tradeType !== '매매') obj.월세금액 = get('월세금액');
    items.push(obj);
  }
  return items;
}

function getYM(ago) {
  const d = new Date();
  d.setMonth(d.getMonth() - ago);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function httpsGet(urlStr) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      rejectUnauthorized: false,
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(new Error('timeout')); });
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const region = String(req.query && req.query.region || '').trim();
    const tradeType = String(req.query && req.query.tradeType || '').trim();

    if (!region || !tradeType) {
      return res.json({ found: false, message: 'region, tradeType 필수' });
    }

    const district = extractDistrict(region);
    const lawdCd = findCode(district);

    if (!lawdCd) {
      return res.json({ found: false, message: `'${district}'은(는) 지원하지 않는 지역입니다.` });
    }

    const apiKey = (process.env.PUBLIC_DATA_API_KEY || 'e2daae48fe5773dba30f90130dd58aec015ab764e8243ac7cd6d88fea5e267e4').trim();
    const base = tradeType === '매매'
      ? 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade'
      : 'https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent';

    let txs = [], ym = '', lastBody = '';
    for (let ago = 1; ago <= 3 && txs.length === 0; ago++) {
      ym = getYM(ago);
      const url = `${base}?serviceKey=${apiKey}&LAWD_CD=${lawdCd}&DEAL_YMD=${ym}&numOfRows=20&pageNo=1`;
      lastBody = await httpsGet(url);
      if (lastBody.includes('<item>')) {
        txs = parseXml(lastBody, tradeType);
      }
    }

    if (txs.length === 0) {
      return res.json({ found: false, message: '최근 거래 데이터 없음', debug: lastBody.slice(0, 300) });
    }

    const prices = txs.map(t => parsePrice(t.거래금액)).filter(p => p > 0);
    if (prices.length === 0) {
      return res.json({ found: false, message: '가격 파싱 실패', debug: JSON.stringify(txs[0]) });
    }

    return res.json({
      found: true, region, district, tradeType, yearMonth: ym,
      count: txs.length,
      avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      samples: txs.slice(0, 3),
    });

  } catch (e) {
    return res.json({ found: false, message: `오류: ${e.message}` });
  }
};
