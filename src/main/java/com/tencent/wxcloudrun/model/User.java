package com.tencent.wxcloudrun.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    private Integer id;
    private String openid;
    private String nickname;
    private String avatarUrl;
    private String phone;
    private String role; // user, merchant, admin
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
