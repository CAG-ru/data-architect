package pro.ach.data_architect.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import pro.ach.data_architect.models.Entity;

public interface EntityService {
    Page<Entity> getAll(Pageable pageable);
    List<Entity> getAll();
    Entity findById(String id);
    Entity save(Entity entity);
    void delete(Entity entity);
}
