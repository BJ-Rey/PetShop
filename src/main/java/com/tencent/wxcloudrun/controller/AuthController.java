package com.tencent.wxcloudrun.controller;

import com.tencent.wxcloudrun.config.ApiResponse;
import com.tencent.wxcloudrun.model.User;
import com.tencent.wxcloudrun.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ApiResponse login(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String code = request.get("code"); // Verification code (mock check)

        logger.info("[Auth] Login attempt with phone: {}", phone);

        // Basic mock verification (in real world, verify SMS code)
        if (!"123456".equals(code)) {
             // For demo simplicity, accept 123456
             // return ApiResponse.error("Invalid verification code");
        }

        // 优先按手机号查询已有用户（保留原有角色设置）
        User user = userService.getUserByPhone(phone);
        
        if (user != null) {
            // 找到已有用户，使用其原有信息和角色
            logger.info("[Auth] Found existing user by phone: {}, role: {}", phone, user.getRole());
        } else {
            // 按手机号找不到，尝试按生成的 openid 查找
            String openid = "openid_" + phone;
            user = userService.getUserByOpenId(openid);
            
            if (user == null) {
                // 都找不到，创建新用户
                logger.info("[Auth] Creating new user for phone: {}", phone);
                user = new User();
                user.setOpenid(openid);
                user.setPhone(phone);
                user.setNickname("User " + phone.substring(7));
                user.setAvatarUrl("https://placehold.co/100x100/png?text=U");
                
                // Default role is 'user'. 
                // Merchant/Admin roles must be set via database admin or specific registration flow.
                user.setRole("user");
                
                userService.registerUser(user);
                logger.info("[Auth] New user created with role: {}", user.getRole());
            } else {
                logger.info("[Auth] Found existing user by openid: {}, role: {}", openid, user.getRole());
            }
        }

        // Return token and role
        Map<String, Object> data = new HashMap<>();
        data.put("token", user.getOpenid()); // Use openid as token for simplicity
        data.put("role", user.getRole());
        data.put("openid", user.getOpenid());
        data.put("userInfo", user);

        logger.info("[Auth] Login success, returning role: {}", user.getRole());

        return ApiResponse.ok(data);
    }
}
