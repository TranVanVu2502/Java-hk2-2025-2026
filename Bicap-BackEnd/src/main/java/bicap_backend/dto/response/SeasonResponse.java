package bicap_backend.dto.response;

import bicap_backend.enums.SeasonStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeasonResponse {

    private Long seasonId;
    private Long farmId;
    private String name;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    private String description;
    private SeasonStatus status;
    private String blockchainHash;
}
