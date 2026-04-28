package bicap_backend.dto.request;

import lombok.Data;

@Data
public class ProductRequest {
    private String imageUrl;
    private Long seasonId;
    private String name;
    private Double quantity;
    private Double price;
}
