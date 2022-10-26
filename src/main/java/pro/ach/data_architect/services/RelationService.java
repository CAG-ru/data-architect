package pro.ach.data_architect.services;

import javassist.NotFoundException;
import pro.ach.data_architect.dto.relations.EdgeDto;
import pro.ach.data_architect.models.MetaData;
import pro.ach.data_architect.models.Relation;
import pro.ach.data_architect.models.connection.Connection;

import java.util.List;

public interface RelationService {
    List<Relation> getAll();
    Relation findById(String id);
    Relation save(Relation relation) throws NotFoundException;
    Relation save(EdgeDto edgeDto) throws NotFoundException;
    List<Relation> saveList(List<EdgeDto> edgeDto);
    Boolean check(Relation relation);
    List<Relation> getRelationsByConnectionId(String  id);
    List<Relation> getRelationsByConnectionsId(List<String>  ids);
    Long deleteByIds(List<String>  ids);
    List<Relation> getRelationsByMetadata(List<MetaData> metaData);
    List<Relation> saveRelationsForMetaData(List<MetaData> metaData, Connection connection, List<Relation> relations);
}
