package bicap_backend.dto.request;

import lombok.Data;

@Data
public class RetailerRequest {

    private Long userId;
    private String name;
    private String businessLicense;
    private String address;
}