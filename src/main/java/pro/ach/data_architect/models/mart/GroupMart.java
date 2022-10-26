package pro.ach.data_architect.models.mart;

import lombok.Data;
import pro.ach.data_architect.models.connection.Connection;

@Data
public class GroupMart {
    private Integer ci_index;
    private String id;
    private String name;
    private String title;
    private String left;
    private String top;

    public GroupMart(Integer ci_index, String id, String name, String title) {
        this.ci_index = ci_index;
        this.id = id;
        this.name = name;
        this.title = title;
    }

    public static GroupMart create(Connection connection, Integer index){
        return new GroupMart(
                index,
                connection.getId(),
                connection.getId(),
                connection.getName()
        );
    }

    public GroupMart() {
    }
}
