package bicap_backend.enity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "qr_code")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QRCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "qr_id")
    private Long qrId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(name = "qr_code", nullable = false, length = 500)
    private String qrCode;

    @Column(name = "blockchain_hash", length = 255)
    private String blockchainHash;
}