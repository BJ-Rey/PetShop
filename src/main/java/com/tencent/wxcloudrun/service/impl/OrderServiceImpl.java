package com.tencent.wxcloudrun.service.impl;

import com.tencent.wxcloudrun.dao.OrderMapper;
import com.tencent.wxcloudrun.model.Order;
import com.tencent.wxcloudrun.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
    public void createOrder(Order order) {
        orderMapper.createOrder(order);
    }

    @Override
    public void updateOrderStatus(String orderNo, String status) {
        orderMapper.updateOrderStatus(orderNo, status);
    }

    @Override
    public void updateTrackingNumber(Integer id, String trackingNumber) {
        orderMapper.updateTrackingNumber(id, trackingNumber);
    }

    @Override
    public void deleteOrder(Integer id) {
        orderMapper.deleteOrder(id);
    }
}
