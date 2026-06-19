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

    private static final Map<String, String> CODES = new LinkedHashMap<>();

    static {
        // 서울 25구
        CODES.put("종로구", "11110"); CODES.put("중구", "11140"); CODES.put("용산구", "11170");
        CODES.put("성동구", "11200"); CODES.put("광진구", "11215"); CODES.put("동대문구", "11230");
        CODES.put("중랑구", "11260"); CODES.put("성북구", "11290"); CODES.put("강북구", "11305");
        CODES.put("도봉구", "11320"); CODES.put("노원구", "11350"); CODES.put("은평구", "11380");
        CODES.put("서대문구", "11410"); CODES.put("마포구", "11440"); CODES.put("양천구", "11470");
        CODES.put("강서구", "11500"); CODES.put("구로구", "11530"); CODES.put("금천구", "11545");
        CODES.put("영등포구", "11560"); CODES.put("동작구", "11590"); CODES.put("관악구", "11620");
        CODES.put("서초구", "11650"); CODES.put("강남구", "11680"); CODES.put("송파구", "11710");
        CODES.put("강동구", "11740");
        // 경기
        CODES.put("수원시", "41110"); CODES.put("성남시", "41130"); CODES.put("분당구", "41135");
        CODES.put("고양시", "41280"); CODES.put("용인시", "41460"); CODES.put("부천시", "41190");
        CODES.put("안산시", "41270"); CODES.put("안양시", "41170"); CODES.put("남양주시", "41360");
        CODES.put("화성시", "41590"); CODES.put("평택시", "41220"); CODES.put("의정부시", "41150");
        CODES.put("시흥시", "41390"); CODES.put("파주시", "41480"); CODES.put("김포시", "41570");
        CODES.put("광명시", "41210"); CODES.put("하남시", "41450"); CODES.put("군포시", "41410");
        CODES.put("광주시", "41610"); CODES.put("이천시", "41500"); CODES.put("오산시", "41370");
        // 인천
        CODES.put("남동구", "28200"); CODES.put("부평구", "28237"); CODES.put("계양구", "28245");
        CODES.put("연수구", "28185"); CODES.put("미추홀구", "28177");
        // 부산
        CODES.put("해운대구", "26350"); CODES.put("부산진구", "26230"); CODES.put("동래구", "26260");
        CODES.put("수영구", "26500"); CODES.put("사하구", "26380"); CODES.put("금정구", "26410");
        CODES.put("연제구", "26470"); CODES.put("사상구", "26530"); CODES.put("북구", "26320");
        // 대구
        CODES.put("수성구", "27200"); CODES.put("달서구", "27290"); CODES.put("달성군", "27710");
        // 대전
        CODES.put("유성구", "30200"); CODES.put("대덕구", "30230");
        // 광주
        CODES.put("광산구", "29200"); CODES.put("북구", "29155");
        // 울산
        CODES.put("울주군", "31710"); CODES.put("남구", "31140");
        // 세종
        CODES.put("세종시", "36110");
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
            result.put("message", "'" + district + "' 지역 코드를 찾을 수 없어요. 구·시 단위로 입력해주세요. (예: 강남구, 수원시)");
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
            result.put("message", "조회 오류: " + e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    private String extractDistrict(String region) {
        String[] parts = region.trim().split("[\\s,]+");
        for (int i = parts.length - 1; i >= 0; i--) {
            String p = parts[i];
            if (p.endsWith("구") || p.endsWith("시") || p.endsWith("군")) return p;
        }
        return region.trim();
    }

    private String findCode(String district) {
        if (CODES.containsKey(district)) return CODES.get(district);
        for (Map.Entry<String, String> e : CODES.entrySet()) {
            if (e.getKey().startsWith(district)) return e.getValue();
        }
        return null;
    }

    private List<Map<String, String>> fetch(String lawdCd, String ym, String tradeType) throws Exception {
        String endpoint = tradeType.equals("매매")
                ? "http://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTrade"
                : "http://apis.data.go.kr/1613000/RTMSDataSvcAptRentDev/getRTMSDataSvcAptRent";

        String encodedKey = URLEncoder.encode(apiKey, StandardCharsets.UTF_8);
        String url = endpoint + "?serviceKey=" + encodedKey
                + "&LAWD_CD=" + lawdCd + "&DEAL_YMD=" + ym + "&numOfRows=20&pageNo=1";

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> res = client.send(
                HttpRequest.newBuilder().uri(URI.create(url)).GET().build(),
                HttpResponse.BodyHandlers.ofString());

        return parseXml(res.body(), tradeType);
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
