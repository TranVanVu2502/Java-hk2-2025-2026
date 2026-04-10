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
    private String name;
    private Double quantity;
    private Double price;
    private ProductStatus status;
    private Long seasonId;
    private String seasonName;
    private String farmName;
    private String farmAddress;
}
