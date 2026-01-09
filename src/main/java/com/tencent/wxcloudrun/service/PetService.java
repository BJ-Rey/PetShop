package com.tencent.wxcloudrun.service;

import com.tencent.wxcloudrun.model.Pet;
import java.util.List;

public interface PetService {
    Pet getPetById(Integer id);
    List<Pet> getPets(int page, int size);
    void createPet(Pet pet);
    void updatePet(Pet pet);
    void deletePet(Integer id);
    Integer countPets();
}
