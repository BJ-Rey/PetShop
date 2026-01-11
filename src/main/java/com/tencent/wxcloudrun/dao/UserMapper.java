package com.tencent.wxcloudrun.dao;

import com.tencent.wxcloudrun.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    User getUserByOpenId(String openid);
    User getUserById(Integer id);
    User getUserByPhone(String phone);
    void createUser(User user);
    void updateUserRole(@Param("openid") String openid, @Param("role") String role);
}
