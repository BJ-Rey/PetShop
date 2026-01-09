package com.tencent.wxcloudrun.service;

import com.tencent.wxcloudrun.model.Order;
import java.util.List;
import java.util.Optional;

public interface OrderService {
    Optional<Order> getOrderById(Integer id);
    Optional<Order> getOrderByOrderNo(String orderNo);
    List<Order> getOrdersByUserId(String userId);
    List<Order> getOrdersByStatus(String userId, String status);
    List<Order> getAllOrders();
    void createOrder(Order order);
    void updateOrderStatus(String orderNo, String status);
    void updateTrackingNumber(Integer id, String trackingNumber);
    void deleteOrder(Integer id);
}
