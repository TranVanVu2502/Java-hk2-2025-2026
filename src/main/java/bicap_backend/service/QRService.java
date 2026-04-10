package bicap_backend.service;

import bicap_backend.dto.response.QRResponse;
import bicap_backend.enity.Product;
import bicap_backend.enity.QRCode;
import bicap_backend.repository.IProductRepository;
import bicap_backend.repository.IQRCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QRService {

    private final IQRCodeRepository qrCodeRepository;
    private final IProductRepository productRepository;

    @Transactional
    public QRResponse generate(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        if (qrCodeRepository.findByProduct_ProductId(productId).isPresent()) {
            throw new RuntimeException("Sản phẩm này đã có QR Code");
        }

        String code = UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        QRCode qrCode = QRCode.builder()
                .product(product)
                .qrCode(code)
//              TODO: Thông tin về blockchain
                .build();

        qrCodeRepository.save(qrCode);
        return toResponse(qrCode);
    }

    public QRResponse lookup(String code) {
        QRCode qrCode = qrCodeRepository.findByQrCode(code)
                .orElseThrow(() -> new RuntimeException("Mã QR không tồn tại"));
        return toResponse(qrCode);
    }

    private QRResponse toResponse(QRCode qr) {
        return QRResponse.builder()
                .qrCode(qr.getQrCode())
                .productId(qr.getProduct().getProductId())
                .productName(qr.getProduct().getName())
                // TODO: Data nguồn gốc
                .build();
    }
}