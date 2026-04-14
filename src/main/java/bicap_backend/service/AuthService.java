package bicap_backend.service;

import bicap_backend.dto.request.LoginRequest;
import bicap_backend.dto.request.RegisterRequest;
import bicap_backend.dto.response.AuthResponse;
import bicap_backend.enity.User;
import bicap_backend.repository.IUserRepository;
import bicap_backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng: " + request.getEmail());
        }

        // Tạo user mới
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();

        userRepository.save(user);

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Tìm user theo email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        // Kiểm tra password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu không đúng");
        }

        // Kiểm tra tài khoản còn active không
        if (!user.isEnabled()) {
            throw new RuntimeException("Tài khoản đã bị khoá");
        }

        return generateAuthResponse(user);
    }

//    Tạo token
    private AuthResponse generateAuthResponse(User user) {
        String token = jwtTokenProvider.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
