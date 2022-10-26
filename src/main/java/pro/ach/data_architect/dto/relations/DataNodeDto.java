package pro.ach.data_architect.dto.relations;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategy.SnakeCaseStrategy.class)
public class DataNodeDto {
    private String connect_id;
    private String name;
    private String schema;

    public DataNodeDto(String connect_id, String name, String schema) {
        this.connect_id = connect_id;
        this.name = name;
        this.schema = schema;
    }

    public DataNodeDto() {
    }
}
