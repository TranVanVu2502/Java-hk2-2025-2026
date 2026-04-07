package bicap_backend.repository;

import bicap_backend.enity.QRCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IQRCodeRepository extends JpaRepository<QRCode, Long> {

    Optional<QRCode> findByQrCode(String qrCode);

    Optional<QRCode> findByProduct_ProductId(Long productId);
}