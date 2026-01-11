package com.tencent.wxcloudrun.controller;

import com.tencent.wxcloudrun.config.ApiResponse;
import com.tencent.wxcloudrun.model.Merchant;
import com.tencent.wxcloudrun.service.MerchantService;
import com.tencent.wxcloudrun.service.OrderService;
import com.tencent.wxcloudrun.service.PetService;
import com.tencent.wxcloudrun.service.ProductService;
import com.tencent.wxcloudrun.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/merchant")
public class MerchantController {

    @Autowired
    private MerchantService merchantService;

    @Autowired
    private PetService petService;

    @Autowired
    private ProductService productService;

    @Autowired
    private ServiceService serviceService;

    @Autowired
    private OrderService orderService;

    @GetMapping("/dashboard")
    public ApiResponse getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("pets", petService.countPets());
        stats.put("products", productService.countProducts());
        stats.put("services", serviceService.countServices()); // Also count services
        // Use real order count
        stats.put("orders", orderService.getAllOrders().size());
        stats.put("customers", 0); // Still 0 as we don't have distinct customer count logic handy yet
        // Recent orders list - placeholder
        stats.put("recentOrders", new ArrayList<>());
        
        return ApiResponse.ok(stats);
    }

    @GetMapping("/list")
    public ApiResponse getMerchantList(@RequestParam(defaultValue = "1") int page,
                                       @RequestParam(defaultValue = "10") int size,
                                       @RequestParam(required = false) String keyword) {
        List<Merchant> merchants = merchantService.getMerchants(page, size, keyword);
        
        Map<String, Object> result = new HashMap<>();
        result.put("list", merchants);
        result.put("page", page);
        result.put("size", size);
        result.put("total", merchants.size());
        
        return ApiResponse.ok(result);
    }

    @GetMapping("/detail/{id}")
    public ApiResponse getMerchantDetail(@PathVariable Integer id) {
        Merchant merchant = merchantService.getMerchantById(id);
        if (merchant != null) {
            return ApiResponse.ok(merchant);
        } else {
            return ApiResponse.error("Merchant not found");
        }
    }

    @PostMapping("/add")
    public ApiResponse addMerchant(@RequestBody Merchant merchant) {
        merchantService.createMerchant(merchant);
        return ApiResponse.ok(merchant);
    }

    @PutMapping("/update")
    public ApiResponse updateMerchant(@RequestBody Merchant merchant) {
        merchantService.updateMerchant(merchant);
        return ApiResponse.ok(merchant);
    }

    @DeleteMapping("/delete/{id}")
    public ApiResponse deleteMerchant(@PathVariable Integer id) {
        merchantService.deleteMerchant(id);
        return ApiResponse.ok();
    }
}
