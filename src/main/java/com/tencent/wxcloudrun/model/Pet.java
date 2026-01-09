package com.tencent.wxcloudrun.model;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Pet {
    private Integer id;
    private String name;
    private String breed;
    private String age;
    private String gender;
    private BigDecimal price;
    private BigDecimal deposit;
    private String status;
    private String description;
    private String avatar;
    private String healthStatus;
    private Integer merchantId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
