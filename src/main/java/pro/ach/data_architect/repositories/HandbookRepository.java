package pro.ach.data_architect.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import pro.ach.data_architect.models.handbook.HandBook;

public interface HandbookRepository extends MongoRepository<HandBook,String> {
    List<HandBook> findHandBookByType(String type);
}
