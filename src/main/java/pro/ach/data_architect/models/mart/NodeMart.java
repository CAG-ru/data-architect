package pro.ach.data_architect.models.mart;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import lombok.Data;
import pro.ach.data_architect.models.MetaData;

@Data
public class NodeMart {
    private String connectId;
    private String id;
    private String description;
    private String tableName;
    private String metadataName;
    private String type = "table";
    private List<ColumnMart> columns = new ArrayList<>();
    private DataNode data;
    private Boolean selected=false;
    private String name;
    private String left;
    private String top;
    private String destPath;
    private List<Relate> relates=new ArrayList<>();
    private List<Filter> filters=new ArrayList<>();


    public NodeMart(String connectId, String id, String description, String table_name, String metadata_name, String type, List<ColumnMart> columns, DataNode data, Boolean selected, String destPath) {
        this.connectId = connectId;
        this.id = id;
        this.description = description;
        this.tableName = ":"+table_name;
        this.metadataName = metadata_name;
        this.type = type;
        this.columns = columns;
        this.data = data;
        this.selected = selected;
        this.name = "";
        this.destPath = destPath;
    }

    public static NodeMart create(MetaData metaData) {
        return new NodeMart(
                metaData.getConnectId(),
                metaData.getId(),
                metaData.getComment(),
                metaData.getName(),
                metaData.getName(),
                "table",
                metaData.getColumns()
                        .stream()
                        .map(column -> ColumnMart.create(column,metaData.getId()))
                        .collect(Collectors.toList()),
                new DataNode(
                        metaData.getConnectId(),
                        metaData.getName(),
                        metaData.getSchema(),
                        metaData.getId()
                ),
                false,
                metaData.getDestPath()
        );
    }

    public NodeMart() {
    }

    public String[] getSelectedColumns(){
        return columns.stream()
                .filter(ColumnMart::getSelected)
                .map(ColumnMart::getName)
                .toArray(String[]::new);
    }
}
