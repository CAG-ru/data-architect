package pro.ach.data_architect.models.connection;

import lombok.Data;

@Data
public class RelationInfo {
    private Integer countForeignKeys;
    private Integer countManuallyKeys;
    private Integer countAutoKeys;
}
