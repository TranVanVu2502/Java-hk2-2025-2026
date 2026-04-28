package bicap_backend.dto.response;

import bicap_backend.enums.FarmStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmResponse {

    private Long farmId;
    private String name;
    private String address;
    private String businessLicense;
    private String ownerName;
    private FarmStatus status;
}
