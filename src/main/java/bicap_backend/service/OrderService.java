// service/OrderService.java
package bicap_backend.service;

import bicap_backend.dto.request.OrderRequest;
import bicap_backend.dto.response.OrderResponse;
import bicap_backend.enity.*;
import bicap_backend.enums.OrderStatus;
import bicap_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final IOrderRepository orderRepository;
    private final IOrderDetailRepository orderDetailRepository;
    private final IUserRepository userRepository;
    private final IRetailerRepository retailerRepository;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Retailer retailer = retailerRepository
                .findById(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Retailer không tồn tại"));

        Order order = Order.builder()
                .retailer(retailer)
                .status(OrderStatus.PENDING)
                .build();

        orderRepository.save(order);

        List<OrderDetail> details = new ArrayList<>();

        for (var item : request.getItems()) {
            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setQuantity(item.getQuantity());
            detail.setPrice(item.getPrice());
            details.add(detail);
        }

        orderDetailRepository.saveAll(details);

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .status(order.getStatus())
                .build();
    }

    public List<OrderResponse> getOrdersByRetailer() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Retailer retailer = retailerRepository
                .findByUserUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Retailer không tồn tại"));

        List<Order> orders = orderRepository.findByRetailer_RetailerId(retailer.getRetailerId());

        return orders.stream()
                .map(order -> OrderResponse.builder()
                        .orderId(order.getOrderId())
                        .status(order.getStatus())
                        .build())
                .toList();
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy order"));

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .status(order.getStatus())
                .build();
    }

    @Transactional
    public void confirmOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy order"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Chỉ xác nhận đơn hàng đang chờ");
        }

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
    }
    @Transactional
    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy order"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Chỉ huỷ đơn hàng đang chờ xác nhận");
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
}