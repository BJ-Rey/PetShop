package com.tencent.wxcloudrun.service.impl;

import com.tencent.wxcloudrun.dao.ProductMapper;
import com.tencent.wxcloudrun.model.Product;
import com.tencent.wxcloudrun.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductMapper productMapper;

    @Override
    public Product getProductById(Integer id) {
        return productMapper.getProductById(id);
    }

    @Override
    public List<Product> getProducts(int page, int size) {
        int offset = (page - 1) * size;
        return productMapper.getProducts(offset, size);
    }
    
    @Override
    public List<Product> getProducts(int page, int size, String keyword) {
        int offset = (page - 1) * size;
        return productMapper.searchProducts(offset, size, keyword);
    }

    @Override
    public void createProduct(Product product) {
        productMapper.createProduct(product);
    }

    @Override
    public void updateProduct(Product product) {
        productMapper.updateProduct(product);
    }

    @Override
    public void deleteProduct(Integer id) {
        productMapper.deleteProduct(id);
    }

    @Override
    public Integer countProducts() {
        return productMapper.countProducts();
    }
}
