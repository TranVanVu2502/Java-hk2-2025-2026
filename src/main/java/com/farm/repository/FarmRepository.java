package com.farm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.farm.model.Farm;

public interface FarmRepository extends JpaRepository<Farm, Long> {

    public List<Farm> findAll();
}