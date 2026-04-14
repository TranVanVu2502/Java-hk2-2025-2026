package bicap_backend.dto.response;

import bicap_backend.enums.SeasonStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeasonResponse {

    private Long seasonId;
    private Long farmId;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private SeasonStatus status;
    private String blockchainHash;
}
