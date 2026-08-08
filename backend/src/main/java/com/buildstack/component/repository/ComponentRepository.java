package com.buildstack.component.repository;

import com.buildstack.component.entity.Component;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;

public interface ComponentRepository extends JpaRepository<Component, UUID> {
    
    @EntityGraph(attributePaths = {"page", "parent"})
    List<Component> findAllByPageIdOrderByOrderIndexAsc(UUID pageId);
    
    @EntityGraph(attributePaths = {"page", "parent"})
    List<Component> findAllByParentIdOrderByOrderIndexAsc(UUID parentId);
    
    void deleteAllByPageId(UUID pageId);
}
