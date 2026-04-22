package bicap_backend.dto.response;
import bicap_backend.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderResponse {
    private Long orderId;
    private OrderStatus status;
    private Long retailerId;
    private Long farmId;
    private String Status;
    private List<String> products;
    private String farmName;
    private LocalDateTime createdAt;
    private List<OrderDetailResponse> orderDetails;
}