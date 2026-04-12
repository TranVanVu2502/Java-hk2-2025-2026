package bicap_backend.service;

import bicap_backend.dto.request.OrderRequest;
import bicap_backend.dto.response.OrderResponse;
import bicap_backend.enity.*;
import bicap_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final IOrderRepository orderRepository;
    private final IOrderDetailRepository orderDetailRepository;
    private final IRetailerRepository retailerRepository;
    private final IFarmRepository farmRepository;
    private final IProductRepository productRepository;

    // ===== CREATE ORDER =====
    public OrderResponse createOrder(OrderRequest request) {

        Retailer retailer = retailerRepository.findById(request.getRetailerId())
                .orElseThrow(() -> new RuntimeException("Retailer không tồn tại"));

        Farm farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new RuntimeException("Farm không tồn tại"));

        Order order = Order.builder()
                .retailer(retailer)
                .farm(farm)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        Order savedOrder = orderRepository.save(order);

        List<String> productNames = new ArrayList<>();

        for (var item : request.getItems()) {

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product không tồn tại"));

            OrderDetail detail = OrderDetail.builder()
                    .order(savedOrder)
                    .product(product)
                    .quantity(item.getQuantity())
                    .build();

            orderDetailRepository.save(detail);

            productNames.add(product.getName());
        }

        return OrderResponse.builder()
                .orderId(savedOrder.getOrderId())
                .retailerId(retailer.getRetailerId())
                .farmId(farm.getFarmId())
                .status(savedOrder.getStatus())
                .products(productNames)
                .build();
    }

    // ===== GET ALL ORDER OF RETAILER =====
    public List<Order> getOrdersByRetailer(Long retailerId) {
        return orderRepository.findByRetailer_RetailerId(retailerId);
    }

    // ===== GET ORDER DETAIL =====
    public Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order không tồn tại"));
    }

    // ===== CANCEL =====
    public void cancelOrder(Long id) {
        Order order = getOrder(id);
        order.setStatus("CANCELLED");
        orderRepository.save(order);
    }

    // ===== CONFIRM =====
    public void confirmOrder(Long id) {
        Order order = getOrder(id);
        order.setStatus("CONFIRMED");
        orderRepository.save(order);
    }

    // ===== FARM VIEW =====
    public List<Order> getOrdersByFarm(Long farmId) {
        return orderRepository.findByFarm_FarmId(farmId);
    }
}