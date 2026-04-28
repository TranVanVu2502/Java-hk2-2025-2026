package bicap_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QRResponse {
    private String qrCode;
    private String blockchainHash;

    private Long productId;
    private String productName;
    private Double quantity;
    private Double price;

    private Long seasonId;
    private String seasonName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;

    private Long farmId;
    private String farmName;
    private String farmAddress;
    private String ownerName;
}
