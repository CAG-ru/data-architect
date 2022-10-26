package pro.ach.data_architect.services.impl;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.validation.constraints.NotNull;

import com.querydsl.core.types.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javassist.NotFoundException;
import pro.ach.data_architect.models.MetaData;
import pro.ach.data_architect.models.QMetaData;
import pro.ach.data_architect.models.Relation;
import pro.ach.data_architect.models.connection.Column;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.connection.Database;
import pro.ach.data_architect.models.connection.enums.TypeSource;
import pro.ach.data_architect.repositories.ConnectionRepository;
import pro.ach.data_architect.repositories.MetaDataRepository;
import pro.ach.data_architect.services.MetaDataHelper;
import pro.ach.data_architect.services.MetaDataService;
import pro.ach.data_architect.services.ParquetService;
import pro.ach.data_architect.services.RelationService;

@Service
public class MetaDataServiceImpl implements MetaDataService {

  private MetaDataRepository metaDataRepository;
  private ConnectionRepository connectorRepository;
  private RelationService relationService;
  private ParquetService parquetService;

  // ----------------------------------------------------------------------------------------------
  @Autowired
  public MetaDataServiceImpl(MetaDataRepository metaDataRepository, ConnectionRepository connectorRepository,
      RelationService relationService, ParquetService parquetService) {
    this.metaDataRepository = metaDataRepository;
    this.connectorRepository = connectorRepository;
    this.relationService = relationService;
    this.parquetService = parquetService;
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<MetaData> getAll() {
    return this.metaDataRepository.findAll();

  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public MetaData findById(String id) {
    return this.metaDataRepository.findById(id).orElse(null);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public MetaData save(MetaData metaData) {
    return this.metaDataRepository.save(metaData);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public MetaData saveColumn(MetaData metaData, Column column) throws NotFoundException {
    List<Column> columns = metaData.getColumns().stream().map(c -> c.getName().equals(column.getName()) ? column : c)
        .collect(Collectors.toList());

    metaData.setColumns(columns);

    metaDataRepository.save(metaData);
    return metaData;
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<MetaData> saveList(Database database, Connection connection) {
    List<MetaData> result = new ArrayList<>();
    Date currentVersion = new Date();
    List<Relation> relations = new ArrayList<>();
    database.getSchemas().forEach(schema -> {
      schema.getTables().stream()
          .filter(table -> connection.getTypeSource().equals(TypeSource.DB)
              ? connection.getSchemasWithTables().contains(schema.getName() + "." + table.getName())
              : true)
          .forEach(table -> {
            MetaData metaData = new MetaData();
            metaData.setVersion(currentVersion);
            metaData.setFilePath(table.getFilePath());
            metaData.setConnectId(connection.getId());
            metaData.setColumns(table.getColumns());
            metaData.setColumns(table.getColumns());
            metaData.setName(table.getName());
            metaData.setSchema(schema.getName());
            metaData.setChunks(1);
            metaData.setDestPath(MetaDataHelper.generatePath(connection, metaData));
            metaData = this.metaDataRepository.save(metaData);
            result.add(metaData);
            relations.addAll(table.getRelations());

          });
    });

    relationService.saveRelationsForMetaData(result, connection, relations);
    connection.setLastVersion(currentVersion);
    connectorRepository.save(connection);
    return result;
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<MetaData> getMetaData(@NotNull String connectionId, @NotNull Date version) {
    QMetaData qMetaData = new QMetaData("meta");
    Predicate result = qMetaData.connectId.eq(connectionId).and(qMetaData.version.eq(version));
    return (List<MetaData>) metaDataRepository.findAll(result);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<MetaData> getMetaData(Connection connection) {
    QMetaData qMetaData = new QMetaData("meta");
    Predicate result = qMetaData.connectId.eq(connection.getId())
        .and(qMetaData.version.eq(connection.getLastVersion()));
    return (List<MetaData>) metaDataRepository.findAll(result);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<MetaData> getMetaDataByConnectId(String connectionId) {
    return this.metaDataRepository.getMetaDataByConnectId(connectionId);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<MetaData> getMetaDataByConnectsId(List<String> connectionsId) {
    return this.metaDataRepository.getMetaDataByConnectIdIn(connectionsId);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<MetaData> getMetaDataLastVersionByConnects(List<Connection> connections) {
    return this.metaDataRepository
        .getMetaDataByConnectIdIn(connections.stream().map(Connection::getId).collect(Collectors.toList())).stream()
        .filter(metaData -> connections.stream()
            .filter(connection -> connection.getId().equals(metaData.getConnectId())
                && connection.getLastVersion().compareTo(metaData.getVersion()) == 0)
            .count() >= 1)

        .collect(Collectors.toList());
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public void delete(MetaData metaData) {
    metaDataRepository.delete(metaData);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<String> getMetaDataDataById(String id) throws NotFoundException {
    MetaData metaData = this.metaDataRepository.findById(id).orElse(null);
    if (metaData == null) {
      throw new NotFoundException("meta data not found");
    }

    return parquetService.retrieveParquetFileFromPath(metaData.getDestPath());
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public void deleteByConnectionId(String connectionId) {
    metaDataRepository.deleteByConnectId(connectionId);
  }

}
