package bicap_backend.dto.request;

import lombok.Data;

@Data
public class OrderDetailRequest {
    private Long productId;
    private Integer quantity;
}