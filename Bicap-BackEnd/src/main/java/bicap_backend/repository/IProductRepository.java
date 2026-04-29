package bicap_backend.repository;

import bicap_backend.enity.Product;
import bicap_backend.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IProductRepository extends JpaRepository<Product, Long> {

    List<Product> findBySeasonSeasonId(Long seasonId);

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    Page<Product> findByNameContainingIgnoreCaseAndStatus(
            String name, ProductStatus status, Pageable pageable);
}
