package bicap_backend.dto.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class OrderDetailRequest {
    private Double price;
    private Long productId;
    private Double quantity;
}