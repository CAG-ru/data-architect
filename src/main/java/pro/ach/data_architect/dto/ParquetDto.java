package pro.ach.data_architect.dto;

import lombok.Data;
import pro.ach.data_architect.models.MetaData;

@Data
public class ParquetDto {
    private Long count;
    private Boolean isSuccess;
    private MetaData data;
}
