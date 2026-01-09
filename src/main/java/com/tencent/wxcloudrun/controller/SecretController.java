package com.tencent.wxcloudrun.controller;

import com.tencent.wxcloudrun.config.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SecretController {

    private final Logger logger = LoggerFactory.getLogger(SecretController.class);

    // 从云托管环境变量中读取密钥（避免硬编码）
    @Value("${AES_KEY:default_aes_key_placeholder}")
    private String aesKey;

    @Value("${AES_IV:default_aes_iv_placeholder}")
    private String aesIv;

    @Value("${APP_SECRET:default_app_secret_placeholder}")
    private String appSecret;

    // 接口：获取敏感密钥（需登录态鉴权，比如验证请求头中的token）
    @PostMapping("/getSecret")
    public ApiResponse getSecret(@RequestHeader(value = "Authorization", required = true) String token) {
        // 第一步：鉴权（验证token是否合法，替换为你的实际登录鉴权逻辑）
        // 这里只是一个简单的示例，实际项目中需要验证 token 的有效性
        if (token == null || token.isEmpty()) {
            return ApiResponse.error("未登录或登录态失效");
        }
        
        // 模拟鉴权逻辑，实际应调用 userService.verifyToken(token)
        // logger.info("Checking token: {}", token);
        
        // 第二步：封装密钥数据（仅返回小程序需要的内容）
        Map<String, String> secretData = new HashMap<>();
        secretData.put("aesKey", aesKey);
        secretData.put("aesIv", aesIv);
        secretData.put("appSecret", appSecret);

        // 第三步：返回给小程序（无需加密，因为链路是小程序→云托管内网，安全）
        return ApiResponse.ok(secretData);
    }
}
