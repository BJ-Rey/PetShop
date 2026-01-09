package com.tencent.wxcloudrun.dao;

import com.tencent.wxcloudrun.model.Product;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ProductMapper {
    Product getProductById(Integer id);
    List<Product> getProducts(@Param("offset") int offset, @Param("limit") int limit);
    void createProduct(Product product);
    void updateProduct(Product product);
    void deleteProduct(Integer id);
    Integer countProducts();
}
