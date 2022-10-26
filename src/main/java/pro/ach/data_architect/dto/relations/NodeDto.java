package pro.ach.data_architect.dto.relations;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;
import pro.ach.data_architect.models.MetaData;

@Data
@JsonNaming(PropertyNamingStrategy.SnakeCaseStrategy.class)
public class NodeDto {
    private String group;
    private String id;
    private String table_comment;
    private String table_name;
    private String table_short_comment;
    private String table_short_name;
    private String left;
    private String top;
    private String type = "table";
    private List<ColumnDto> columns = new ArrayList<>();
    private DataNodeDto data;

    public NodeDto(
            String group,
            String id,
            String table_comment,
            String table_name,
            String table_short_comment,
            String table_short_name,
            List<ColumnDto> columns,
            DataNodeDto data
    ) {
        this.group = group;
        this.id = id;
        this.table_comment = table_comment;
        this.table_name = table_name;
        this.table_short_comment = table_short_comment;
        this.table_short_name = table_short_name;
        this.columns = columns;
        this.data = data;
    }

    public static NodeDto create(MetaData metaData) {
        return new NodeDto(
                metaData.getConnectId(),
                metaData.getConnectId()+"_"+metaData.getId()+"_"+metaData.getName(),
                metaData.getComment(),
                metaData.getName(),
                metaData.getComment(),
                metaData.getName(),
                metaData.getColumns()
                        .stream()
                        .map(ColumnDto::create)
                        .collect(Collectors.toList()),
                new DataNodeDto(
                        metaData.getConnectId(),
                        metaData.getName(),
                        metaData.getSchema()
                )
        );
    }

    public NodeDto() {
    }
}
