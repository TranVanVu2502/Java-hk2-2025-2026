package bicap_backend.enity;

import bicap_backend.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_id", nullable = false)
    private FarmingSeason season;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private Double quantity;

    @Column
    private Double price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status = ProductStatus.AVAILABLE;
}

