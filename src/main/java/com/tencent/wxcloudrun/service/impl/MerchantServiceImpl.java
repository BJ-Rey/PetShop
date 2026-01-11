package com.tencent.wxcloudrun.service.impl;

import com.tencent.wxcloudrun.dao.MerchantMapper;
import com.tencent.wxcloudrun.model.Merchant;
import com.tencent.wxcloudrun.service.MerchantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MerchantServiceImpl implements MerchantService {

    @Autowired
    private MerchantMapper merchantMapper;

    @Override
    public Merchant getMerchantById(Integer id) {
        return merchantMapper.getMerchantById(id);
    }

    @Override
    public List<Merchant> getMerchants(int page, int size) {
        int offset = (page - 1) * size;
        return merchantMapper.getMerchants(offset, size);
    }
    
    @Override
    public List<Merchant> getMerchants(int page, int size, String keyword) {
        int offset = (page - 1) * size;
        return merchantMapper.searchMerchants(offset, size, keyword);
    }

    @Override
    public void createMerchant(Merchant merchant) {
        merchantMapper.createMerchant(merchant);
    }

    @Override
    public void updateMerchant(Merchant merchant) {
        merchantMapper.updateMerchant(merchant);
    }

    @Override
    public void deleteMerchant(Integer id) {
        merchantMapper.deleteMerchant(id);
    }
}
