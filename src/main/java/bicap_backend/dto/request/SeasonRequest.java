package bicap_backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeasonRequest {

    private Long farmId;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
}
