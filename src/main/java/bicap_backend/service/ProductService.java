package bicap_backend.service;

import bicap_backend.dto.request.ProductRequest;
import bicap_backend.dto.response.ProductResponse;
import bicap_backend.enity.FarmingSeason;
import bicap_backend.enity.Product;
import bicap_backend.enums.ProductStatus;
import bicap_backend.repository.IFarmingSeasonRepository;
import bicap_backend.repository.IProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final IProductRepository productRepository;
    private final IFarmingSeasonRepository seasonRepository;

    public ProductResponse create(ProductRequest request) {
        FarmingSeason season = seasonRepository.findById(request.getSeasonId())
                .orElseThrow(() -> new RuntimeException("Mùa vụ không tồn tại"));
        Product product = Product.builder()
                .season(season)
                .name(request.getName())
                .quantity(request.getQuantity())
                .price(request.getPrice())
                .status(ProductStatus.AVAILABLE)
                .build();

        return toResponse(product);
    }

    public Page<ProductResponse> getAll(String name, Pageable pageable) {
        if (name != null && !name.isBlank()) {
            return productRepository
                    .findByNameContainingIgnoreCaseAndStatus(name, ProductStatus.AVAILABLE, pageable)
                    .map(this::toResponse);
        }
        return productRepository
                .findByStatus(ProductStatus.AVAILABLE, pageable)
                .map(this::toResponse);
    }

    public ProductResponse getById(Long id) {
//      TODO: LOGIC TÌM SẢN PHẨM THEO ID
        return null;
    }

    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .productId(p.getProductId())
                .name(p.getName())
                .quantity(p.getQuantity())
                .price(p.getPrice())
                .status(p.getStatus())
                .seasonId(p.getSeason().getSeasonId())
                .seasonName(p.getSeason().getName())
                .farmName(p.getSeason().getFarm().getName())
                .farmAddress(p.getSeason().getFarm().getAddress())
                .build();
    }
}

