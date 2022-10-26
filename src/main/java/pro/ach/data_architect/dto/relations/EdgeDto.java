package pro.ach.data_architect.dto.relations;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;
import pro.ach.data_architect.models.Relation;

@Data
@JsonNaming(PropertyNamingStrategy.SnakeCaseStrategy.class)
public class EdgeDto {
    private String target;
    private String source;
    private DataEdgeDto data;

    public EdgeDto(String target, String source, DataEdgeDto data) {
        this.target = target;
        this.source = source;
        this.data = data;
    }

    public static EdgeDto create(Relation relation){
        return new EdgeDto(
                relation.getSourceConnectionId()+"_"+relation.getSourceMetaDataId()+"_"+relation.getSourceMetaDataName()+"."+relation.getSourceColumnName(),
                relation.getDestConnectionId()+"_"+relation.getDestMetaDataId()+"_"+relation.getDestMetaDataName()+"."+relation.getDestColumnName(),
                new DataEdgeDto(
                        relation.getDestConnectionId(),
                        relation.getId(),
                        relation.getSourceConnectionId(),
                        relation.getRelationType()
                )
        );
    }

    public EdgeDto() {
    }

}
