package bicap_backend.service;

import bicap_backend.dto.response.QRResponse;
import bicap_backend.enity.FarmingSeason;
import bicap_backend.enity.Product;
import bicap_backend.enity.QRCode;
import bicap_backend.repository.IProductRepository;
import bicap_backend.repository.IQRCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QRService {

    private final IQRCodeRepository qrCodeRepository;
    private final IProductRepository productRepository;

//  Tạo qr cho product
    @Transactional
    public QRResponse generate(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        var existingQR = qrCodeRepository.findByProduct_ProductId(productId);
        if (existingQR.isPresent()) {
            return toResponse(existingQR.get());
        }

//      Tạo mã QR riêng biệt
        String code = UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        QRCode qrCode = QRCode.builder()
                .product(product)
                .qrCode(code)
                .blockchainHash(null) 
                .build();

        qrCodeRepository.save(qrCode);
        return toResponse(qrCode);
    }

//  Tra cứu QR — public, không cần token
    public QRResponse lookup(String code) {
        QRCode qrCode = qrCodeRepository.findByQrCode(code)
                .orElseThrow(() -> new RuntimeException("Mã QR không hợp lệ hoặc không tồn tại"));
        return toResponse(qrCode);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }

    private QRResponse toResponse(QRCode qr) {
        Product product = qr.getProduct();
        FarmingSeason season = product.getSeason();

        // Ưu tiên lấy Hash từ mùa vụ (niêm phong tổng), nếu không có mới lấy từ QR
        String finalHash = (season != null && season.getBlockchainHash() != null)
                ? season.getBlockchainHash()
                : qr.getBlockchainHash();

        return QRResponse.builder()
                .qrCode(qr.getQrCode())
                .blockchainHash(finalHash)
                .blockchainExplorer(finalHash != null ? "https://insight.vecha.in/#/test/transactions/" + finalHash : null)
                .productId(product.getProductId())
                .productName(product.getName())
                .quantity(product.getQuantity())
                .price(product.getPrice())
                .seasonId(season != null ? season.getSeasonId() : null)
                .seasonName(season != null ? season.getName() : null)
                .startDate(season != null ? season.getStartDate() : null)
                .endDate(season != null ? season.getEndDate() : null)
                .description(season != null ? season.getDescription() : null)
                .finalHash(season != null ? season.getLogHash() : null)
                .farmId(season != null && season.getFarm() != null ? season.getFarm().getFarmId() : null)
                .farmName(season != null && season.getFarm() != null ? season.getFarm().getName() : null)
                .farmAddress(season != null && season.getFarm() != null ? season.getFarm().getAddress() : null)
                .ownerName(season != null && season.getFarm() != null ? season.getFarm().getOwnerName() : null)
                .build();
    }
}