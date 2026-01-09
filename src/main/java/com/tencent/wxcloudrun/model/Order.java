package com.tencent.wxcloudrun.model;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Order {
    private Integer id;
    private String orderNo;
    private String userId;
    private BigDecimal totalAmount;
    private String status; // pending, paid, shipped, completed, cancelled
    private String itemsJson;
    private String addressSnapshot;
    private String trackingNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
