package pro.ach.data_architect.builders;

import pro.ach.data_architect.dto.relations.EdgeDto;
import pro.ach.data_architect.models.Relation;

import java.util.Arrays;
import java.util.concurrent.atomic.AtomicInteger;

public class RelationBuilder {

    public static Relation create(EdgeDto edge) {
        Relation relation = new Relation();
        relation.setId(edge.getData().getRelationId());
        relation.setDestConnectionId(edge.getData().getDestConnectId());
        relation.setSourceConnectionId(edge.getData().getSourceConnectId());
        relation.setRelationType(edge.getData().getType());

        relation.setSourceMetaDataId(getMetaDataId(edge.getSource()));
        relation.setDestMetaDataId(getMetaDataId(edge.getTarget()));

        relation.setSourceMetaDataName(getTableNameFromEdgeSource(edge.getSource()));
        relation.setDestMetaDataName(getTableNameFromEdgeSource(edge.getTarget()));
        relation.setSourceColumnName(getColumnNameFromEdgeSource(edge.getSource()));
        relation.setDestColumnName(getColumnNameFromEdgeSource(edge.getTarget()));
        return relation;
    }


    public static String getMetaDataId(String source) {
        String[] strs = source.split("_");
        return strs.length > 1 ? strs[1] : null;
    }

    public static String getTableNameFromEdgeSource(String source) {
        AtomicInteger index = new AtomicInteger();
        String str = String.join(
                "_",
                Arrays.stream(source.split("_"))
                        .filter(item -> index.getAndIncrement() >= 2)
                        .toArray(String[]::new)
        );
        String[] strs = str.split("\\.");
        return strs.length > 1 ? strs[0] : null;
    }

    public static String getColumnNameFromEdgeSource(String source) {
        AtomicInteger index = new AtomicInteger();
        String str = String.join(
                "_",
                Arrays.stream(
                                source.split("_"))
                        .filter(item -> index.getAndIncrement() >= 2)
                        .toArray(String[]::new)
        );
        String[] strs = str.split("\\.");
        return strs.length > 1 ? strs[1] : null;
    }
}
