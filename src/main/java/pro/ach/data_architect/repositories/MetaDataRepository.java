package pro.ach.data_architect.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import pro.ach.data_architect.models.MetaData;

import java.util.Date;
import java.util.List;

public interface MetaDataRepository extends MongoRepository<MetaData,String>, QuerydslPredicateExecutor<MetaData> {
    List<MetaData> getMetaDataByConnectId(String connectionId);
    List<MetaData> getMetaDataByConnectIdIn(List<String> connectionId);
    MetaData getMetaDataByVersion(Date version);
    MetaData getMetaDataByConnectIdAndName(String connectionId,String name);
    void deleteByConnectId(String connectionId);
}
