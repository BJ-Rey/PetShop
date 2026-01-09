package com.tencent.wxcloudrun.controller;

import com.tencent.wxcloudrun.config.ApiResponse;
import com.tencent.wxcloudrun.dto.CreateOrderRequest;
import com.tencent.wxcloudrun.dto.UpdateOrderRequest;
import com.tencent.wxcloudrun.model.Order;
import com.tencent.wxcloudrun.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/order")
@Validated
public class OrderController {

    final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * 获取商家订单列表 (Currently returns all orders)
     */
    @GetMapping("/merchant/list")
    public ApiResponse getMerchantOrderList() {
        List<Order> orders = orderService.getAllOrders();
        return ApiResponse.ok(orders);
    }

    /**
     * 获取用户订单列表
     * Expects openid in header 'x-wx-openid' or param 'userId'
     */
    @GetMapping("/user/list")
    public ApiResponse getUserOrderList(@RequestHeader(value = "x-wx-openid", required = false) String openId,
                                        @RequestParam(value = "userId", required = false) String paramUserId) {
        String userId = openId != null ? openId : paramUserId;
        if (userId == null) {
            return ApiResponse.error("Missing user identity");
        }
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return ApiResponse.ok(orders);
    }

    /**
     * 获取订单详情
     */
    @GetMapping("/detail/{id}")
    public ApiResponse getOrderDetail(@PathVariable Integer id) {
        Optional<Order> order = orderService.getOrderById(id);
        if (order.isPresent()) {
            return ApiResponse.ok(order.get());
        } else {
            return ApiResponse.error("Order not found");
        }
    }

    /**
     * 创建订单
     */
    @PostMapping("/create")
    public ApiResponse createOrder(@Valid @RequestBody CreateOrderRequest request, @RequestHeader(value = "x-wx-openid", required = false) String openId) {
        // Use userId from header if available (Security)
        String userId = openId != null ? openId : request.getUserId();
        
        if (userId == null) {
            return ApiResponse.error("Missing user identity");
        }
        
        Order order = new Order();
        order.setUserId(userId);
        order.setItemsJson(request.getItemsJson());
        order.setAddressSnapshot(request.getAddressSnapshot());
        order.setTotalAmount(request.getTotalAmount());
        
        // Generate Order No
        order.setOrderNo("ORD" + System.currentTimeMillis() + (int)(Math.random() * 1000));
        order.setStatus("pending"); // Initial status
        
        try {
            orderService.createOrder(order);
            return ApiResponse.ok(order);
        } catch (Exception e) {
            return ApiResponse.error("Create order failed: " + e.getMessage());
        }
    }

    /**
     * 更新订单状态
     */
    @PostMapping("/status")
    public ApiResponse updateOrderStatus(@Valid @RequestBody UpdateOrderRequest request) {
        Integer id = request.getId();
        String status = request.getStatus();
        
        Optional<Order> order = orderService.getOrderById(id);
        if (order.isPresent()) {
            try {
                orderService.updateOrderStatus(order.get().getOrderNo(), status);
                return ApiResponse.ok();
            } catch (IllegalArgumentException e) {
                return ApiResponse.error(e.getMessage());
            } catch (Exception e) {
                return ApiResponse.error("Update failed");
            }
        }
        return ApiResponse.error("Order not found");
    }

    /**
     * 更新运单号
     */
    @PostMapping("/tracking")
    public ApiResponse updateTrackingNumber(@RequestBody Map<String, Object> body) {
        Integer id = (Integer) body.get("id");
        String trackingNumber = (String) body.get("trackingNumber");
        orderService.updateTrackingNumber(id, trackingNumber);
        return ApiResponse.ok();
    }
}
