package bicap_backend.dto.request;

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
public class SeasonRequest {

    private String name;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    private String description;
}
