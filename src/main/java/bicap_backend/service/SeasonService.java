package bicap_backend.service;

import bicap_backend.dto.request.SeasonRequest;
import bicap_backend.dto.response.SeasonResponse;
import bicap_backend.enity.Farm;
import bicap_backend.enity.Season;
import bicap_backend.enity.User;
import bicap_backend.enums.SeasonStatus;
import bicap_backend.repository.IFarmRepository;
import bicap_backend.repository.ISeasonRepository;
import bicap_backend.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeasonService {

    private final ISeasonRepository seasonRepository;
    private final IFarmRepository farmRepository;
    private final IUserRepository userRepository;

    // ─────────────────────────────────────────────────────────────
    // TẠO MÙA VỤ MỚI
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public SeasonResponse create(SeasonRequest request) {
        // Lấy user hiện tại từ JWT
        User user = getCurrentUser();

        // Kiểm tra farm tồn tại và thuộc về user này
        Farm farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new RuntimeException("Farm không tồn tại"));

        if (!farm.getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Không có quyền tạo mùa vụ cho farm này");
        }

        Season season = Season.builder()
                .farmId(farm.getFarmId())
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(SeasonStatus.IN_PROGRESS)
                .build();

        return toResponse(seasonRepository.save(season));
    }

    // ─────────────────────────────────────────────────────────────
    // CẬP NHẬT THÔNG TIN MÙA VỤ
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public SeasonResponse update(Long seasonId, SeasonRequest request) {
        // Lấy user hiện tại từ JWT
        User user = getCurrentUser();

        Season season = seasonRepository.findById(seasonId)
                .orElseThrow(() -> new RuntimeException("Mùa vụ không tồn tại"));

        // Kiểm tra farm của mùa vụ thuộc về user này
        Farm farm = farmRepository.findById(season.getFarmId())
                .orElseThrow(() -> new RuntimeException("Farm không tồn tại"));

        if (!farm.getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Không có quyền cập nhật mùa vụ này");
        }

        // Chỉ được cập nhật khi mùa vụ đang IN_PROGRESS
        if (season.getStatus() != SeasonStatus.IN_PROGRESS) {
            throw new RuntimeException("Chỉ có thể cập nhật mùa vụ đang IN_PROGRESS");
        }

        // Cập nhật các trường được phép
        season.setName(request.getName());
        season.setStartDate(request.getStartDate());
        season.setEndDate(request.getEndDate());

        return toResponse(seasonRepository.save(season));
    }

    // ─────────────────────────────────────────────────────────────
    // XUẤT MÙA VỤ (chuyển status → EXPORTED)
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public SeasonResponse export(Long seasonId) {
        // Lấy user hiện tại từ JWT
        User user = getCurrentUser();

        Season season = seasonRepository.findById(seasonId)
                .orElseThrow(() -> new RuntimeException("Mùa vụ không tồn tại"));

        // Kiểm tra quyền sở hữu
        Farm farm = farmRepository.findById(season.getFarmId())
                .orElseThrow(() -> new RuntimeException("Farm không tồn tại"));

        if (!farm.getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Không có quyền xuất mùa vụ này");
        }

        // Chỉ được export khi đang IN_PROGRESS
        if (season.getStatus() != SeasonStatus.IN_PROGRESS) {
            throw new RuntimeException("Chỉ có thể xuất mùa vụ đang IN_PROGRESS");
        }

        season.setStatus(SeasonStatus.EXPORTED);

        return toResponse(seasonRepository.save(season));
    }

    // ─────────────────────────────────────────────────────────────
    // LẤY DANH SÁCH MÙA VỤ THEO FARM
    // ─────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<SeasonResponse> getByFarmId(Long farmId) {
        // Kiểm tra farm tồn tại
        farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm không tồn tại"));

        return seasonRepository.findByFarmId(farmId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // LẤY CHI TIẾT MÙA VỤ THEO ID
    // ─────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public SeasonResponse getById(Long seasonId) {
        Season season = seasonRepository.findById(seasonId)
                .orElseThrow(() -> new RuntimeException("Mùa vụ không tồn tại"));

        return toResponse(season);
    }

    // ─────────────────────────────────────────────────────────────
    // HELPER: Lấy User từ SecurityContext (JWT)
    // ─────────────────────────────────────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
    }

    // ─────────────────────────────────────────────────────────────
    // HELPER: Map entity → response DTO
    // ─────────────────────────────────────────────────────────────
    private SeasonResponse toResponse(Season season) {
        return SeasonResponse.builder()
                .seasonId(season.getSeasonId())
                .farmId(season.getFarmId())
                .name(season.getName())
                .startDate(season.getStartDate())
                .endDate(season.getEndDate())
                .status(season.getStatus())
                .blockchainHash(season.getBlockchainHash())
                .build();
    }
}
