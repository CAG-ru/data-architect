package pro.ach.data_architect.dto.relations;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;
import pro.ach.data_architect.models.connection.Connection;

@Data
@JsonNaming(PropertyNamingStrategy.SnakeCaseStrategy.class)
public class GroupDto {
    private Integer ci_index;
    private String id;
    private String name;
    private String title;
    private String left;
    private String top;

    public GroupDto(Integer ci_index, String id, String name, String title) {
        this.ci_index = ci_index;
        this.id = id;
        this.name = name;
        this.title = title;
    }

    public static GroupDto create(Connection connection,Integer index){
        return new GroupDto(
                index,
                connection.getId(),
                connection.getId(),
                connection.getName()
        );
    }

    public GroupDto() {
    }
}
