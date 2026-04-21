package bicap_backend.controller;

import bicap_backend.dto.request.FarmRequest;
import bicap_backend.dto.response.FarmResponse;
import bicap_backend.service.FarmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farms")
@RequiredArgsConstructor
public class FarmController {

    private final FarmService farmService;

    @PostMapping
    public ResponseEntity<FarmResponse> create(@RequestBody FarmRequest request) {
        return ResponseEntity.ok(farmService.create(request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<FarmResponse>> getMyFarms() {
        return ResponseEntity.ok(farmService.getMyFarms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FarmResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(farmService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FarmResponse> update(@PathVariable Long id, @RequestBody FarmRequest request) {
        return ResponseEntity.ok(farmService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        farmService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
