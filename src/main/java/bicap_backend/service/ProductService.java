package bicap_backend.service;

import bicap_backend.dto.request.ProductRequest;
import bicap_backend.dto.response.ProductResponse;
import bicap_backend.repository.IProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final IProductRepository productRepository;
//    private final IFarmingSeasonRepository seasonRepository;

    public ProductResponse create(ProductRequest request) {
//      TODO: Logic TẠO SẢN PHẨM
        return null;
    }

    public ProductResponse getAll(String name, Pageable pageable) {
//      TODO: LOGIC LẤY TẤT CẢ SẢN PHẨM
        return null;
    }

    public ProductResponse getById(Long id) {
//      TODO: LOGIC TÌM SẢN PHẨM THEO ID
        return null;
    }

}

