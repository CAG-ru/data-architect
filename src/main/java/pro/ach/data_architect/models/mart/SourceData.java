package pro.ach.data_architect.models.mart;

import lombok.Data;

@Data
public class SourceData {
    private String columnName;
    private String metadataId;
    private String metadataName;

    public SourceData(String columnName, String metadataId, String metadataName) {
        this.columnName = columnName;
        this.metadataId = metadataId;
        this.metadataName = metadataName;
    }

    public SourceData() {
    }
}
