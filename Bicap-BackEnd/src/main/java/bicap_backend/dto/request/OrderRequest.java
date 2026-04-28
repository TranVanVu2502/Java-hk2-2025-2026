package bicap_backend.dto.request;

import bicap_backend.enums.OrderStatus;
import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private Long retailerId;
    private OrderStatus status;
    private Long farmId;
    private List<OrderDetailRequest> items;
}