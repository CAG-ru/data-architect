package pro.ach.data_architect.models.mart;

import lombok.Data;

@Data
public class DataNode {
    private String connectId;
    private String name;
    private String schema;
    private String metadataId;

    public DataNode(String connectId, String name, String schema, String metadataId) {
        this.connectId = connectId;
        this.name = name;
        this.schema = schema;
        this.metadataId = metadataId;
    }

    public DataNode() {
    }
}
