package pro.ach.data_architect.models.mart;

import lombok.Data;
import pro.ach.data_architect.models.connection.Column;

@Data
public class ColumnMart {
    private String name;
    private String comment;
    private String description;
    private String id;
    private String datatype;
    private Boolean primarykey;
    private Boolean selected;

    public ColumnMart(String name, String description, String id, String datatype, Boolean primarykey, Boolean selected) {
        this.name = name;
        this.comment = description;
        this.description = description;
        this.id = id;
        this.datatype = datatype;
        this.primarykey = primarykey;
        this.selected = selected;
    }

    public static ColumnMart create(Column column, String metadataId) {
        return new ColumnMart(
                column.getName(),
                column.getComment(),
                metadataId+"_"+column.getName(),
                column.getType(),
                column.getUnique(),
                false
        );
    }

    public ColumnMart() {
    }
}
