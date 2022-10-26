package pro.ach.data_architect.services.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import javassist.NotFoundException;
import lombok.RequiredArgsConstructor;
import pro.ach.data_architect.builders.RelationBuilder;
import pro.ach.data_architect.dto.relations.EdgeDto;
import pro.ach.data_architect.models.MetaData;
import pro.ach.data_architect.models.Relation;
import pro.ach.data_architect.models.connection.Connection;
import pro.ach.data_architect.models.relation.enums.RelationType;
import pro.ach.data_architect.repositories.MetaDataRepository;
import pro.ach.data_architect.repositories.RelationRepository;
import pro.ach.data_architect.services.RelationService;

@Service
@RequiredArgsConstructor
public class RelationServiceImpl implements RelationService {
    private final RelationRepository relationRepository;
    private final MetaDataRepository metaDataRepository;


    @Override
    public List<Relation> getAll() {
        return relationRepository.findAll();
    }

    @Override
    public Relation findById(String id) {
        return relationRepository.findById(id).orElse(null);
    }

    @Override
    public Relation save(Relation relation) throws NotFoundException {
        Relation result = null;
        result = relationRepository.findRelation(
                relation.getSourceConnectionId(),
                relation.getSourceMetaDataName(),
                relation.getSourceColumnName(),
                relation.getDestConnectionId(),
                relation.getDestMetaDataName(),
                relation.getDestColumnName()

        );

        if (relation.getRelationType().equals(RelationType.FOREIGN) || relation.getRelationType().equals(RelationType.MANUAL)) {
            relation.setIsConfirmed(true);
        }

        if (relation.getSourceMetaDataId() == null) {
            throw new NotFoundException("Relation dosen't have source meta id");
        }

        if (relation.getDestMetaDataId() == null) {
            throw new NotFoundException("Relation dosen't have dest meta id");
        }

        if (result == null) {
            result = relationRepository.save(relation);
        }
        return result;
    }

    @Override
    public Relation save(EdgeDto edgeDto) throws NotFoundException {
        Relation relation = RelationBuilder.create(edgeDto);
        return this.save(relation);
    }

    @Override
    public List<Relation> saveList(List<EdgeDto> edgesDto) {
        List<Relation> result = new ArrayList<>();
        edgesDto.forEach(edgeDto -> {
            try {
                result.add(this.save(edgeDto));
            } catch (NotFoundException e) {
                e.printStackTrace();
            }
        });
        return result;
    }

    @Override
    public Boolean check(Relation relation) {
        return true;
    }

    @Override
    public List<Relation> getRelationsByConnectionId(String id) {
        return relationRepository.getRelationByDestConnectionIdOrSourceConnectionId(id);
    }

    @Override
    public List<Relation> getRelationsByConnectionsId(List<String> ids) {
        return relationRepository.getRelationByDestConnectionIdIn(ids);
    }

    @Override
    public List<Relation> getRelationsByMetadata(List<MetaData> metaData) {
        return relationRepository.getRelationByDestMetaDataIdInOrSourceMetaDataIdIn(
                metaData.stream().map(MetaData::getId).collect(Collectors.toList())
        );
    }

    @Override
    public List<Relation> saveRelationsForMetaData(List<MetaData> metaData,Connection connection, List<Relation> relations) {
        relations.forEach(relation -> {
            if (
                    connection
                            .getSchemasWithTables()
                            .contains(

                                    relation.getSourceSchema() + "." +
                                            relation.getSourceMetaDataName()
                            )
                            &&
                            connection
                                    .getSchemasWithTables()
                                    .contains(
                                            relation.getDestSchema() + "." +
                                                    relation.getDestMetaDataName()
                                    )
            ) {
                MetaData metaDataSource = metaData
                        .stream()
                        .filter(data -> data.getName().equals(relation.getSourceMetaDataName()))
                        .findFirst().orElse(null);
                MetaData metaDataDest = metaData
                        .stream()
                        .filter(data -> data.getName().equals(relation.getDestMetaDataName()))
                        .findFirst().orElse(null);
                if (metaDataSource != null && metaDataDest != null) {
                    relation.setSourceConnectionId(connection.getId());
                    relation.setDestConnectionId(connection.getId());
                    relation.setDestSchema(connection.getSchema());
                    relation.setRelationType(RelationType.FOREIGN.toString());
                    relation.setSourceSchema(connection.getSchema());
                    relation.setSourceMetaDataId(metaDataSource.getId());
                    relation.setDestMetaDataId(metaDataDest.getId());
                    relation.setSourceSchema(connection.getSchema());
                    relation.setIsConfirmed(true);
                    try {
                        save(relation);
                    } catch (NotFoundException e) {
                        e.printStackTrace();
                    }
                }
            }
        });

        return relations;
    }

    @Override
    public Long deleteByIds(List<String> ids) {
        return relationRepository.deleteByIdIn(ids);
    }


}
