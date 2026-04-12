package bicap_backend.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private Long retailerId;
    private Long farmId;
    private List<OrderDetailRequest> items;
}