package bicap_backend.repository;

import bicap_backend.enity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IOrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByRetailer_RetailerId(Long retailerId);

    List<Order> findByFarm_FarmId(Long farmId);
}