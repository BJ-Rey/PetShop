package com.tencent.wxcloudrun.dao;

import com.tencent.wxcloudrun.model.Pet;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface PetMapper {
    Pet getPetById(Integer id);
    List<Pet> getPets(@Param("offset") int offset, @Param("limit") int limit);
    List<Pet> searchPets(@Param("offset") int offset, @Param("limit") int limit, 
                         @Param("keyword") String keyword, @Param("userId") String userId);
    void createPet(Pet pet);
    void updatePet(Pet pet);
    void deletePet(Integer id);
    Integer countPets();
}
