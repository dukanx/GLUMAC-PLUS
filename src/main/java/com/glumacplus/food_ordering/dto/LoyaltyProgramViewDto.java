    package com.glumacplus.food_ordering.dto;

    public class LoyaltyProgramViewDto {

        private Long id;
        private String nivo;
        private double popust;
        private int pragBodova;

        public LoyaltyProgramViewDto() {
        }

        public LoyaltyProgramViewDto(Long id, String nivo, double popust, int pragBodova) {
            this.id = id;
            this.nivo = nivo;
            this.popust = popust;
            this.pragBodova = pragBodova;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getNivo() {
            return nivo;
        }

        public void setNivo(String nivo) {
            this.nivo = nivo;
        }

        public double getPopust() {
            return popust;
        }

        public void setPopust(double popust) {
            this.popust = popust;
        }

        public int getPragBodova() {
            return pragBodova;
        }

        public void setPragBodova(int pragBodova) {
            this.pragBodova = pragBodova;
        }
    }
