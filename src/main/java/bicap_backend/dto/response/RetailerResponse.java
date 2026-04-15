package bicap_backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RetailerResponse {

    private Long retailerId;
    private String name;
    private String businessLicense;
    private String address;
}