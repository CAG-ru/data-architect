package pro.ach.data_architect.services.impl;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.springframework.beans.BeanUtils;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javassist.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import pro.ach.data_architect.dto.ParquetDto;
import pro.ach.data_architect.exceptions.classes.DataStoreNotFoundException;
import pro.ach.data_architect.models.DataStore;
import pro.ach.data_architect.models.MetaData;
import pro.ach.data_architect.models.Relation;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.connection.Database;
import pro.ach.data_architect.models.connection.RelationInfo;
import pro.ach.data_architect.models.connection.enums.NestingLevel;
import pro.ach.data_architect.models.connection.enums.TypeConnection;
import pro.ach.data_architect.repositories.ConnectionRepository;
import pro.ach.data_architect.repositories.MetaDataRepository;
import pro.ach.data_architect.repositories.RelationRepository;
import pro.ach.data_architect.services.BeanHelper;
import pro.ach.data_architect.services.ConnectService;
import pro.ach.data_architect.services.DataStoreService;
import pro.ach.data_architect.services.Encoder;
import pro.ach.data_architect.services.FileService;
import pro.ach.data_architect.services.MetaDataService;
import pro.ach.data_architect.services.RelationService;
import pro.ach.data_architect.services.connectors.handler.DataSourceHanlerI;
import pro.ach.data_architect.services.connectors.handler.HandlerHelper;

@Service
@RequiredArgsConstructor
@Log4j2
public class ConnectServiceImpl implements ConnectService {
  private final ConnectionRepository connectionRepository;
  private final DataStoreService dataStoreService;
  private final MetaDataService metaDataService;
  private final MetaDataRepository metaDataRepository;
  private final FileService fileService;
  private final RelationRepository relationRepository;
  private final Encoder encoder;
  private final BeanHelper beanHelper;
  private final RelationService relationService;
  private final HandlerHelper handlerHelper;

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<Connection> getAll() {
    return connectionRepository.findAll();
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public Connection findById(String id) {
    return connectionRepository.findById(id).orElse(null);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<Connection> findByTypeConnection(TypeConnection typeConnection) {
    return connectionRepository.findConnectionByTypeConnection(typeConnection);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public Connection save(Connection connector) {
    if (connector.getDestPath() == null || connector.getDestPath().length() == 0) {
      DataStore mainStore = this.dataStoreService.getMainStore();
      if (mainStore.getId() != null) {
        connector.setDestPath(String.format("%s/%s", mainStore.getPath(), connector.getName()));
      }
    }

    if (connector.getId() != null && connector.getId().trim().length() > 0) {
      Connection finalConnector = connector;
      Connection sourceConncetion = connectionRepository.findById(connector.getId())
          .orElseThrow(() -> new javax.ws.rs.NotFoundException(
              String.format("connection not found with id : %s", finalConnector.getId())));

      BeanUtils.copyProperties(connector, sourceConncetion, beanHelper.getNullPropertyNames(connector));
      connector = connectionRepository.save(sourceConncetion);
    } else {
      connector = connectionRepository.save(connector);
    }
    log.info("saved connection: {}", connector);
    return connector;
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public Connection getMainConnect() {
    return findByTypeConnection(TypeConnection.MARTS).stream().findFirst().orElse(null);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<Connection> getLoadedSourceConnections() {
    return connectionRepository.findConnectionByLastVersionNotNullAndTypeConnection(TypeConnection.SOURCE);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<Connection> getConnectionsById(List<String> connectionsId) {
    return connectionRepository.findConnectionsByIdIn(connectionsId);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  @Async
  public Connection loadData(DataSourceHanlerI handler)
      throws SQLException, DataStoreNotFoundException, InterruptedException {
    log.info("loading data for connection: {}", handler.getConnection());
    DataStore mainStore = dataStoreService.getMainStore();
    if (mainStore.getId() == null) {
      throw new DataStoreNotFoundException("data store not created");
    }
    if (handler.getConnection().getDestPath() == null || handler.getConnection().getDestPath().equals("")) {
      save(handler.getConnection());
    }

    RelationInfo relationInfo = new RelationInfo();
    relationInfo.setCountAutoKeys(0);
    relationInfo.setCountManuallyKeys(0);
    final Database database = handler.getDatabase(NestingLevel.COLUMN);

    List<MetaData> metaData = metaDataService.saveList(database, handler.getConnection());

    relationInfo.setCountForeignKeys(database.getRelations().size());

    handler.getConnection().setRelationInfo(relationInfo);
    save(handler.getConnection());
    loadData(database, metaData, handler);
    return handler.getConnection();
  }

  // ----------------------------------------------------------------------------------------------
  @Async
  public void loadData(Database database, List<MetaData> metaData, DataSourceHanlerI handler)
      throws InterruptedException {
    Integer chunks = handler.getConnection().getChunks();

    ExecutorService service = Executors.newFixedThreadPool(chunks == null ? 1 : chunks);

    List<Callable<ParquetDto>> list = new ArrayList<>();
    for (MetaData data : metaData) {
      list.add(() -> handler.saveToParquet(data));
    }
    List<Future<ParquetDto>> futures = service.invokeAll(list);

    futures.forEach(resultFuture -> {
      ParquetDto result = null;
      try {
        result = resultFuture.get();
      } catch (InterruptedException e) {
        e.printStackTrace();
      } catch (ExecutionException e) {
        e.printStackTrace();
      }
      if (result == null || result.getIsSuccess() == null || !result.getIsSuccess()) {
        metaDataService.delete(result.getData());
      } else {
        result.getData().setRows(result.getCount());
        metaDataService.save(result.getData());
      }
    });
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public void clear(String id) throws NotFoundException {
    Connection connection = findById(id);
    clear(connection);
  }

  // ----------------------------------------------------------------------------------------------
  public void clear(Connection connection) throws NotFoundException {
    if (connection == null) {
      throw new NotFoundException("entity not found");
    }
    log.info("deleting directory: {}", connection.getDestPath());

    fileService.delete(connection.getDestPath());
    log.info("deleting metadatas for connection: {}", connection);

    metaDataService.deleteByConnectionId(connection.getId());

    log.info("deleting relations for connection: {}", connection);
    relationRepository.deleteByConnectionId(connection.getId());
    connection.setLastVersion(new Date(0));
    connectionRepository.save(connection);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public void delete(String id) throws NotFoundException {
    Connection connection = findById(id);
    fileService.delete(connection.getDestPath());
    clear(connection);
    connectionRepository.delete(connection);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<Connection> getRelatedConnectionsByConnection(Connection connection) {
    List<String> ids = new ArrayList<>();
    int offset = 0;
    ids.add(connection.getId());
    List<Relation> foreignRelations = relationRepository.getForeignRelations();
    while (offset < ids.size()) {
      int finalOffset = offset;
      foreignRelations.stream().filter(relation -> relation.hasConnection(ids.get(finalOffset)))
          .map(relation -> relation.getOpportunityConnectionId(ids.get(finalOffset))).forEach(id -> {
            if (!ids.contains(id)) {
              ids.add(id);
            }
          });
      offset++;
    }
    return connectionRepository.findConnectionsByIdIn(ids);
  }

  // ----------------------------------------------------------------------------------------------
  @Async
  @Override
  public Connection loadRelationsForConnection(Connection connection) throws SQLException {
    DataSourceHanlerI handler = handlerHelper.getHandler(connection);
    handler.setConnection(connection);
    Database database = handler.getDatabase(NestingLevel.COLUMN);
    List<Connection> connections = new ArrayList<>();
    connections.add(connection);
    relationService.saveRelationsForMetaData(metaDataService.getMetaDataLastVersionByConnects(connections), connection,
        database.getRelations());
    return connection;
  }
}
