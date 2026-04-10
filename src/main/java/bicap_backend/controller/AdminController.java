package bicap_backend.controller;

import bicap_backend.dto.response.FarmResponse;
import bicap_backend.enums.FarmStatus;
import bicap_backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // Chỉ có Admin mới được vào các API này
public class AdminController {

    private final AdminService adminService;

    // ----- [BICAP-70], [BICAP-71], [BICAP-72] QUẢN LÝ TÀI KHOẢN FARM ----- //

    @GetMapping("/farms")
    public ResponseEntity<List<FarmResponse>> getAllFarms(@RequestParam(required = false) FarmStatus status) {
        if (status != null) {
            return ResponseEntity.ok(adminService.getFarmsByStatus(status));
        }
        return ResponseEntity.ok(adminService.getAllFarms());
    }

    
}
