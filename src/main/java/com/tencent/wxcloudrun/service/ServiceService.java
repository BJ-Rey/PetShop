package com.tencent.wxcloudrun.service;

import com.tencent.wxcloudrun.model.Service;
import java.util.List;

public interface ServiceService {
    Service getServiceById(Integer id);
    List<Service> getServices(int page, int size);
    void createService(Service service);
    void updateService(Service service);
    void deleteService(Integer id);
    Integer countServices();
}
