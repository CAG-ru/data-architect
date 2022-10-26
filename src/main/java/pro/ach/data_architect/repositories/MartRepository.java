package pro.ach.data_architect.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import pro.ach.data_architect.models.mart.Mart;

import java.util.Date;
import java.util.List;

public interface MartRepository extends MongoRepository<Mart,String> {

    List<Mart> getMartsByMartInfoMartDueDateBefore(Date Date);
}
