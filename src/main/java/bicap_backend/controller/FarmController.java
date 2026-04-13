package bicap_backend.controller;

import bicap_backend.dto.request.FarmRequest;
import bicap_backend.dto.response.FarmResponse;
import bicap_backend.service.FarmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farm")
@RequiredArgsConstructor
public class FarmController {

    private final FarmService farmService;

    @PostMapping("/register")
    public ResponseEntity<FarmResponse> registerFarm(@RequestBody FarmRequest request) {
        return ResponseEntity.ok(farmService.registerFarm(request));
    }

    @GetMapping("/my-farms/{userId}")
    public ResponseEntity<List<FarmResponse>> getMyFarms(@PathVariable Long userId) {
        return ResponseEntity.ok(farmService.getMyFarms(userId));
    }
}
