package com.farm.model;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Farm {
    @Id
    private Long id;
    private String name;
    private String address;
    private String license;

    public Farm() {}

    public Farm(Long id, String name, String address, String license) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.license = license;
    }

    // Getter, Setter methods
}