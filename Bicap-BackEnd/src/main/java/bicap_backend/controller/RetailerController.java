package bicap_backend.controller;

import bicap_backend.dto.request.RetailerRequest;
import bicap_backend.dto.response.RetailerResponse;
import bicap_backend.service.RetailerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/retailers")
@RequiredArgsConstructor
public class RetailerController {

    private final RetailerService retailerService;

    @PostMapping
    @PreAuthorize("hasRole('RETAILER')")
    public ResponseEntity<RetailerResponse> create(@RequestBody RetailerRequest request) {
        return ResponseEntity.ok(retailerService.create(request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('RETAILER')")
    public ResponseEntity<RetailerResponse> getMyInfo() {
        return ResponseEntity.ok(retailerService.getMyInfo());
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('RETAILER')")
    public ResponseEntity<RetailerResponse> updateMyInfo(@RequestBody RetailerRequest request) {
        return ResponseEntity.ok(retailerService.updateMyInfo(request));
    }
}