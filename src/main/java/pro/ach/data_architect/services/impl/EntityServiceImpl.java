package pro.ach.data_architect.services.impl;

import java.util.List;

import javax.ws.rs.NotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import pro.ach.data_architect.models.Entity;
import pro.ach.data_architect.models.MetaData;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.repositories.ConnectionRepository;
import pro.ach.data_architect.repositories.EntityRepository;
import pro.ach.data_architect.repositories.MetaDataRepository;
import pro.ach.data_architect.services.EntityService;

@Component
public class EntityServiceImpl implements EntityService {

  private final EntityRepository entityRepository;
  private final ConnectionRepository connectorRepository;
  private final MetaDataRepository metaDataRepository;

  // ----------------------------------------------------------------------------------------------
  @Autowired
  public EntityServiceImpl(EntityRepository entityRepository, ConnectionRepository connectorRepository,
      MetaDataRepository metaDataRepository) {
    this.entityRepository = entityRepository;
    this.connectorRepository = connectorRepository;
    this.metaDataRepository = metaDataRepository;
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public Page<Entity> getAll(Pageable pageable) {
    return entityRepository.findAll(pageable);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public List<Entity> getAll() {
    return entityRepository.findAll();
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public Entity findById(String id) {
    return entityRepository.findById(id).orElse(null);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public Entity save(Entity entity) {
    Connection connection = connectorRepository.findById(entity.getConnectId())
        .orElseThrow(() -> new NotFoundException("connection not found"));
    MetaData metaData = metaDataRepository.findById(entity.getMetadataId())
        .orElseThrow(() -> new NotFoundException("meta data not found"));
    entity.setConnectionName(connection.getName());
    entity.setSchema(connection.getSchema());
    entity.setMetadataName(metaData.getName());
    return entityRepository.save(entity);
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public void delete(Entity entity) {
    this.entityRepository.delete(entity);
  }
}
