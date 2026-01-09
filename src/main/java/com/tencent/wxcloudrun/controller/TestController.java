package com.tencent.wxcloudrun.controller;

import com.tencent.wxcloudrun.config.ApiResponse;
import com.tencent.wxcloudrun.model.Order;
import com.tencent.wxcloudrun.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Optional;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/order-flow")
    public ApiResponse testOrderFlow() {
        StringBuilder report = new StringBuilder();
        try {
            // 1. Create Order
            Order order = new Order();
            order.setUserId("test_user_flow");
            order.setTotalAmount(new BigDecimal("99.99"));
            order.setItemsJson("[]");
            order.setAddressSnapshot("{}");
            order.setOrderNo("TEST" + System.currentTimeMillis());
            order.setStatus("pending");
            
            orderService.createOrder(order);
            report.append("Step 1: Create Order Success. ID=").append(order.getId()).append("\n");

            // 2. Update to PAID
            orderService.updateOrderStatus(order.getOrderNo(), "paid");
            report.append("Step 2: Update to PAID Success.\n");

            // 3. Update to SHIPPED
            orderService.updateOrderStatus(order.getOrderNo(), "shipped");
            report.append("Step 3: Update to SHIPPED Success.\n");
            
            // 4. Verify State
            Optional<Order> fetched = orderService.getOrderById(order.getId());
            if (fetched.isPresent() && "shipped".equals(fetched.get().getStatus())) {
                report.append("Step 4: Verification Success. Current Status: shipped\n");
            } else {
                report.append("Step 4: Verification Failed. Status is ").append(fetched.map(Order::getStatus).orElse("null"));
                return ApiResponse.error(report.toString());
            }

            // 5. Cleanup
            orderService.deleteOrder(order.getId());
            report.append("Step 5: Cleanup Success.\n");

            return ApiResponse.ok(report.toString());

        } catch (Exception e) {
            return ApiResponse.error("Test Failed: " + report.toString() + "\nError: " + e.getMessage());
        }
    }
}
