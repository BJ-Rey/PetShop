package com.tencent.wxcloudrun.service.impl;

import com.tencent.wxcloudrun.dao.ServiceMapper;
import com.tencent.wxcloudrun.model.Service;
import com.tencent.wxcloudrun.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@org.springframework.stereotype.Service
public class ServiceServiceImpl implements ServiceService {

    @Autowired
    private ServiceMapper serviceMapper;

    @Override
    public Service getServiceById(Integer id) {
        return serviceMapper.getServiceById(id);
    }

    @Override
    public List<Service> getServices(int page, int size) {
        int offset = (page - 1) * size;
        return serviceMapper.getServices(offset, size);
    }
    
    @Override
    public List<Service> getServices(int page, int size, String keyword) {
        int offset = (page - 1) * size;
        return serviceMapper.searchServices(offset, size, keyword);
    }

    @Override
    public void createService(Service service) {
        serviceMapper.createService(service);
    }

    @Override
    public void updateService(Service service) {
        serviceMapper.updateService(service);
    }

    @Override
    public void deleteService(Integer id) {
        serviceMapper.deleteService(id);
    }

    @Override
    public Integer countServices() {
        return serviceMapper.countServices();
    }
}
