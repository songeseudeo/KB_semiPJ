import https from 'https';

const CODES = {
  '종로구':'11110','중구':'11140','용산구':'11170','성동구':'11200','광진구':'11215',
  '동대문구':'11230','중랑구':'11260','성북구':'11290','강북구':'11305','도봉구':'11320',
  '노원구':'11350','은평구':'11380','서대문구':'11410','마포구':'11440','양천구':'11470',
  '강서구':'11500','구로구':'11530','금천구':'11545','영등포구':'11560','동작구':'11590',
  '관악구':'11620','서초구':'11650','강남구':'11680','송파구':'11710','강동구':'11740',
  '수원시':'41110','성남시':'41130','고양시':'41280','용인시':'41460','부천시':'41190',
  '안산시':'41270','안양시':'41170','남양주시':'41360','화성시':'41590','평택시':'41220',
  '의정부시':'41150','시흥시':'41390','파주시':'41480','김포시':'41570','광명시':'41210',
  '하남시':'41450','군포시':'41410','광주시':'41610','이천시':'41500','구리시':'41310',
  '부평구':'28237','남동구':'28200','연수구':'28185','계양구':'28245','서구':'28260',
  '해운대구':'26350','부산진구':'26230','동래구':'26260','수영구':'26500','사하구':'26380',
  '수성구':'27200','달서구':'27290','유성구':'30200','광산구':'29200','세종시':'36110',
};

const DONG_TO_GU = {
  '역삼동':'강남구','삼성동':'강남구','압구정동':'강남구','대치동':'강남구','개포동':'강남구',
  '서초동':'서초구','반포동':'서초구','방배동':'서초구','양재동':'서초구',
  '잠실동':'송파구','가락동':'송파구','문정동':'송파구','방이동':'송파구',
  '천호동':'강동구','고덕동':'강동구','암사동':'강동구','둔촌동':'강동구',
  '합정동':'마포구','망원동':'마포구','서교동':'마포구','상암동':'마포구','공덕동':'마포구',
  '이태원동':'용산구','한남동':'용산구','이촌동':'용산구',
  '성수동':'성동구','왕십리동':'성동구','금호동':'성동구',
  '상계동':'노원구','중계동':'노원구','하계동':'노원구',
  '화곡동':'강서구','가양동':'강서구','마곡동':'강서구',
  '여의도동':'영등포구','당산동':'영등포구',
  '사당동':'동작구','노량진동':'동작구','흑석동':'동작구',
  '신림동':'관악구','봉천동':'관악구',
  '하대원동':'성남시','상대원동':'성남시','분당동':'성남시','서현동':'성남시','야탑동':'성남시','정자동':'성남시',
  '영통동':'수원시','인계동':'수원시','권선동':'수원시',
  '화정동':'고양시','행신동':'고양시','주엽동':'고양시','백석동':'고양시',
  '수지동':'용인시','죽전동':'용인시','기흥동':'용인시',
  '해운대동':'해운대구','우동':'해운대구','좌동':'해운대구',
};

function getDistrict(region) {
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

function getCode(district) {
  if (CODES[district]) return CODES[district];
  for (const [k, v] of Object.entries(CODES)) {
    if (k.startsWith(district) || district.startsWith(k)) return v;
  }
  return null;
}

function getYM(ago) {
  const d = new Date();
  d.setMonth(d.getMonth() - ago);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getXml(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/xml, */*',
      },
      rejectUnauthorized: false,
    }, (res) => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => resolve(body));
    });
    req.on('error', () => resolve(''));
    req.end();
  });
}

function parsePrice(s) {
  return parseInt(String(s || '').replace(/[^0-9]/g, '')) || 0;
}

function parseItems(xml, isSale) {
  const out = [];
  for (const m of (xml.match(/<item>([\s\S]*?)<\/item>/g) || [])) {
    const g = tag => { const r = m.match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`)); return r ? r[1].trim() : ''; };
    out.push({
      아파트: g('aptNm'),
      전용면적: g('excluUseAr'),
      법정동: g('umdNm'),
      거래금액: isSale ? g('dealAmount') : g('deposit'),
      월세금액: isSale ? '' : g('monthlyRent'),
    });
  }
  return out;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const region = String((req.query || {}).region || '').trim();
    const tradeType = String((req.query || {}).tradeType || '').trim();
    if (!region || !tradeType) return res.json({ found: false, message: 'region, tradeType 필수' });

    const district = getDistrict(region);
    const code = getCode(district);
    if (!code) return res.json({ found: false, message: `'${district}'은(는) 지원하지 않는 지역입니다.` });

    const key = (process.env.PUBLIC_DATA_API_KEY || 'e2daae48fe5773dba30f90130dd58aec015ab764e8243ac7cd6d88fea5e267e4').trim();
    const isSale = tradeType === '매매';
    const base = isSale
      ? 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade'
      : 'https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent';

    let items = [], ym = '';
    for (let ago = 1; ago <= 3; ago++) {
      ym = getYM(ago);
      const xml = await getXml(`${base}?serviceKey=${key}&LAWD_CD=${code}&DEAL_YMD=${ym}&numOfRows=20&pageNo=1`);
      items = parseItems(xml, isSale);
      if (items.length > 0) break;
    }

    if (items.length === 0) return res.json({ found: false, message: '최근 거래 데이터가 없습니다.' });

    const prices = items.map(i => parsePrice(i.거래금액)).filter(p => p > 0);
    if (prices.length === 0) return res.json({ found: false, message: '가격 데이터 없음' });

    return res.json({
      found: true, region, district, tradeType, yearMonth: ym,
      count: items.length,
      avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      samples: items.slice(0, 3),
    });
  } catch (e) {
    return res.json({ found: false, message: '오류: ' + e.message });
  }
}
