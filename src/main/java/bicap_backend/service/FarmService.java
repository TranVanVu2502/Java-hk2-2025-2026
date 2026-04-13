package bicap_backend.service;

import bicap_backend.dto.request.FarmRequest;
import bicap_backend.dto.response.FarmResponse;
import bicap_backend.enity.Farm;
import bicap_backend.enity.User;
import bicap_backend.enums.FarmStatus;
import bicap_backend.repository.IFarmRepository;
import bicap_backend.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmService {

    private final IFarmRepository farmRepository;
    private final IUserRepository userRepository;

    public FarmResponse registerFarm(FarmRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Farm farm = new Farm();
        farm.setUser(user);
        farm.setName(request.getName());
        farm.setAddress(request.getAddress());
        farm.setBusinessLicense(request.getBusinessLicense());
        farm.setOwnerName(request.getOwnerName());
        farm.setStatus(FarmStatus.PENDING); // Initial status

        Farm saved = farmRepository.save(farm);
        return mapToResponse(saved);
    }

    public List<FarmResponse> getMyFarms(Long userId) {
        List<Farm> farms = farmRepository.findByUserUserId(userId);
        return farms.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private FarmResponse mapToResponse(Farm farm) {
        FarmResponse res = new FarmResponse();
        res.setFarmId(farm.getFarmId());
        res.setUserId(farm.getUser().getUserId());
        res.setName(farm.getName());
        res.setAddress(farm.getAddress());
        res.setBusinessLicense(farm.getBusinessLicense());
        res.setOwnerName(farm.getOwnerName());
        res.setStatus(farm.getStatus());
        return res;
    }
}
