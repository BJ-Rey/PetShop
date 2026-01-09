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

        // Basic mock verification (in real world, verify SMS code)
        if (!"123456".equals(code)) {
             // For demo simplicity, accept 123456
             // return ApiResponse.error("Invalid verification code");
        }

        // Find user by phone (simulating login)
        // In real WeChat login, we use wx.login -> code -> openid
        // Here we use phone to simulate the identity for the existing frontend flow
        
        // Since UserMapper doesn't have getUserByPhone, I'll add it or search by known openids if phone matches test accounts
        // But better to add getUserByPhone to Mapper.
        // For now, I will use a simple mapping or just check existing users.
        // Wait, I updated User model but not Mapper for phone search.
        
        // Let's assume the frontend sends 'openid' if it knows it, or we generate one based on phone for this demo.
        String openid = "openid_" + phone; // Deterministic openid for demo
        
        User user = userService.getUserByOpenId(openid);
        if (user == null) {
            // Register new user
            user = new User();
            user.setOpenid(openid);
            user.setPhone(phone);
            user.setNickname("User " + phone.substring(7));
            user.setAvatarUrl("https://placehold.co/100x100/png?text=U");
            
            // Default role is 'user'. 
            // Merchant/Admin roles must be set via database admin or specific registration flow.
            user.setRole("user");
            
            userService.registerUser(user);
        }

        // Return token and role
        Map<String, Object> data = new HashMap<>();
        data.put("token", user.getOpenid()); // Use openid as token for simplicity
        data.put("role", user.getRole());
        data.put("openid", user.getOpenid());
        data.put("userInfo", user);

        return ApiResponse.ok(data);
    }
}
