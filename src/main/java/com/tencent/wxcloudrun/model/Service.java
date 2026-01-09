package com.tencent.wxcloudrun.model;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Service {
    private Integer id;
    private String name;
    private String category;
    private BigDecimal price;
    private String duration;
    private String description;
    private String merchantName;
    private Integer merchantId;
    private String image;
    private Integer sales;
    private BigDecimal rating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
