package com.tencent.wxcloudrun.dto;

import lombok.Data;
import javax.validation.constraints.NotNull;

@Data
public class UpdateOrderRequest {
    @NotNull(message = "id cannot be null")
    private Integer id;
    
    @NotNull(message = "status cannot be null")
    private String status;
}
