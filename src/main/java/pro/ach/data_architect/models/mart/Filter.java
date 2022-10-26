package pro.ach.data_architect.models.mart;

import lombok.Data;

@Data
public class Filter {
    private String column;
    private String conditionType;
    private String conditionValues;
    private String conditionMin;
    private String conditionMax;
    private String connectId;
    private String schema;
    private String metadataName;
    private String metadataId;
    private String columnName;
}
