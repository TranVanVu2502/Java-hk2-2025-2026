package bicap_backend.controller;

import bicap_backend.dto.request.ProductRequest;
import bicap_backend.dto.response.ProductResponse;
import bicap_backend.service.FileService;
import bicap_backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final FileService fileService;

    @PostMapping
    public ResponseEntity<ProductResponse> create(@RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAll(
            @RequestParam(required = false) String name,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(productService.getAll(name, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @PostMapping("/{id}/upload-image")
    public ResponseEntity<String> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        String filePath = fileService.saveFile(file);

        // 2. Cập nhật đường dẫn vào Database cho Product có id này
        productService.updateImage(id, filePath);

        return ResponseEntity.ok(filePath);
    }
}