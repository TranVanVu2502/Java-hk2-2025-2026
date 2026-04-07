package bicap_backend.controller;

import bicap_backend.dto.request.LoginRequest;
import bicap_backend.dto.request.RegisterRequest;
import bicap_backend.dto.response.AuthResponse;
import bicap_backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        // Client tự xoá token ở FE
        return ResponseEntity.ok("Đăng xuất thành công");
    }
}
