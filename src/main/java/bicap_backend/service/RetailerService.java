package bicap_backend.service;

import bicap_backend.dto.request.RetailerRequest;
import bicap_backend.dto.response.RetailerResponse;
import bicap_backend.enity.Retailer;
import bicap_backend.enity.User;
import bicap_backend.repository.IRetailerRepository;
import bicap_backend.repository.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RetailerService {

    @Autowired
    private IRetailerRepository retailerRepository;

    @Autowired
    private IUserRepository userRepository;

    // ===== 1. Đăng ký retailer =====
    public RetailerResponse register(RetailerRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (retailerRepository.findByUser_UserId(request.getUserId()).isPresent()) {
            throw new RuntimeException("User đã đăng ký retailer rồi");
        }

        Retailer retailer = new Retailer();
        retailer.setUser(user);
        retailer.setName(request.getName());
        retailer.setBusinessLicense(request.getBusinessLicense());
        retailer.setAddress(request.getAddress());

        Retailer saved = retailerRepository.save(retailer);

        // map sang response
        RetailerResponse res = new RetailerResponse();
        res.setRetailerId(saved.getRetailerId());
        res.setUserId(saved.getUser().getUserId());
        res.setName(saved.getName());
        res.setBusinessLicense(saved.getBusinessLicense());
        res.setAddress(saved.getAddress());

        return res;

    }

    // ===== 2. Lấy info của chính mình =====
    public RetailerResponse getMyInfo(Long userId) {

        Retailer retailer = retailerRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new RuntimeException("Retailer không tồn tại"));

        RetailerResponse res = new RetailerResponse();
        res.setRetailerId(retailer.getRetailerId());
        res.setUserId(retailer.getUser().getUserId());
        res.setName(retailer.getName());
        res.setBusinessLicense(retailer.getBusinessLicense());
        res.setAddress(retailer.getAddress());

        return res;
    }
}