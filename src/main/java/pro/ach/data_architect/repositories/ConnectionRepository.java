package pro.ach.data_architect.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.connection.enums.TypeConnection;

import java.util.List;

public interface ConnectionRepository extends MongoRepository<Connection, String> {
  List<Connection> findConnectionByTypeConnection(TypeConnection typeConnection);

  List<Connection> findConnectionByLastVersionNotNullAndTypeConnection(TypeConnection typeConnection);

  List<Connection> findConnectionsByIdIn(List<String> ids);
}
