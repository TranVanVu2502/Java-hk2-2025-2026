package bicap_backend.controller;

import bicap_backend.dto.request.SeasonExportRequest;
import bicap_backend.dto.request.SeasonRequest;
import bicap_backend.dto.response.SeasonResponse;
import bicap_backend.service.SeasonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SeasonController {

    private final SeasonService seasonService;

    // BICAP-62: POST /api/farms/{id}/seasons — Tạo mùa vụ mới cho farm
    @PostMapping("/api/farms/{farmId}/seasons")
    public ResponseEntity<SeasonResponse> create(
            @PathVariable Long farmId,
            @RequestBody SeasonRequest request) {
        return ResponseEntity.ok(seasonService.create(farmId, request));
    }

    // BICAP-63: GET /api/farms/{id}/seasons — Danh sách mùa vụ của farm
    @GetMapping("/api/farms/{farmId}/seasons")
    public ResponseEntity<List<SeasonResponse>> getByFarmId(@PathVariable Long farmId) {
        return ResponseEntity.ok(seasonService.getByFarmId(farmId));
    }

    // BICAP-64: GET /api/seasons/{id} — Chi tiết mùa vụ
    @GetMapping("/api/seasons/{id}")
    public ResponseEntity<SeasonResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(seasonService.getById(id));
    }

    // BICAP-65: PUT /api/seasons/{id} — Cập nhật quy trình mùa vụ
    @PutMapping("/api/seasons/{id}")
    public ResponseEntity<SeasonResponse> update(
            @PathVariable Long id,
            @RequestBody SeasonRequest request) {
        return ResponseEntity.ok(seasonService.update(id, request));
    }

    @PostMapping("/api/seasons/{id}/export") 
    public ResponseEntity<SeasonResponse> export(
            @PathVariable Long id,
            @RequestBody SeasonExportRequest request) {
        return ResponseEntity.ok(seasonService.export(id, request.getTxId()));
    }
}
