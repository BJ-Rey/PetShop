package com.tencent.wxcloudrun.service;

import com.tencent.wxcloudrun.model.User;

public interface UserService {
    User getUserByOpenId(String openid);
    User getUserByPhone(String phone);
    User registerUser(User user);
    void updateUserRole(String openid, String role);
}
