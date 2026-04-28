package bicap_backend.repository;

// BICAP-32: Retailer repository
import bicap_backend.enity.Retailer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IRetailerRepository extends JpaRepository<Retailer, Long> {

    // lấy retailer theo user_id
    Optional<Retailer> findByUserUserId(Long userId);

}