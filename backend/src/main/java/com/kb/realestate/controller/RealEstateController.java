package com.kb.realestate.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.w3c.dom.*;
import org.xml.sax.InputSource;
import javax.xml.parsers.*;
import java.io.StringReader;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/realestate")
@CrossOrigin(origins = "*")
public class RealEstateController {

    @Value("${public.data.api.key}")
    private String apiKey;

    // 구/시 코드 (LAWD_CD 5자리)
    private static final Map<String, String> CODES = new LinkedHashMap<>();
    // 동 → 구/시 매핑
    private static final Map<String, String> DONG_TO_GU = new LinkedHashMap<>();

    static {
        // ── 서울 25구 ──
        CODES.put("종로구","11110"); CODES.put("중구","11140"); CODES.put("용산구","11170");
        CODES.put("성동구","11200"); CODES.put("광진구","11215"); CODES.put("동대문구","11230");
        CODES.put("중랑구","11260"); CODES.put("성북구","11290"); CODES.put("강북구","11305");
        CODES.put("도봉구","11320"); CODES.put("노원구","11350"); CODES.put("은평구","11380");
        CODES.put("서대문구","11410"); CODES.put("마포구","11440"); CODES.put("양천구","11470");
        CODES.put("강서구","11500"); CODES.put("구로구","11530"); CODES.put("금천구","11545");
        CODES.put("영등포구","11560"); CODES.put("동작구","11590"); CODES.put("관악구","11620");
        CODES.put("서초구","11650"); CODES.put("강남구","11680"); CODES.put("송파구","11710");
        CODES.put("강동구","11740");
        // ── 경기 주요 시 ──
        CODES.put("수원시","41110"); CODES.put("성남시","41130"); CODES.put("분당구","41135");
        CODES.put("고양시","41280"); CODES.put("용인시","41460"); CODES.put("부천시","41190");
        CODES.put("안산시","41270"); CODES.put("안양시","41170"); CODES.put("남양주시","41360");
        CODES.put("화성시","41590"); CODES.put("평택시","41220"); CODES.put("의정부시","41150");
        CODES.put("시흥시","41390"); CODES.put("파주시","41480"); CODES.put("김포시","41570");
        CODES.put("광명시","41210"); CODES.put("하남시","41450"); CODES.put("군포시","41410");
        CODES.put("광주시","41610"); CODES.put("이천시","41500"); CODES.put("오산시","41370");
        CODES.put("구리시","41310"); CODES.put("의왕시","41430"); CODES.put("과천시","41290");
        // ── 인천 ──
        CODES.put("남동구","28200"); CODES.put("부평구","28237"); CODES.put("계양구","28245");
        CODES.put("연수구","28185"); CODES.put("미추홀구","28177"); CODES.put("서구","28260");
        CODES.put("강화군","28710");
        // ── 부산 ──
        CODES.put("해운대구","26350"); CODES.put("부산진구","26230"); CODES.put("동래구","26260");
        CODES.put("수영구","26500"); CODES.put("사하구","26380"); CODES.put("금정구","26410");
        CODES.put("연제구","26470"); CODES.put("사상구","26530"); CODES.put("북구","26320");
        CODES.put("남구","26290"); CODES.put("동구","26170"); CODES.put("기장군","26710");
        // ── 대구 ──
        CODES.put("수성구","27200"); CODES.put("달서구","27290"); CODES.put("달성군","27710");
        CODES.put("중구","27140"); CODES.put("동구","27170"); CODES.put("서구","27230");
        // ── 대전 ──
        CODES.put("유성구","30200"); CODES.put("서구","30170"); CODES.put("대덕구","30230");
        // ── 광주 ──
        CODES.put("광산구","29200"); CODES.put("북구","29155"); CODES.put("남구","29140");
        // ── 울산 ──
        CODES.put("울주군","31710"); CODES.put("남구","31140"); CODES.put("북구","31170");
        // ── 세종 ──
        CODES.put("세종시","36110");

        // ── 동 → 구/시 매핑 (주요 동) ──
        // 강남구
        String[] gangnam = {"역삼동","삼성동","청담동","논현동","압구정동","신사동","개포동","대치동","도곡동","일원동","수서동","세곡동"};
        for (String d : gangnam) DONG_TO_GU.put(d, "강남구");
        // 서초구
        String[] seocho = {"서초동","반포동","잠원동","방배동","양재동","내곡동","우면동"};
        for (String d : seocho) DONG_TO_GU.put(d, "서초구");
        // 송파구
        String[] songpa = {"잠실동","가락동","문정동","거여동","마천동","방이동","오금동","석촌동","삼전동","장지동"};
        for (String d : songpa) DONG_TO_GU.put(d, "송파구");
        // 강동구
        String[] gangdong = {"천호동","성내동","길동","강일동","상일동","명일동","고덕동","암사동","둔촌동"};
        for (String d : gangdong) DONG_TO_GU.put(d, "강동구");
        // 마포구
        String[] mapo = {"합정동","망원동","상수동","서교동","연남동","성산동","상암동","공덕동","아현동"};
        for (String d : mapo) DONG_TO_GU.put(d, "마포구");
        // 용산구
        String[] yongsan = {"이태원동","한남동","서빙고동","동빙고동","이촌동","후암동","원효로","청파동"};
        for (String d : yongsan) DONG_TO_GU.put(d, "용산구");
        // 성동구
        String[] seongdong = {"성수동","왕십리동","마장동","사근동","행당동","응봉동","금호동","옥수동"};
        for (String d : seongdong) DONG_TO_GU.put(d, "성동구");
        // 광진구
        String[] gwangjin = {"광장동","자양동","구의동","군자동","화양동","능동","중곡동"};
        for (String d : gwangjin) DONG_TO_GU.put(d, "광진구");
        // 노원구
        String[] nowon = {"상계동","중계동","하계동","공릉동","월계동","도봉동"};
        for (String d : nowon) DONG_TO_GU.put(d, "노원구");
        // 강서구
        String[] gangseo = {"화곡동","가양동","등촌동","마곡동","발산동","방화동","공항동"};
        for (String d : gangseo) DONG_TO_GU.put(d, "강서구");
        // 영등포구
        String[] yeongdeungpo = {"여의도동","영등포동","당산동","문래동","양평동","도림동","신길동"};
        for (String d : yeongdeungpo) DONG_TO_GU.put(d, "영등포구");
        // 동작구
        String[] dongjak = {"사당동","노량진동","상도동","본동","흑석동","동작동","신대방동"};
        for (String d : dongjak) DONG_TO_GU.put(d, "동작구");
        // 관악구
        String[] gwanak = {"신림동","봉천동","낙성대동","서원동","청룡동","난향동"};
        for (String d : gwanak) DONG_TO_GU.put(d, "관악구");
        // 은평구
        String[] eunpyeong = {"응암동","증산동","수색동","신사동","역촌동","불광동","갈현동","구산동"};
        for (String d : eunpyeong) DONG_TO_GU.put(d, "은평구");
        // 성남시
        String[] seongnam = {"하대원동","상대원동","단대동","은행동","신흥동","수진동","태평동","금광동","중동","오야동","분당동","서현동","이매동","야탑동","정자동","수내동"};
        for (String d : seongnam) DONG_TO_GU.put(d, "성남시");
        // 수원시
        String[] suwon = {"팔달동","우만동","매탄동","원천동","영통동","망포동","인계동","권선동","세류동"};
        for (String d : suwon) DONG_TO_GU.put(d, "수원시");
        // 고양시
        String[] goyang = {"일산동","일산서구","화정동","행신동","능곡동","덕이동","주엽동","대화동","백석동"};
        for (String d : goyang) DONG_TO_GU.put(d, "고양시");
        // 용인시
        String[] yongin = {"수지동","동천동","상현동","성복동","죽전동","보정동","기흥동","구갈동","영덕동"};
        for (String d : yongin) DONG_TO_GU.put(d, "용인시");
        // 해운대구(부산)
        String[] haeundae = {"해운대동","우동","중동","좌동","반여동","반송동","송정동","재송동"};
        for (String d : haeundae) DONG_TO_GU.put(d, "해운대구");
    }

    @GetMapping("/districts")
    public ResponseEntity<List<String>> getDistricts() {
        return ResponseEntity.ok(new ArrayList<>(CODES.keySet()));
    }

    @GetMapping("/price")
    public ResponseEntity<Map<String, Object>> getPrice(
            @RequestParam String region,
            @RequestParam String tradeType) {

        Map<String, Object> result = new HashMap<>();
        String district = extractDistrict(region);
        String lawdCd = findCode(district);

        if (lawdCd == null) {
            result.put("found", false);
            result.put("message", "'" + district + "' 은(는) 지원하지 않는 지역입니다. 구·시 단위로 입력해주세요. (예: 강남구, 수원시)");
            return ResponseEntity.ok(result);
        }

        try {
            String ym = LocalDate.now().minusMonths(1).format(DateTimeFormatter.ofPattern("yyyyMM"));
            List<Map<String, String>> txs = fetch(lawdCd, ym, tradeType);
            if (txs.isEmpty()) {
                ym = LocalDate.now().minusMonths(2).format(DateTimeFormatter.ofPattern("yyyyMM"));
                txs = fetch(lawdCd, ym, tradeType);
            }
            if (txs.isEmpty()) {
                result.put("found", false);
                result.put("message", "해당 지역의 최근 거래 데이터가 없습니다.");
                return ResponseEntity.ok(result);
            }

            long[] prices = txs.stream()
                    .mapToLong(t -> parsePrice(t.getOrDefault("거래금액", "0")))
                    .filter(p -> p > 0).toArray();

            result.put("found", true);
            result.put("region", region);
            result.put("district", district);
            result.put("tradeType", tradeType);
            result.put("yearMonth", ym);
            result.put("count", txs.size());
            result.put("avgPrice", prices.length > 0 ? (long) Arrays.stream(prices).average().orElse(0) : 0);
            result.put("minPrice", prices.length > 0 ? Arrays.stream(prices).min().orElse(0) : 0);
            result.put("maxPrice", prices.length > 0 ? Arrays.stream(prices).max().orElse(0) : 0);
            result.put("samples", txs.subList(0, Math.min(3, txs.size())));

        } catch (Exception e) {
            result.put("found", false);
            result.put("error", e.getClass().getSimpleName() + ": " + e.getMessage());
            result.put("message", "공공데이터 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    private String extractDistrict(String region) {
        // 동 → 구/시 변환 먼저 시도
        String trimmed = region.trim();
        if (DONG_TO_GU.containsKey(trimmed)) return DONG_TO_GU.get(trimmed);
        // 끝에 동/로/길 붙은 경우도 체크
        for (Map.Entry<String, String> e : DONG_TO_GU.entrySet()) {
            if (trimmed.startsWith(e.getKey())) return e.getValue();
        }
        // 구/시/군 단위 추출
        String[] parts = trimmed.split("[\\s,]+");
        for (int i = parts.length - 1; i >= 0; i--) {
            String p = parts[i];
            if (p.endsWith("구") || p.endsWith("시") || p.endsWith("군")) return p;
        }
        return trimmed;
    }

    private String findCode(String district) {
        if (CODES.containsKey(district)) return CODES.get(district);
        for (Map.Entry<String, String> e : CODES.entrySet()) {
            if (e.getKey().startsWith(district) || district.startsWith(e.getKey())) return e.getValue();
        }
        return null;
    }

    private List<Map<String, String>> fetch(String lawdCd, String ym, String tradeType) throws Exception {
        String endpoint = tradeType.equals("매매")
                ? "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade"
                : "https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent";

        String encodedKey = URLEncoder.encode(apiKey, StandardCharsets.UTF_8);
        String url = endpoint + "?serviceKey=" + encodedKey
                + "&LAWD_CD=" + lawdCd + "&DEAL_YMD=" + ym + "&numOfRows=20&pageNo=1";

        HttpClient client = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .build();
        HttpResponse<String> res = client.send(
                HttpRequest.newBuilder().uri(URI.create(url)).GET().build(),
                HttpResponse.BodyHandlers.ofString());

        String body = res.body();
        // 에러 응답 체크
        if (body.contains("<resultCode>") && !body.contains("<resultCode>00</resultCode>")) {
            return List.of(); // API 에러 시 빈 리스트
        }
        return parseXml(body, tradeType);
    }

    private List<Map<String, String>> parseXml(String xml, String tradeType) throws Exception {
        DocumentBuilder db = DocumentBuilderFactory.newInstance().newDocumentBuilder();
        Document doc = db.parse(new InputSource(new StringReader(xml)));
        NodeList items = doc.getElementsByTagName("item");
        List<Map<String, String>> list = new ArrayList<>();

        for (int i = 0; i < items.getLength(); i++) {
            Element el = (Element) items.item(i);
            Map<String, String> t = new HashMap<>();
            String[] fields = tradeType.equals("매매")
                    ? new String[]{"거래금액", "아파트", "전용면적", "법정동"}
                    : new String[]{"보증금액", "월세금액", "아파트", "전용면적", "법정동"};
            for (String f : fields) {
                NodeList nl = el.getElementsByTagName(f);
                if (nl.getLength() > 0) t.put(f, nl.item(0).getTextContent().trim());
            }
            if (!tradeType.equals("매매")) t.put("거래금액", t.getOrDefault("보증금액", "0"));
            list.add(t);
        }
        return list;
    }

    private long parsePrice(String s) {
        try { return Long.parseLong(s.replaceAll("[^0-9]", "")); }
        catch (Exception e) { return 0L; }
    }
}
