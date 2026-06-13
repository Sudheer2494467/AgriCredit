package com.fertilizer.shop.repository;

import com.fertilizer.shop.model.InterestRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterestRecordRepository extends JpaRepository<InterestRecord, Long> {
    List<InterestRecord> findByFarmerIdOrderByCalculatedDateDesc(Long farmerId);
}
