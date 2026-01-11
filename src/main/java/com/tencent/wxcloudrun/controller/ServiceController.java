package com.tencent.wxcloudrun.controller;

import com.tencent.wxcloudrun.config.ApiResponse;
import com.tencent.wxcloudrun.model.Service;
import com.tencent.wxcloudrun.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/service")
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    @GetMapping("/list")
    public ApiResponse getServiceList(@RequestParam(defaultValue = "1") int page,
                                      @RequestParam(defaultValue = "10") int size,
                                      @RequestParam(required = false) String keyword) {
        List<Service> services = serviceService.getServices(page, size, keyword);
        
        Map<String, Object> result = new HashMap<>();
        result.put("list", services);
        result.put("page", page);
        result.put("size", size);
        result.put("total", services.size());
        
        return ApiResponse.ok(result);
    }

    @GetMapping("/detail/{id}")
    public ApiResponse getServiceDetail(@PathVariable Integer id) {
        Service service = serviceService.getServiceById(id);
        if (service != null) {
            return ApiResponse.ok(service);
        } else {
            return ApiResponse.error("Service not found");
        }
    }

    @PostMapping("/add")
    public ApiResponse addService(@RequestBody Service service) {
        serviceService.createService(service);
        return ApiResponse.ok(service);
    }

    @PutMapping("/update")
    public ApiResponse updateService(@RequestBody Service service) {
        serviceService.updateService(service);
        return ApiResponse.ok(service);
    }

    @DeleteMapping("/delete/{id}")
    public ApiResponse deleteService(@PathVariable Integer id) {
        serviceService.deleteService(id);
        return ApiResponse.ok();
    }
}
