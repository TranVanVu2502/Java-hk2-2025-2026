package bicap_backend.service;

import bicap_backend.dto.request.SeasonRequest;
import bicap_backend.dto.response.ProductResponse;
import bicap_backend.dto.response.SeasonResponse;
import bicap_backend.enity.Farm;
import bicap_backend.enity.FarmingSeason;
import bicap_backend.enity.Product;
import bicap_backend.enity.User;
import bicap_backend.enums.ProductStatus;
import bicap_backend.enums.SeasonStatus;
import bicap_backend.repository.IFarmRepository;
import bicap_backend.repository.IFarmingSeasonRepository;
import bicap_backend.repository.IProductRepository;
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

    private final IFarmingSeasonRepository seasonRepository;
    private final IFarmRepository farmRepository;
    private final IUserRepository userRepository;
    private final IProductRepository productRepository;
    private final IQRCodeRepository qrCodeRepository;
    private final ProductService productService;

    @Transactional
    public SeasonResponse create(Long farmId, SeasonRequest request) {
        User user = getCurrentUser();
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm không tồn tại"));

        if (!farm.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Không có quyền tạo mùa vụ cho farm này");
        }

        FarmingSeason season = FarmingSeason.builder()
                .farm(farm)
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .description(request.getDescription())
                .status(SeasonStatus.IN_PROGRESS)
                .build();

        return toResponse(seasonRepository.save(season));
    }

    @Transactional(readOnly = true)
    public List<SeasonResponse> getByFarmId(Long farmId) {
        farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm không tồn tại"));

        return seasonRepository.findByFarmFarmId(farmId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SeasonResponse getById(Long seasonId) {
        FarmingSeason season = seasonRepository.findById(seasonId)
                .orElseThrow(() -> new RuntimeException("Mùa vụ không tồn tại"));

        return toResponse(season);
    }

    @Transactional
    public SeasonResponse update(Long seasonId, SeasonRequest request) {
        User user = getCurrentUser();
        FarmingSeason season = seasonRepository.findById(seasonId)
                .orElseThrow(() -> new RuntimeException("Mùa vụ không tồn tại"));

        Farm farm = farmRepository.findById(season.getFarm().getFarmId())
                .orElseThrow(() -> new RuntimeException("Farm không tồn tại"));

        if (!farm.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Không có quyền cập nhật mùa vụ này");
        }

        if (season.getStatus() == SeasonStatus.EXPORTED) {
            throw new RuntimeException("Không thể cập nhật mùa vụ đã niêm phong (EXPORTED)");
        }

        season.setName(request.getName());
        season.setStartDate(request.getStartDate());
        season.setEndDate(request.getEndDate());
        season.setDescription(request.getDescription());

        if (request.getStatus() != null) {
            season.setStatus(request.getStatus());
            if (request.getStatus() == SeasonStatus.HARVESTED && season.getEndDate() == null) {
                season.setEndDate(java.time.LocalDate.now());
            }
        }

        return toResponse(seasonRepository.save(season));
    }

    @Transactional
    public SeasonResponse export(Long seasonId, String txId, String logHash) { 
        User user = getCurrentUser();
        FarmingSeason season = seasonRepository.findById(seasonId)
                .orElseThrow(() -> new RuntimeException("Mùa vụ không tồn tại"));

        Farm farm = farmRepository.findById(season.getFarm().getFarmId())
                .orElseThrow(() -> new RuntimeException("Farm không tồn tại"));

        if (!farm.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Không có quyền xuất mùa vụ này");
        }

        if (season.getStatus() == SeasonStatus.EXPORTED) {
            throw new RuntimeException("Mùa vụ này đã được niêm phong rồi");
        }

        season.setBlockchainHash(txId);
        season.setLogHash(logHash);
        season.setStatus(SeasonStatus.EXPORTED);
        seasonRepository.save(season);

        // Lưu TxID vào từng mã QR của sản phẩm để "niêm phong" sản phẩm đó vĩnh viễn với giao dịch này
        List<Product> products = productRepository.findBySeasonSeasonId(seasonId);
        for (Product product : products) {
            product.setStatus(ProductStatus.AVAILABLE);
            
            // Cập nhật hash vào QR Code
            qrCodeRepository.findByProduct_ProductId(product.getProductId()).ifPresent(qr -> {
                qr.setBlockchainHash(txId);
                qrCodeRepository.save(qr);
            });
        }
        productRepository.saveAll(products);

        return toResponse(season);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
    }

    private SeasonResponse toResponse(FarmingSeason season) {
        List<ProductResponse> productResponses = productRepository.findBySeasonSeasonId(season.getSeasonId())
                .stream()
                .map(productService::toResponse)
                .collect(Collectors.toList());

        return SeasonResponse.builder()
                .seasonId(season.getSeasonId())
                .farmId(season.getFarm().getFarmId())
                .name(season.getName())
                .startDate(season.getStartDate())
                .endDate(season.getEndDate())
                .description(season.getDescription())
                .status(season.getStatus())
                .blockchainHash(season.getBlockchainHash())
                .logHash(season.getLogHash())
                .products(productResponses)
                .build();
    }
}
