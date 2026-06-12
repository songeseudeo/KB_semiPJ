package com.kb.realestate.repository;

import com.kb.realestate.entity.CheckState;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CheckStateRepository extends JpaRepository<CheckState, Long> {
    List<CheckState> findByChecklistListId(Long listId);
    void deleteByChecklistListId(Long listId);
}