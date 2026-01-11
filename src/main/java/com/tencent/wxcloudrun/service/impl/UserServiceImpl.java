package com.tencent.wxcloudrun.service.impl;

import com.tencent.wxcloudrun.dao.UserMapper;
import com.tencent.wxcloudrun.model.User;
import com.tencent.wxcloudrun.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    final UserMapper userMapper;

    @Autowired
    public UserServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public User getUserByOpenId(String openid) {
        return userMapper.getUserByOpenId(openid);
    }

    @Override
    public User getUserByPhone(String phone) {
        return userMapper.getUserByPhone(phone);
    }

    @Override
    public User registerUser(User user) {
        User existing = userMapper.getUserByOpenId(user.getOpenid());
        if (existing != null) {
            return existing;
        }
        if (user.getRole() == null) {
            user.setRole("user"); // Default role
        }
        userMapper.createUser(user);
        return user;
    }

    @Override
    public void updateUserRole(String openid, String role) {
        userMapper.updateUserRole(openid, role);
    }
}
