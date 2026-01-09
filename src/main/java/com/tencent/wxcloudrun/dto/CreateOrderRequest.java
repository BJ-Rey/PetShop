package com.tencent.wxcloudrun.dto;

import lombok.Data;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class CreateOrderRequest {
    @NotBlank(message = "itemsJson cannot be empty")
    private String itemsJson;
    
    @NotBlank(message = "addressSnapshot cannot be empty")
    private String addressSnapshot;
    
    @NotNull(message = "totalAmount cannot be null")
    @DecimalMin(value = "0.01", message = "totalAmount must be greater than 0")
    private BigDecimal totalAmount;
    
    private String userId; // Optional in body, can be from header
}
