package bicap_backend.repository;

import bicap_backend.enity.Farm;
import bicap_backend.enums.FarmStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IFarmRepository extends JpaRepository<Farm, Long> {
    List<Farm> findByStatus(FarmStatus status);
    List<Farm> findByUserUserId(Long userId);}
