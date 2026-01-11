package com.tencent.wxcloudrun.service;

import com.tencent.wxcloudrun.model.Product;
import java.util.List;

public interface ProductService {
    Product getProductById(Integer id);
    List<Product> getProducts(int page, int size);
    List<Product> getProducts(int page, int size, String keyword);
    void createProduct(Product product);
    void updateProduct(Product product);
    void deleteProduct(Integer id);
    Integer countProducts();
}
