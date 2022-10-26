package pro.ach.data_architect.services;

import javassist.NotFoundException;
import pro.ach.data_architect.exceptions.classes.DataStoreNotFoundException;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.connection.enums.TypeConnection;
import pro.ach.data_architect.services.connectors.handler.DataSourceHanlerI;

import java.sql.SQLException;
import java.util.List;

public interface ConnectService {
    List<Connection> getAll();
    Connection findById(String id);
    List<Connection> findByTypeConnection(TypeConnection typeConnection);
    Connection save(Connection connector);
    Connection getMainConnect();
    List<Connection> getLoadedSourceConnections();
    List<Connection> getConnectionsById(List<String> connectionsId);
    Connection loadData(DataSourceHanlerI handler) throws SQLException, DataStoreNotFoundException, InterruptedException;
    void clear(String id) throws NotFoundException;
    void delete(String id) throws NotFoundException;
    List<Connection> getRelatedConnectionsByConnection(Connection connection);
    Connection loadRelationsForConnection(Connection connection) throws SQLException;
}
