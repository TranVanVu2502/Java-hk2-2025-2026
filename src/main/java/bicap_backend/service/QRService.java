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

        if (qrCodeRepository.findByProduct_ProductId(productId).isPresent()) {
            throw new RuntimeException("Sản phẩm này đã có QR Code");
        }

//      Tạo mã QR riêng biệt
        String code = UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        // Mock blockchain hash bằng SHA-256
        String hash = sha256(product.getName() + product.getProductId() + code);

        QRCode qrCode = QRCode.builder()
                .product(product)
                .qrCode(code)
                .blockchainHash(hash)
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
        return QRResponse.builder()
                .qrCode(qr.getQrCode())
                .blockchainHash(qr.getBlockchainHash())
                .productId(product.getProductId())
                .productName(product.getName())
                .quantity(product.getQuantity())
                .price(product.getPrice())
                .seasonId(season.getSeasonId())
                .seasonName(season.getName())
                .startDate(season.getStartDate())
                .endDate(season.getEndDate())
                .description(season.getDescription())
                .farmId(season.getFarm().getFarmId())
                .farmName(season.getFarm().getName())
                .farmAddress(season.getFarm().getAddress())
                .ownerName(season.getFarm().getOwnerName())
                .build();
    }
}