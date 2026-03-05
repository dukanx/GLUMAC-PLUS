package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.LoyaltyProgram;

public class LoyaltyProgramMapper {

    private LoyaltyProgramMapper() {
    }

    public static LoyaltyProgramViewDto toViewDto(LoyaltyProgram loyaltyProgram) {
        return new LoyaltyProgramViewDto(
                loyaltyProgram.getId(),
                loyaltyProgram.getNivo(),
                loyaltyProgram.getPopust(),
                loyaltyProgram.getPragBodova()
        );
    }
}
