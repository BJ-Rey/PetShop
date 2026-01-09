package com.tencent.wxcloudrun.dao;

import com.tencent.wxcloudrun.model.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface OrderMapper {
    Order getOrderById(Integer id);
    Order getOrderByOrderNo(String orderNo);
    List<Order> getOrdersByUserId(String userId);
    List<Order> getOrdersByStatus(@Param("userId") String userId, @Param("status") String status);
    List<Order> getAllOrders(); // For merchants/admin
    void createOrder(Order order);
    void updateOrderStatus(@Param("orderNo") String orderNo, @Param("status") String status);
    void updateTrackingNumber(@Param("id") Integer id, @Param("trackingNumber") String trackingNumber);
    void deleteOrder(Integer id);
}
