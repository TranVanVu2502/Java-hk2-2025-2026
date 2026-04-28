package bicap_backend.controller;

import bicap_backend.dto.response.QRResponse;
import bicap_backend.service.QRService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
public class QRController {

    private final QRService qrService;

    // Tạo QR cho product — cần token (Farm Manager)
    @PostMapping("/generate/{productId}")
    public ResponseEntity<QRResponse> generate(@PathVariable Long productId) {
        return ResponseEntity.ok(qrService.generate(productId));
    }

    // Tra cứu QR — public, không cần token
    @GetMapping("/{code}")
    public ResponseEntity<QRResponse> lookup(@PathVariable String code) {
        return ResponseEntity.ok(qrService.lookup(code));
    }
}