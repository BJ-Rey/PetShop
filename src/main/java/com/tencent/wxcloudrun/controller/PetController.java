package com.tencent.wxcloudrun.controller;

import com.tencent.wxcloudrun.config.ApiResponse;
import com.tencent.wxcloudrun.model.Pet;
import com.tencent.wxcloudrun.service.PetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cat")
public class PetController {

    @Autowired
    private PetService petService;

    @GetMapping("/list")
    public ApiResponse getPetList(@RequestParam(defaultValue = "1") int page,
                                  @RequestParam(defaultValue = "10") int size) {
        List<Pet> pets = petService.getPets(page, size);
        return ApiResponse.ok(pets);
    }

    @GetMapping("/detail/{id}")
    public ApiResponse getPetDetail(@PathVariable Integer id) {
        Pet pet = petService.getPetById(id);
        if (pet != null) {
            return ApiResponse.ok(pet);
        } else {
            return ApiResponse.error("Pet not found");
        }
    }

    @PostMapping("/add")
    public ApiResponse addPet(@RequestBody Pet pet) {
        petService.createPet(pet);
        return ApiResponse.ok(pet);
    }

    @PutMapping("/update")
    public ApiResponse updatePet(@RequestBody Pet pet) {
        petService.updatePet(pet);
        return ApiResponse.ok(pet);
    }
    
    @PutMapping("/status")
    public ApiResponse updatePetStatus(@RequestBody Pet pet) {
         // 只更新状态
         Pet existingPet = petService.getPetById(pet.getId());
         if (existingPet != null) {
             existingPet.setStatus(pet.getStatus());
             petService.updatePet(existingPet);
             return ApiResponse.ok(existingPet);
         }
         return ApiResponse.error("Pet not found");
    }

    @DeleteMapping("/delete/{id}")
    public ApiResponse deletePet(@PathVariable Integer id) {
        petService.deletePet(id);
        return ApiResponse.ok();
    }
}
