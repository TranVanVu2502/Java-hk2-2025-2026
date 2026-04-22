package bicap_backend.service;

import bicap_backend.dto.request.FarmRejectRequest;
import bicap_backend.dto.response.FarmResponse;
import bicap_backend.dto.response.StatsResponse;
import bicap_backend.dto.response.UserResponse;
import bicap_backend.enity.Farm;
import bicap_backend.enity.User;
import bicap_backend.enums.FarmStatus;
import bicap_backend.repository.IFarmRepository;
import bicap_backend.repository.IUserRepository;
import bicap_backend.repository.IOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final IFarmRepository farmRepository;
    private final IUserRepository userRepository;
    private final IOrderRepository orderRepository;

    // ----- QUẢN LÝ DỮ LIỆU THỐNG KÊ ----- //

    public StatsResponse getDashboardStats() {
        long totalFarms = farmRepository.count();
        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();

        return StatsResponse.builder()
                .totalFarms(totalFarms)
                .totalUsers(totalUsers)
                .totalOrders(totalOrders)
                .build();
    }

    // ----- QUẢN LÝ USER ----- //

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse toggleUserLock(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + userId));

        // Đảo ngược trạng thái khóa (true -> false, false -> true)
        user.setActive(!user.isActive());
        return mapToUserResponse(userRepository.save(user));
    }

    // ----- QUẢN LÝ FARM (NHÀ VƯỜN) ----- //

    public List<FarmResponse> getAllFarms() {
        return farmRepository.findAll().stream()
                .map(this::mapToFarmResponse)
                .collect(Collectors.toList());
    }

    public List<FarmResponse> getFarmsByStatus(FarmStatus status) {
        return farmRepository.findByStatus(status).stream()
                .map(this::mapToFarmResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public FarmResponse approveFarm(Long farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Farm với ID: " + farmId));

        farm.setStatus(FarmStatus.APPROVED);
        return mapToFarmResponse(farmRepository.save(farm));
    }

    @Transactional
    public FarmResponse rejectFarm(Long farmId, FarmRejectRequest request) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Farm với ID: " + farmId));

        farm.setStatus(FarmStatus.REJECTED);
        // Lưu lý do từ chối (Ví dụ in ra log hoặc gửi Email)
        System.out.println("Từ chối Farm " + farmId + " vì lý do: " + request.getReason());

        return mapToFarmResponse(farmRepository.save(farm));
    }

    // ----- CÁC HÀM MAPPER (Chuyển Entity sang Response DTO) ----- //

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private FarmResponse mapToFarmResponse(Farm farm) {
        return FarmResponse.builder()
                .farmId(farm.getFarmId())
                .name(farm.getName())
                .address(farm.getAddress())
                .businessLicense(farm.getBusinessLicense())
                .ownerName(farm.getOwnerName())
                .status(farm.getStatus())
                .build();
    }
}
