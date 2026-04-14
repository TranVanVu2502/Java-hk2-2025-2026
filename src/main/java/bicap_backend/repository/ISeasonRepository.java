package bicap_backend.repository;

import bicap_backend.enity.Season;
import bicap_backend.enums.SeasonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ISeasonRepository extends JpaRepository<Season, Long> {

    List<Season> findByFarmId(Long farmId);

    List<Season> findByStatus(SeasonStatus status);
}
