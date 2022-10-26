package pro.ach.data_architect.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import pro.ach.data_architect.models.Relation;

public interface RelationRepository extends MongoRepository<Relation,String> {
    @Query("{$and:[" +
            "{sourceConnectionId:?0}," +
            "{sourceMetaDataName:?1}," +
            "{sourceColumnName:?2}," +
            "{destConnectionId:?3}," +
            "{destMetaDataName:?4}," +
            "{destColumnName:?5}," +
            "]}")
    Relation findRelation(String sourceConnectionId,
            String sourceMetaDataName,
            String sourceColumnName,
            String destConnectionId,
            String destMetaDataName,
            String destColumnName);
    List<Relation> getRelationByDestConnectionIdOrSourceConnectionId(String id);
    List<Relation> getRelationByDestConnectionIdIn(List<String> ids);


    @Query(value = "{$or: [{destMetaDataId: { $in: ?0}},{sourceMetaDataId:{$in : ?0}},]}")
    List<Relation> getRelationByDestMetaDataIdInOrSourceMetaDataIdIn(List<String> ids);

    Long deleteByIdIn(List<String> ids);

    @Query(value = "{$or: [{sourceConnectionId:?0},{destConnectionId:?0},]}",delete = true)
    void deleteByConnectionId(String connectionId);

    @Query("{$where: \"this.sourceConnectionId != this.destConnectionId\"}")
    List<Relation> getForeignRelations();
}
