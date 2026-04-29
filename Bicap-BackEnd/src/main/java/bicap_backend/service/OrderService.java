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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final IOrderRepository orderRepository;
    private final IOrderDetailRepository orderDetailRepository;
    private final IUserRepository userRepository;
    private final IRetailerRepository retailerRepository;
    private final IProductRepository productRepository;
    private final IFarmRepository farmRepository;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Retailer retailer = retailerRepository
                .findByUserUserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Vui lòng cập nhật hồ sơ nhà bán lẻ trước khi đặt hàng"));

        Order order = Order.builder()
                .retailer(retailer)
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        List<OrderDetail> details = new ArrayList<>();
        Farm farm = null;

        for (var item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product không tồn tại"));

            if (product.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Sản phẩm '" + product.getName() + "' không đủ số lượng trong kho (Còn lại: " + product.getQuantity() + ")");
            }

            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);

            if (farm == null) {
                farm = product.getSeason().getFarm();
            }

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(item.getQuantity());
            detail.setPrice(item.getPrice());
            details.add(detail);
        }

        order.setFarm(farm);
        orderRepository.save(order);
        orderDetailRepository.saveAll(details);

        return mapToResponse(order);
    }

    public List<OrderResponse> getOrdersByRetailer() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        java.util.Optional<Retailer> optRetailer = retailerRepository.findByUserUserId(user.getUserId());
        if (optRetailer.isEmpty()) {
            return new ArrayList<>();
        }
        Retailer retailer = optRetailer.get();

        List<Order> orders = orderRepository.findByRetailer_RetailerId(retailer.getRetailerId());

        return orders.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<OrderResponse> getOrdersByFarm() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        java.util.Optional<Farm> optFarm = farmRepository.findByUserUserId(user.getUserId()).stream().findFirst();
        if (optFarm.isEmpty()) {
            return new ArrayList<>();
        }
        Farm farm = optFarm.get();

        List<Order> orders = orderRepository.findByFarm_FarmId(farm.getFarmId());

        return orders.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy order"));

        return mapToResponse(order);
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

        // Hoàn kho khi hủy đơn
        if (order.getOrderDetails() != null) {
            for (OrderDetail detail : order.getOrderDetails()) {
                Product product = detail.getProduct();
                if (product != null) {
                    product.setQuantity(product.getQuantity() + detail.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    private OrderResponse mapToResponse(Order order) {
        List<bicap_backend.dto.response.OrderDetailResponse> details = new ArrayList<>();
        if (order.getOrderDetails() != null) {
            for (OrderDetail od : order.getOrderDetails()) {
                details.add(bicap_backend.dto.response.OrderDetailResponse.builder()
                        .productId(od.getProduct() != null ? od.getProduct().getProductId() : null)
                        .productName(od.getProduct() != null ? od.getProduct().getName() : null)
                        .quantity(od.getQuantity())
                        .price(od.getPrice())
                        .productImage(od.getProduct() != null ? od.getProduct().getImageUrl() : null)
                        .build());
            }
        }

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .status(order.getStatus())
                .retailerId(order.getRetailer() != null ? order.getRetailer().getRetailerId() : null)
                .retailerName(order.getRetailer() != null ? order.getRetailer().getName() : null)
                .retailerAddress(order.getRetailer() != null ? order.getRetailer().getAddress() : null)
                .retailerBusinessLicense(order.getRetailer() != null ? order.getRetailer().getBusinessLicense() : null)
                .farmId(order.getFarm() != null ? order.getFarm().getFarmId() : null)
                .farmName(order.getFarm() != null ? order.getFarm().getName() : null)
                .createdAt(order.getCreatedAt())
                .orderDetails(details)
                .build();
    }
}