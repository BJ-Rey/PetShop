package com.tencent.wxcloudrun.dao;

import com.tencent.wxcloudrun.model.Merchant;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface MerchantMapper {
    Merchant getMerchantById(Integer id);
    List<Merchant> getMerchants(@Param("offset") int offset, @Param("limit") int limit);
    List<Merchant> searchMerchants(@Param("offset") int offset, @Param("limit") int limit, @Param("keyword") String keyword);
    void createMerchant(Merchant merchant);
    void updateMerchant(Merchant merchant);
    void deleteMerchant(Integer id);
}
