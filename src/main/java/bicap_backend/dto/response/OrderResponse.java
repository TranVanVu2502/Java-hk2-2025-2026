package bicap_backend.dto.response;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long orderId;
    private Long retailerId;
    private Long farmId;
    private String status;
    private List<String> products;
}