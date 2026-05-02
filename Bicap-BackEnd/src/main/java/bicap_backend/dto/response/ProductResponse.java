package bicap_backend.dto.response;

import bicap_backend.enums.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long productId;
    private String imageUrl;
    private String name;
    private Double quantity;
    private Double price;
    private ProductStatus status;
    private String qrCode;
    private String blockchainHash;
    private String finalHash;
    private Long seasonId;
    private String seasonName;
    private String farmName;
    private String farmAddress;
    private Long farmId;
}