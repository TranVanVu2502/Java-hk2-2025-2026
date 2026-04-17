package bicap_backend.controller;

import bicap_backend.dto.request.OrderRequest;
import bicap_backend.dto.response.OrderResponse;
import bicap_backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public OrderResponse create(@RequestBody OrderRequest request) {
        return orderService.createOrder(request);
    }

    @GetMapping
    public List<OrderResponse> getAll() {
        return orderService.getOrdersByRetailer();
    }

    @GetMapping("/{id}")
    public OrderResponse getOne(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @PutMapping("/{id}/cancel")
    public String cancel(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return "Đã huỷ đơn";
    }

    @PutMapping("/{id}/confirm")
    public String confirm(@PathVariable Long id) {
        orderService.confirmOrder(id);
        return "Đã xác nhận";
    }
}