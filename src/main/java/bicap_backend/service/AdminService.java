package bicap_backend.service;

import bicap_backend.dto.request.FarmRejectRequest;
import bicap_backend.dto.response.FarmResponse;
import bicap_backend.enity.Farm;
import bicap_backend.enums.FarmStatus;
import bicap_backend.repository.IFarmRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final IFarmRepository farmRepository;


    
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

  
    // ----- CÁC HÀM MAPPER (Chuyển Entity sang Response DTO) ----- //

    private FarmResponse mapToFarmResponse(Farm farm) {
        return FarmResponse.builder()
                .farmId(farm.getFarmId())
                .userId(farm.getUser().getUserId())
                .name(farm.getName())
                .address(farm.getAddress())
                .businessLicense(farm.getBusinessLicense())
                .ownerName(farm.getOwnerName())
                .status(farm.getStatus())
                .build();
    }
}
