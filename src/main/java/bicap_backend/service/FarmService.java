package bicap_backend.service;

import bicap_backend.dto.request.FarmRequest;
import bicap_backend.dto.response.FarmResponse;
import bicap_backend.enity.Farm;
import bicap_backend.enity.User;
import bicap_backend.enums.FarmStatus;
import bicap_backend.repository.IFarmRepository;
import bicap_backend.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmService {

    private final IFarmRepository farmRepository;
    private final IUserRepository userRepository;

    @Transactional
    public FarmResponse create(FarmRequest request) {
        // Lấy email từ JWT thông qua SecurityContext
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Farm farm = Farm.builder()
                .userId(user.getUserId())
                .name(request.getName())
                .address(request.getAddress())
                .businessLicense(request.getBusinessLicense())
                .ownerName(request.getOwnerName())
                .status(FarmStatus.PENDING)
                .build();

        return toResponse(farmRepository.save(farm));
    }

    @Transactional(readOnly = true)
    public List<FarmResponse> getMyFarms() {
        // Lấy email từ JWT thông qua SecurityContext
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        return farmRepository.findByUserId(user.getUserId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FarmResponse getById(Long id) {
        // Lấy email từ JWT thông qua SecurityContext
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farm không tồn tại"));

        // Kiểm tra quyền sở hữu
        if (!farm.getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Không có quyền truy cập farm này");
        }

        return toResponse(farm);
    }

    @Transactional
    public FarmResponse update(Long id, FarmRequest request) {
        // Lấy email từ JWT thông qua SecurityContext
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farm không tồn tại"));

        // Kiểm tra quyền sở hữu
        if (!farm.getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Không có quyền cập nhật farm này");
        }

        // Cập nhật các trường được phép
        farm.setName(request.getName());
        farm.setAddress(request.getAddress());
        farm.setBusinessLicense(request.getBusinessLicense());
        farm.setOwnerName(request.getOwnerName());

        return toResponse(farmRepository.save(farm));
    }

    @Transactional
    public void delete(Long id) {
        // Lấy email từ JWT thông qua SecurityContext
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farm không tồn tại"));

        // Kiểm tra quyền sở hữu
        if (!farm.getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Không có quyền xóa farm này");
        }

        farmRepository.delete(farm);
    }

    private FarmResponse toResponse(Farm farm) {
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
