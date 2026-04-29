package bicap_backend.service;

import bicap_backend.dto.request.RetailerRequest;
import bicap_backend.dto.response.RetailerResponse;
import bicap_backend.enity.Retailer;
import bicap_backend.enity.User;
import bicap_backend.repository.IRetailerRepository;
import bicap_backend.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RetailerService {

    private final IRetailerRepository retailerRepository;
    private final IUserRepository userRepository;

    public RetailerResponse create(RetailerRequest request) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (retailerRepository.findByUserUserId(user.getUserId()).isPresent()) {
            throw new RuntimeException("User đã đăng ký retailer rồi");
        }

        Retailer retailer = new Retailer();
        retailer.setUser(user);
        retailer.setName(request.getName());
        retailer.setBusinessLicense(request.getBusinessLicense());
        retailer.setAddress(request.getAddress());

        Retailer saved = retailerRepository.save(retailer);

        return RetailerResponse.builder()
                .retailerId(saved.getRetailerId())
                .name(saved.getName())
                .businessLicense(saved.getBusinessLicense())
                .address(saved.getAddress())
                .build();
    }

    public RetailerResponse getMyInfo() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        java.util.Optional<Retailer> opt = retailerRepository.findByUserUserId(user.getUserId());
        if (opt.isEmpty()) {
            return null;
        }
        Retailer retailer = opt.get();

        return RetailerResponse.builder()
                .retailerId(retailer.getRetailerId())
                .name(retailer.getName())
                .businessLicense(retailer.getBusinessLicense())
                .address(retailer.getAddress())
                .build();
    }

    public RetailerResponse updateMyInfo(RetailerRequest request) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        java.util.Optional<Retailer> opt = retailerRepository.findByUserUserId(user.getUserId());
        Retailer retailer;
        if (opt.isEmpty()) {
            retailer = new Retailer();
            retailer.setUser(user);
        } else {
            retailer = opt.get();
        }

        retailer.setName(request.getName());
        retailer.setBusinessLicense(request.getBusinessLicense());
        retailer.setAddress(request.getAddress());

        Retailer saved = retailerRepository.save(retailer);

        return RetailerResponse.builder()
                .retailerId(saved.getRetailerId())
                .name(saved.getName())
                .businessLicense(saved.getBusinessLicense())
                .address(saved.getAddress())
                .build();
    }
}