package pro.ach.data_architect.models.mart;

import lombok.Data;
import pro.ach.data_architect.models.Relation;

@Data
public class EdgeMart {
    private String target;
    private String source;
    private Boolean directed;
    private DataEdge data;
    private SourceData sourceData;
    private SourceData targetData;

    public EdgeMart(String target, String source, Boolean directed, DataEdge data, SourceData sourceData, SourceData targetData) {
        this.target = target;
        this.source = source;
        this.directed = directed;
        this.data = data;
        this.sourceData = sourceData;
        this.targetData = targetData;
    }

    public static EdgeMart create(Relation relation){
        return new EdgeMart(
                relation.getSourceMetaDataId()+"."+relation.getSourceMetaDataId()+"_"+relation.getSourceColumnName(),
                relation.getDestMetaDataId()+"."+relation.getDestMetaDataId()+"_"+relation.getDestColumnName(),
                false,
                new DataEdge("bidirectional"),
                new SourceData(
                        relation.getSourceColumnName(),
                        relation.getSourceMetaDataId(),
                        relation.getSourceMetaDataName()
                ),
                new SourceData(
                        relation.getDestColumnName(),
                        relation.getDestMetaDataId(),
                        relation.getDestMetaDataName()
                )
        );
    }

    public EdgeMart() {
    }

}
