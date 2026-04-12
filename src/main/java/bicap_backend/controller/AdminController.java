package bicap_backend.controller;

import bicap_backend.dto.request.FarmRejectRequest;
import bicap_backend.dto.response.FarmResponse;
import bicap_backend.dto.response.StatsResponse;
import bicap_backend.dto.response.UserResponse;
import bicap_backend.enums.FarmStatus;
import bicap_backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ----- [BICAP-75] THỐNG KÊ ----- //

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ----- [BICAP-73] & [BICAP-74] QUẢN LÝ USER ----- //

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{userId}/lock")
    public ResponseEntity<UserResponse> toggleUserLock(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.toggleUserLock(userId));
    }


    // ----- [BICAP-70], [BICAP-71], [BICAP-72] QUẢN LÝ TÀI KHOẢN FARM ----- //

    @GetMapping("/farms")
    public ResponseEntity<List<FarmResponse>> getAllFarms(@RequestParam(required = false) FarmStatus status) {
        if (status != null) {
            return ResponseEntity.ok(adminService.getFarmsByStatus(status));
        }
        return ResponseEntity.ok(adminService.getAllFarms());
    }

    @PutMapping("/farms/{farmId}/approve")
    public ResponseEntity<FarmResponse> approveFarm(@PathVariable Long farmId) {
        return ResponseEntity.ok(adminService.approveFarm(farmId));
    }

    @PutMapping("/farms/{farmId}/reject")
    public ResponseEntity<FarmResponse> rejectFarm(
            @PathVariable Long farmId,
            @RequestBody FarmRejectRequest request) {
        return ResponseEntity.ok(adminService.rejectFarm(farmId, request));
    }
}
