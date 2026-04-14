package bicap_backend.repository;

import bicap_backend.enity.FarmingSeason;
import bicap_backend.enums.SeasonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IFarmingSeasonRepository extends JpaRepository<FarmingSeason, Long> {

    List<FarmingSeason> findByFarmId(Long farmId);

    List<FarmingSeason> findByStatus(SeasonStatus status);
}
