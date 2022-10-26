package pro.ach.data_architect.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;

import pro.ach.data_architect.models.Entity;

public interface EntityRepository extends MongoRepository<Entity,String> {
}
