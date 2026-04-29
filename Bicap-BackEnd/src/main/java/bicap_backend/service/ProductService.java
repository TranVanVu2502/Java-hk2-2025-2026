package bicap_backend.service;

import bicap_backend.dto.request.ProductRequest;
import bicap_backend.dto.response.ProductResponse;
import bicap_backend.enity.FarmingSeason;
import bicap_backend.enity.Product;
import bicap_backend.enums.ProductStatus;
import bicap_backend.enums.SeasonStatus;
import bicap_backend.repository.IFarmingSeasonRepository;
import bicap_backend.repository.IProductRepository;
import bicap_backend.repository.IQRCodeRepository;
import bicap_backend.enity.QRCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final IProductRepository productRepository;
    private final IFarmingSeasonRepository seasonRepository;
    private final QRService qrService;
    private final IQRCodeRepository qrCodeRepository;

    public ProductResponse create(ProductRequest request) {
        FarmingSeason season = seasonRepository.findById(request.getSeasonId())
                .orElseThrow(() -> new RuntimeException("Mùa vụ không tồn tại"));
        Product product = Product.builder()
                .season(season)
                .name(request.getName())
                .quantity(request.getQuantity())
                .price(request.getPrice())
                .status(request.getStatus() != null ? request.getStatus() : ProductStatus.HIDDEN)
                .build();

        product = productRepository.save(product);
        
        // Tự động tạo QR Code khi tạo sản phẩm mới
        qrService.generate(product.getProductId());
        
        return toResponse(product);
    }

    @Transactional(readOnly = true)
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

    @Transactional
    public void updateImage(Long id, String filePath) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        product.setImageUrl(filePath);
        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        return toResponse(product);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        if (request.getSeasonId() != null) {
            FarmingSeason season = seasonRepository.findById(request.getSeasonId())
                    .orElseThrow(() -> new RuntimeException("Mùa vụ không tồn tại"));
            product.setSeason(season);
        }

        product.setName(request.getName());
        product.setQuantity(request.getQuantity());
        product.setPrice(request.getPrice());

        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        // Nếu mùa vụ đã xuất (EXPORTED) -> Xóa mềm bằng cách ẩn đi
        if (product.getSeason() != null && product.getSeason().getStatus() == SeasonStatus.EXPORTED) {
            product.setStatus(ProductStatus.HIDDEN);
            productRepository.save(product);
        } else {
            // Nếu chưa xuất -> Cho phép xóa hẳn khỏi DB
            // Xóa QR code liên quan trước để tránh lỗi ràng buộc (nếu có)
            qrCodeRepository.findByProduct_ProductId(id).ifPresent(qrCodeRepository::delete);
            productRepository.delete(product);
        }
    }

    public ProductResponse toResponse(Product p) {
        String qrCodeStr = null;
        String blockchainHashStr = null;
        
        var qrOptional = qrCodeRepository.findByProduct_ProductId(p.getProductId());
        if (qrOptional.isPresent()) {
            QRCode qr = qrOptional.get();
            qrCodeStr = qr.getQrCode();
            blockchainHashStr = qr.getBlockchainHash();
        }

        FarmingSeason season = p.getSeason();
        Long seasonId = null;
        String seasonName = null;
        String farmName = null;
        String farmAddress = null;
        Long farmId = null;

        if (season != null) {
            seasonId = season.getSeasonId();
            seasonName = season.getName();
            if (season.getFarm() != null) {
                farmName = season.getFarm().getName();
                farmAddress = season.getFarm().getAddress();
                farmId = season.getFarm().getFarmId();
            }
        }

        return ProductResponse.builder()
                .productId(p.getProductId())
                .name(p.getName())
                .quantity(p.getQuantity())
                .price(p.getPrice())
                .imageUrl(p.getImageUrl())
                .status(p.getStatus())
                .qrCode(qrCodeStr)
                .blockchainHash(blockchainHashStr)
                .seasonId(seasonId)
                .seasonName(seasonName)
                .farmName(farmName)
                .farmAddress(farmAddress)
                .farmId(farmId)
                .build();
    }
}