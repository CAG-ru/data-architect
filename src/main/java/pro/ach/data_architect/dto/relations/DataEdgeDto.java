package pro.ach.data_architect.dto.relations;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategy.SnakeCaseStrategy.class)
public class DataEdgeDto {
    private String destConnectId;
    private String relationId;
    private String sourceConnectId;
    private String type;

    public DataEdgeDto(String destConnectId, String relationId, String sourceConnectId, String type) {
        this.destConnectId = destConnectId;
        this.relationId = relationId;
        this.sourceConnectId = sourceConnectId;
        this.type = type;
    }

    public DataEdgeDto() {
    }
}
