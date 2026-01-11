package com.tencent.wxcloudrun.service.impl;

import com.tencent.wxcloudrun.dao.PetMapper;
import com.tencent.wxcloudrun.model.Pet;
import com.tencent.wxcloudrun.service.PetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PetServiceImpl implements PetService {

    @Autowired
    private PetMapper petMapper;

    @Override
    public Pet getPetById(Integer id) {
        return petMapper.getPetById(id);
    }

    @Override
    public List<Pet> getPets(int page, int size) {
        int offset = (page - 1) * size;
        return petMapper.getPets(offset, size);
    }
    
    @Override
    public List<Pet> getPets(int page, int size, String keyword, String userId) {
        int offset = (page - 1) * size;
        return petMapper.searchPets(offset, size, keyword, userId);
    }

    @Override
    public void createPet(Pet pet) {
        petMapper.createPet(pet);
    }

    @Override
    public void updatePet(Pet pet) {
        petMapper.updatePet(pet);
    }

    @Override
    public void deletePet(Integer id) {
        petMapper.deletePet(id);
    }

    @Override
    public Integer countPets() {
        return petMapper.countPets();
    }
}
