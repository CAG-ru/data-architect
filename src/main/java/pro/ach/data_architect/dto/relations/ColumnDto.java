package pro.ach.data_architect.dto.relations;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;
import pro.ach.data_architect.models.connection.Column;

@Data
@JsonNaming(PropertyNamingStrategy.SnakeCaseStrategy.class)
public class ColumnDto {
    private String column_name;
    private String column_short_name;
    private String column_title;
    private String column_short_title;
    private String id;
    private String datatype;
    private Boolean primarykey;

    public ColumnDto(String column_name, String column_short_name, String column_title, String column_short_title, String id, String datatype, Boolean primarykey) {
        this.column_name = column_name;
        this.column_short_name = column_short_name;
        this.column_title = column_title;
        this.column_short_title = column_short_title;
        this.id = id;
        this.datatype = datatype;
        this.primarykey = primarykey;
    }

    public static ColumnDto create(Column column) {
        return new ColumnDto(
                column.getName(),
                "",
                column.getName(),
                column.getName(),
                column.getName(),
                column.getType(),
                column.getUnique()
        );
    }

    public ColumnDto() {
    }
}
