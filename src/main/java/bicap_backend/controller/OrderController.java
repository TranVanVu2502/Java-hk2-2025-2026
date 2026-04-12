package bicap_backend.controller;

import bicap_backend.dto.request.OrderRequest;
import bicap_backend.dto.response.OrderResponse;
import bicap_backend.enity.Order;
import bicap_backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // POST /api/orders
    @PostMapping
    public OrderResponse create(@RequestBody OrderRequest request) {
        return orderService.createOrder(request);
    }

    // GET /api/orders?retailerId=1
    @GetMapping
    public List<Order> getAll(@RequestParam Long retailerId) {
        return orderService.getOrdersByRetailer(retailerId);
    }

    // GET /api/orders/{id}
    @GetMapping("/{id}")
    public Order getOne(@PathVariable Long id) {
        return orderService.getOrder(id);
    }

    // PUT cancel
    @PutMapping("/{id}/cancel")
    public String cancel(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return "Đã huỷ đơn";
    }

    // PUT confirm
    @PutMapping("/{id}/confirm")
    public String confirm(@PathVariable Long id) {
        orderService.confirmOrder(id);
        return "Đã xác nhận";
    }
}