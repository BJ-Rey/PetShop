package com.tencent.wxcloudrun.service;

import com.tencent.wxcloudrun.model.Merchant;
import java.util.List;

public interface MerchantService {
    Merchant getMerchantById(Integer id);
    List<Merchant> getMerchants(int page, int size);
    List<Merchant> getMerchants(int page, int size, String keyword);
    void createMerchant(Merchant merchant);
    void updateMerchant(Merchant merchant);
    void deleteMerchant(Integer id);
}
