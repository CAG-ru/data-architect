package pro.ach.data_architect.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import pro.ach.data_architect.models.DataStore;

public interface DataStoreRepository extends MongoRepository<DataStore,String> {
}
