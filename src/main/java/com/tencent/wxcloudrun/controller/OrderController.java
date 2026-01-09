package com.tencent.wxcloudrun.controller;

import com.tencent.wxcloudrun.config.ApiResponse;
import com.tencent.wxcloudrun.model.Order;
import com.tencent.wxcloudrun.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/order")
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
     * 更新订单状态
     */
    @PostMapping("/status")
    public ApiResponse updateOrderStatus(@RequestBody Map<String, Object> body) {
        Integer id = (Integer) body.get("id");
        String status = (String) body.get("status");
        // Usually update by orderNo, but frontend might pass ID. 
        // Mapper uses orderNo. Let's support ID first by fetching orderNo.
        Optional<Order> order = orderService.getOrderById(id);
        if (order.isPresent()) {
            orderService.updateOrderStatus(order.get().getOrderNo(), status);
            return ApiResponse.ok();
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
