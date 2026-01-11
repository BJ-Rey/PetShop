package com.tencent.wxcloudrun.dao;

import com.tencent.wxcloudrun.model.Service;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ServiceMapper {
    Service getServiceById(Integer id);
    List<Service> getServices(@Param("offset") int offset, @Param("limit") int limit);
    List<Service> searchServices(@Param("offset") int offset, @Param("limit") int limit, @Param("keyword") String keyword);
    void createService(Service service);
    void updateService(Service service);
    void deleteService(Integer id);
    Integer countServices();
}
