package com.tencent.wxcloudrun.controller;

import com.tencent.wxcloudrun.config.ApiResponse;
import com.tencent.wxcloudrun.model.Product;
import com.tencent.wxcloudrun.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/product")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/list")
    public ApiResponse getProductList(@RequestParam(defaultValue = "1") int page,
                                      @RequestParam(defaultValue = "10") int size,
                                      @RequestParam(required = false) String keyword) {
        List<Product> products = productService.getProducts(page, size, keyword);
        
        Map<String, Object> result = new HashMap<>();
        result.put("list", products);
        result.put("page", page);
        result.put("size", size);
        result.put("total", products.size());
        
        return ApiResponse.ok(result);
    }

    @GetMapping("/detail/{id}")
    public ApiResponse getProductDetail(@PathVariable Integer id) {
        Product product = productService.getProductById(id);
        if (product != null) {
            return ApiResponse.ok(product);
        } else {
            return ApiResponse.error("Product not found");
        }
    }

    @PostMapping("/add")
    public ApiResponse addProduct(@RequestBody Product product) {
        productService.createProduct(product);
        return ApiResponse.ok(product);
    }

    @PutMapping("/update")
    public ApiResponse updateProduct(@RequestBody Product product) {
        productService.updateProduct(product);
        return ApiResponse.ok(product);
    }

    @DeleteMapping("/delete/{id}")
    public ApiResponse deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ApiResponse.ok();
    }
}
