package bicap_backend.dto.response;

import lombok.Data;

@Data
public class RetailerResponse {

    private Long retailerId;
    private Long userId;
    private String name;
    private String businessLicense;
    private String address;
}