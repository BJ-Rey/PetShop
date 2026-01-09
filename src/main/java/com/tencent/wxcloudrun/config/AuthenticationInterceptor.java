package com.tencent.wxcloudrun.config;

import com.tencent.wxcloudrun.model.User;
import com.tencent.wxcloudrun.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class AuthenticationInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationInterceptor.class);

    @Autowired
    private UserService userService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        
        // Allow public APIs (Login, Mall, etc.)
        // We only protect /api/merchant/** for now as requested
        if (!path.startsWith("/api/merchant")) {
            return true;
        }

        // Get OpenID from header (injected by WeChat Cloud Run)
        String openid = request.getHeader("x-wx-openid");
        
        // For local debugging, allow a custom header or skip if configured (skipping config for now, assuming header exists)
        if (openid == null) {
            // Check for a custom header used in local debug
            openid = request.getHeader("X-Debug-OpenId");
        }

        if (openid == null || openid.isEmpty()) {
            logger.warn("Unauthorized access attempt to {}: Missing OpenID", path);
            response.setStatus(401);
            response.getWriter().write("{\"code\": 401, \"errorMsg\": \"Unauthorized: Missing Identity\"}");
            return false;
        }

        // Check User Role
        User user = userService.getUserByOpenId(openid);
        if (user == null) {
            logger.warn("Unauthorized access attempt to {}: User not found for openid {}", path, openid);
            response.setStatus(403);
            response.getWriter().write("{\"code\": 403, \"errorMsg\": \"Forbidden: User not registered\"}");
            return false;
        }

        if (!"merchant".equals(user.getRole()) && !"admin".equals(user.getRole())) {
            logger.warn("Unauthorized access attempt to {}: User {} has insufficient role {}", path, openid, user.getRole());
            response.setStatus(403);
            response.getWriter().write("{\"code\": 403, \"errorMsg\": \"Forbidden: Insufficient Permissions\"}");
            return false;
        }

        return true;
    }
}
