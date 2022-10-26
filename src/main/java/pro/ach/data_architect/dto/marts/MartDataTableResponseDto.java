package pro.ach.data_architect.dto.marts;

import java.util.List;

import lombok.Data;
import pro.ach.data_architect.models.mart.ColumnMart;
import pro.ach.data_architect.models.mart.TableData;

@Data
public class MartDataTableResponseDto {
    private List<TableData> tableData;
    private List<ColumnMart> tableColumns;
}
