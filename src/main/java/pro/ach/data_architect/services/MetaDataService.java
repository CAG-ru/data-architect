package pro.ach.data_architect.services;

import javassist.NotFoundException;
import pro.ach.data_architect.models.MetaData;
import pro.ach.data_architect.models.connection.Column;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.connection.Database;

import java.util.Date;
import java.util.List;

public interface MetaDataService {
    List<MetaData> getAll();
    MetaData findById(String id);
    MetaData save(MetaData metaData);
    MetaData saveColumn(MetaData metaData, Column column) throws NotFoundException;
    List<MetaData> saveList(Database database,Connection connection);
    List<MetaData> getMetaData(String connectionId, Date version);
    List<MetaData> getMetaData(Connection connection);
    List<MetaData> getMetaDataByConnectId(String connectionId);
    List<MetaData> getMetaDataByConnectsId(List<String> connectionId);
    List<String> getMetaDataDataById(String id) throws NotFoundException;
    void deleteByConnectionId(String connectionId);
    List<MetaData> getMetaDataLastVersionByConnects(List<Connection> connections);
    void delete(MetaData metaData);
}
