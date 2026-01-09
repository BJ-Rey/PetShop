package com.tencent.wxcloudrun.service.impl;

import com.tencent.wxcloudrun.dao.OrderMapper;
import com.tencent.wxcloudrun.model.Order;
import com.tencent.wxcloudrun.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import com.tencent.wxcloudrun.model.OrderStatus;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderServiceImpl implements OrderService {

    final OrderMapper orderMapper;

    @Autowired
    public OrderServiceImpl(OrderMapper orderMapper) {
        this.orderMapper = orderMapper;
    }

    @Override
    public Optional<Order> getOrderById(Integer id) {
        return Optional.ofNullable(orderMapper.getOrderById(id));
    }

    @Override
    public Optional<Order> getOrderByOrderNo(String orderNo) {
        return Optional.ofNullable(orderMapper.getOrderByOrderNo(orderNo));
    }

    @Override
    public List<Order> getOrdersByUserId(String userId) {
        return orderMapper.getOrdersByUserId(userId);
    }

    @Override
    public List<Order> getOrdersByStatus(String userId, String status) {
        return orderMapper.getOrdersByStatus(userId, status);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderMapper.getAllOrders();
    }

    @Override
    @Transactional
    public void createOrder(Order order) {
        // Idempotency check could be here (e.g. check if orderNo exists), but DB unique constraint handles it.
        orderMapper.createOrder(order);
    }

    @Override
    @Transactional
    public void updateOrderStatus(String orderNo, String status) {
        Order order = orderMapper.getOrderByOrderNo(orderNo);
        if (order == null) {
            throw new RuntimeException("Order not found");
        }
        
        // State Machine Validation
        try {
            OrderStatus currentStatus = OrderStatus.fromValue(order.getStatus());
            OrderStatus newStatus = OrderStatus.fromValue(status);
            
            boolean isValid = false;
            switch (currentStatus) {
                case PENDING:
                    if (newStatus == OrderStatus.PAID || newStatus == OrderStatus.CANCELLED) isValid = true;
                    break;
                case PAID:
                    if (newStatus == OrderStatus.SHIPPED || newStatus == OrderStatus.CANCELLED) isValid = true;
                    break;
                case SHIPPED:
                    if (newStatus == OrderStatus.COMPLETED) isValid = true;
                    break;
                case COMPLETED:
                case CANCELLED:
                    // Final states
                    break;
            }
            
            if (!isValid) {
                // Allow same status update (idempotency)
                if (currentStatus == newStatus) return;
                throw new IllegalArgumentException("Invalid status transition from " + currentStatus + " to " + newStatus);
            }
        } catch (IllegalArgumentException e) {
            // If status string is invalid or transition invalid
            throw e;
        }

        orderMapper.updateOrderStatus(orderNo, status);
    }

    @Override
    @Transactional
    public void updateTrackingNumber(Integer id, String trackingNumber) {
        orderMapper.updateTrackingNumber(id, trackingNumber);
    }

    @Override
    @Transactional
    public void deleteOrder(Integer id) {
        orderMapper.deleteOrder(id);
    }
}
