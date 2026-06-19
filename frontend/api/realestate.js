const https = require('https');

const CODES = {
  // 서울
  '종로구':'11110','중구':'11140','용산구':'11170','성동구':'11200','광진구':'11215',
  '동대문구':'11230','중랑구':'11260','성북구':'11290','강북구':'11305','도봉구':'11320',
  '노원구':'11350','은평구':'11380','서대문구':'11410','마포구':'11440','양천구':'11470',
  '강서구':'11500','구로구':'11530','금천구':'11545','영등포구':'11560','동작구':'11590',
  '관악구':'11620','서초구':'11650','강남구':'11680','송파구':'11710','강동구':'11740',
  // 경기
  '수원시':'41110','성남시':'41130','분당구':'41135','고양시':'41280','용인시':'41460',
  '부천시':'41190','안산시':'41270','안양시':'41170','남양주시':'41360','화성시':'41590',
  '평택시':'41220','의정부시':'41150','시흥시':'41390','파주시':'41480','김포시':'41570',
  '광명시':'41210','하남시':'41450','군포시':'41410','광주시':'41610','이천시':'41500',
  '오산시':'41370','구리시':'41310','의왕시':'41430','과천시':'41290',
  // 인천
  '남동구':'28200','부평구':'28237','계양구':'28245','연수구':'28185','미추홀구':'28177',
  '서구':'28260','강화군':'28710',
  // 부산
  '해운대구':'26350','부산진구':'26230','동래구':'26260','수영구':'26500','사하구':'26380',
  '금정구':'26410','연제구':'26470','사상구':'26530','북구':'26320','남구':'26290',
  '동구':'26170','기장군':'26710',
  // 대구
  '수성구':'27200','달서구':'27290','달성군':'27710',
  // 대전
  '유성구':'30200','대덕구':'30230',
  // 광주
  '광산구':'29200',
  // 울산
  '울주군':'31710',
  // 세종
  '세종시':'36110',
};

const DONG_TO_GU = {
  // 강남구
  '역삼동':'강남구','삼성동':'강남구','청담동':'강남구','논현동':'강남구','압구정동':'강남구',
  '신사동':'강남구','개포동':'강남구','대치동':'강남구','도곡동':'강남구','일원동':'강남구',
  '수서동':'강남구','세곡동':'강남구',
  // 서초구
  '서초동':'서초구','반포동':'서초구','잠원동':'서초구','방배동':'서초구','양재동':'서초구',
  '내곡동':'서초구','우면동':'서초구',
  // 송파구
  '잠실동':'송파구','가락동':'송파구','문정동':'송파구','거여동':'송파구','마천동':'송파구',
  '방이동':'송파구','오금동':'송파구','석촌동':'송파구','삼전동':'송파구','장지동':'송파구',
  // 강동구
  '천호동':'강동구','성내동':'강동구','길동':'강동구','강일동':'강동구','상일동':'강동구',
  '명일동':'강동구','고덕동':'강동구','암사동':'강동구','둔촌동':'강동구',
  // 마포구
  '합정동':'마포구','망원동':'마포구','상수동':'마포구','서교동':'마포구','연남동':'마포구',
  '성산동':'마포구','상암동':'마포구','공덕동':'마포구','아현동':'마포구',
  // 용산구
  '이태원동':'용산구','한남동':'용산구','이촌동':'용산구','후암동':'용산구','청파동':'용산구',
  // 성동구
  '성수동':'성동구','왕십리동':'성동구','마장동':'성동구','행당동':'성동구','금호동':'성동구','옥수동':'성동구',
  // 광진구
  '광장동':'광진구','자양동':'광진구','구의동':'광진구','군자동':'광진구','화양동':'광진구',
  // 노원구
  '상계동':'노원구','중계동':'노원구','하계동':'노원구','공릉동':'노원구','월계동':'노원구',
  // 강서구
  '화곡동':'강서구','가양동':'강서구','등촌동':'강서구','마곡동':'강서구','발산동':'강서구','방화동':'강서구',
  // 영등포구
  '여의도동':'영등포구','영등포동':'영등포구','당산동':'영등포구','문래동':'영등포구','신길동':'영등포구',
  // 동작구
  '사당동':'동작구','노량진동':'동작구','상도동':'동작구','흑석동':'동작구','신대방동':'동작구',
  // 관악구
  '신림동':'관악구','봉천동':'관악구','낙성대동':'관악구',
  // 은평구
  '응암동':'은평구','증산동':'은평구','수색동':'은평구','불광동':'은평구','갈현동':'은평구',
  // 성남시
  '하대원동':'성남시','상대원동':'성남시','단대동':'성남시','은행동':'성남시','신흥동':'성남시',
  '수진동':'성남시','태평동':'성남시','금광동':'성남시','분당동':'성남시','서현동':'성남시',
  '이매동':'성남시','야탑동':'성남시','정자동':'성남시','수내동':'성남시',
  // 수원시
  '팔달동':'수원시','우만동':'수원시','매탄동':'수원시','원천동':'수원시','영통동':'수원시',
  '망포동':'수원시','인계동':'수원시','권선동':'수원시','세류동':'수원시',
  // 고양시
  '화정동':'고양시','행신동':'고양시','능곡동':'고양시','주엽동':'고양시','대화동':'고양시','백석동':'고양시',
  // 용인시
  '수지동':'용인시','동천동':'용인시','상현동':'용인시','죽전동':'용인시','보정동':'용인시',
  '기흥동':'용인시','구갈동':'용인시','영덕동':'용인시',
  // 해운대구
  '해운대동':'해운대구','우동':'해운대구','좌동':'해운대구','반여동':'해운대구','송정동':'해운대구','재송동':'해운대구',
};

function extractDistrict(region) {
  const trimmed = region.trim();
  if (DONG_TO_GU[trimmed]) return DONG_TO_GU[trimmed];
  // 부분 매칭
  for (const dong of Object.keys(DONG_TO_GU)) {
    if (trimmed.startsWith(dong)) return DONG_TO_GU[dong];
  }
  // 구/시 단위 추출
  const parts = trimmed.split(/[\s,]+/);
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i].endsWith('구') || parts[i].endsWith('시') || parts[i].endsWith('군')) return parts[i];
  }
  return trimmed;
}

function findCode(district) {
  if (CODES[district]) return CODES[district];
  for (const [k, v] of Object.entries(CODES)) {
    if (k.startsWith(district) || district.startsWith(k)) return v;
  }
  return null;
}

function parsePrice(s) {
  return parseInt((s || '').replace(/[^0-9]/g, '')) || 0;
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseXml(xml, tradeType) {
  const items = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  for (const item of itemMatches) {
    const get = (tag) => {
      const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`));
      return m ? m[1].trim() : '';
    };
    const obj = {
      아파트: get('아파트'),
      전용면적: get('전용면적'),
      법정동: get('법정동'),
    };
    if (tradeType === '매매') {
      obj.거래금액 = get('거래금액');
    } else {
      obj.보증금액 = get('보증금액');
      obj.월세금액 = get('월세금액');
      obj.거래금액 = obj.보증금액;
    }
    items.push(obj);
  }
  return items;
}

function getYM(monthsAgo) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { region, tradeType } = req.query;
  if (!region || !tradeType) return res.status(400).json({ error: 'region and tradeType required' });

  const district = extractDistrict(region);
  const lawdCd = findCode(district);

  if (!lawdCd) {
    return res.json({ found: false, message: `'${district}'은(는) 지원하지 않는 지역입니다. 구·시 또는 주요 동 이름으로 입력해주세요.` });
  }

  const apiKey = process.env.PUBLIC_DATA_API_KEY || 'e2daae48fe5773dba30f90130dd58aec015ab764e8243ac7cd6d88fea5e267e4';
  const endpoint = tradeType === '매매'
    ? 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTrade'
    : 'https://apis.data.go.kr/1613000/RTMSDataSvcAptRentDev/getRTMSDataSvcAptRent';

  try {
    let txs = [];
    let ym = '';
    for (let ago = 1; ago <= 3 && txs.length === 0; ago++) {
      ym = getYM(ago);
      const url = `${endpoint}?serviceKey=${encodeURIComponent(apiKey)}&LAWD_CD=${lawdCd}&DEAL_YMD=${ym}&numOfRows=20&pageNo=1`;
      const body = await httpsGet(url);
      if (body.includes('<resultCode>00</resultCode>') || body.includes('<item>')) {
        txs = parseXml(body, tradeType);
      }
    }

    if (txs.length === 0) {
      return res.json({ found: false, message: '최근 3개월 거래 데이터가 없습니다.' });
    }

    const prices = txs.map(t => parsePrice(t.거래금액)).filter(p => p > 0);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return res.json({
      found: true,
      region,
      district,
      tradeType,
      yearMonth: ym,
      count: txs.length,
      avgPrice: avg,
      minPrice: min,
      maxPrice: max,
      samples: txs.slice(0, 3),
    });
  } catch (e) {
    return res.json({ found: false, message: '공공데이터 조회 오류: ' + e.message });
  }
};
