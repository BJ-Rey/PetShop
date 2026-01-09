package com.tencent.wxcloudrun.controller;

import com.tencent.wxcloudrun.config.ApiResponse;
import com.tencent.wxcloudrun.model.Service;
import com.tencent.wxcloudrun.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/service")
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    @GetMapping("/list")
    public ApiResponse getServiceList(@RequestParam(defaultValue = "1") int page,
                                      @RequestParam(defaultValue = "10") int size) {
        List<Service> services = serviceService.getServices(page, size);
        return ApiResponse.ok(services);
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
