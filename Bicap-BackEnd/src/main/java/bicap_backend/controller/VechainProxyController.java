package bicap_backend.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/api/blockchain")
@CrossOrigin(origins = "*")
public class VechainProxyController {

    private final RestTemplate restTemplate = new RestTemplate();
    
    // Danh sách các Node dự phòng để đảm bảo luôn kết nối được
    private final String[] NODES = {
        "https://testnet.veblocks.io/transactions/",
        "https://sync-testnet.vechain.org/transactions/",
        "https://node-testnet.vechain.energy/transactions/"
    };

    @GetMapping("/verify/{txHash}")
    public ResponseEntity<Object> verify(@PathVariable String txHash) {
        List<String> errors = new ArrayList<>();
        
        for (String nodeBase : NODES) {
            try {
                String url = nodeBase + txHash;
                HttpHeaders headers = new HttpHeaders();
                headers.set("User-Agent", "Mozilla/5.0");
                HttpEntity<String> entity = new HttpEntity<>(headers);

                ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.GET, entity, Object.class);
                if (response.getStatusCode() == HttpStatus.OK) {
                    return ResponseEntity.ok(response.getBody());
                }
            } catch (Exception e) {
                errors.add(nodeBase + ": " + e.getMessage());
            }
        }

        // Nếu tất cả các node đều thất bại
        Map<String, Object> errorMap = new HashMap<>();
        errorMap.put("error", "Không thể kết nối tới mạng lưới Blockchain");
        errorMap.put("status", "error");
        errorMap.put("details", errors);
        return ResponseEntity.ok(errorMap);
    }
}
